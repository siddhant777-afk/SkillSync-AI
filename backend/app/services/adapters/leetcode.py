"""
LeetCode Platform Adapter
Interacts with official LeetCode GraphQL endpoint.
Preserves Easy / Medium / Hard difficulty classifications, contest ratings & badges,
algorithmic depth topic analysis, and submission calendar timestamps.
"""

from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Optional
import httpx

from .base import (
    Availability,
    BasePlatformAdapter,
    Confidence,
    ProvenanceMetric,
)


class LeetCodeAdapter(BasePlatformAdapter):
    PLATFORM_NAME = "leetcode"
    GRAPHQL_URL = "https://leetcode.com/graphql"

    GRAPHQL_QUERY = """
    query getUserFullStats($u: String!) {
      matchedUser(username: $u) {
        username
        submissionCalendar
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
          reputation
        }
        tagProblemCounts {
          advanced { tagName tagSlug problemsSolved }
          intermediate { tagName tagSlug problemsSolved }
          fundamental { tagName tagSlug problemsSolved }
        }
      }
      userContestRanking(username: $u) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge {
          name
        }
      }
      userContestRankingHistory(username: $u) {
        attended
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
    """

    @classmethod
    async def fetch_data(cls, username: str, timeout: float = 10.0) -> Dict[str, Any]:
        clean_user = (username or "").strip()
        now_iso = datetime.now(timezone.utc).isoformat()

        if not clean_user:
            return {
                "platform": cls.PLATFORM_NAME,
                "username": "",
                "status": "unconnected",
                "verified": False,
                "solved": 0,
                "easy": 0,
                "medium": 0,
                "hard": 0,
                "rank": "Unconnected",
                "contest_rating": 0,
                "contest_rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_CONNECTED).model_dump(),
                "contest_global_rank": 0,
                "contest_attended": 0,
                "contest_badge": "",
                "topic_counts": {},
                "topics": [],
                "algorithmic_depth_score": 0,
                "submissionCalendar": "{}",
                "monthly_submissions": {},
            }

        headers = {
            "User-Agent": "SkillSync-AI/1.0",
            "Referer": "https://leetcode.com",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
                res = await client.post(
                    cls.GRAPHQL_URL,
                    json={"query": cls.GRAPHQL_QUERY, "variables": {"u": clean_user}},
                )

                if res.status_code != 200:
                    return {
                        "platform": cls.PLATFORM_NAME,
                        "username": clean_user,
                        "status": "error",
                        "verified": False,
                        "solved": 0,
                        "rank": "Unavailable",
                        "contest_rating": 0,
                        "contest_rating_metric": ProvenanceMetric(
                            value=None, availability=Availability.UNAVAILABLE, source_timestamp=now_iso
                        ).model_dump(),
                    }

                data = res.json().get("data", {})
                matched = data.get("matchedUser")

                if not matched:
                    return {
                        "platform": cls.PLATFORM_NAME,
                        "username": clean_user,
                        "status": "not_found",
                        "verified": False,
                        "solved": 0,
                        "rank": "Not Found",
                        "contest_rating": 0,
                        "contest_rating_metric": ProvenanceMetric(
                            value=None, availability=Availability.NOT_FOUND, source_timestamp=now_iso
                        ).model_dump(),
                    }

                # 1. Solved Difficulty Counts (Easy / Medium / Hard)
                sub_stats = {
                    x["difficulty"]: x["count"]
                    for x in matched.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
                }
                total_solved = sub_stats.get("All", 0)
                easy_solved = sub_stats.get("Easy", 0)
                med_solved = sub_stats.get("Medium", 0)
                hard_solved = sub_stats.get("Hard", 0)

                # 2. Global Ranking & Percentile
                global_ranking = matched.get("profile", {}).get("ranking", 0)
                if global_ranking and global_ranking < 50000:
                    rank_str = "Top 5%"
                elif global_ranking and global_ranking < 150000:
                    rank_str = "Top 15%"
                elif global_ranking and global_ranking < 300000:
                    rank_str = "Top 25%"
                else:
                    rank_str = f"Rank #{global_ranking}" if global_ranking else "Active"

                # 3. Contest Telemetry
                contest_data = data.get("userContestRanking")
                if contest_data and contest_data.get("rating"):
                    raw_cr = round(contest_data.get("rating", 0))
                    contest_rating = raw_cr
                    contest_global_rank = contest_data.get("globalRanking", 0)
                    contest_attended = contest_data.get("attendedContestsCount", 0)
                    badge_info = contest_data.get("badge")
                    contest_badge = badge_info.get("name", "") if isinstance(badge_info, dict) else ""
                    contest_metric = ProvenanceMetric(
                        value=contest_rating,
                        availability=Availability.AVAILABLE,
                        confidence=Confidence.OFFICIAL_API,
                        source="leetcode_graphql_contest_ranking",
                        source_timestamp=now_iso,
                    )
                else:
                    contest_rating = 0
                    contest_global_rank = 0
                    contest_attended = 0
                    contest_badge = ""
                    contest_metric = ProvenanceMetric(
                        value=None,
                        availability=Availability.UNRATED,
                        confidence=Confidence.OFFICIAL_API,
                        source="leetcode_graphql_contest_ranking",
                        source_timestamp=now_iso,
                    )

                # Contest History from userContestRankingHistory
                contest_history = []
                raw_ch = data.get("userContestRankingHistory") or []
                for ch in raw_ch:
                    if ch.get("attended"):
                        c_obj = ch.get("contest") or {}
                        st = c_obj.get("startTime")
                        dt_str = datetime.fromtimestamp(st, tz=timezone.utc).isoformat() if st else None
                        contest_history.append({
                            "contest_id": c_obj.get("title", ""),
                            "contest_name": c_obj.get("title", ""),
                            "timestamp": dt_str,
                            "unix_timestamp": st,
                            "rating": round(ch.get("rating", 0)),
                            "rank": ch.get("ranking"),
                        })

                # 4. Tag Problem Counts & Algorithmic Depth Score
                tags_data = matched.get("tagProblemCounts") or {}
                adv_tags = tags_data.get("advanced") or []
                inter_tags = tags_data.get("intermediate") or []
                fund_tags = tags_data.get("fundamental") or []

                all_topics = []
                dp_specific = 0
                dp_and_adv = 0
                tag_map = {}

                for t in adv_tags:
                    name = t.get("tagName", "")
                    count = t.get("problemsSolved", 0)
                    if name:
                        tag_map[name.lower()] = count
                        if "dynamic programming" in name.lower():
                            dp_specific += count
                        dp_and_adv += count
                        all_topics.append({"name": name, "count": count, "tier": "Advanced Topics"})

                for t in inter_tags:
                    name = t.get("tagName", "")
                    count = t.get("problemsSolved", 0)
                    if name:
                        tag_map[name.lower()] = count
                        if "dynamic programming" in name.lower():
                            dp_specific += count
                            dp_and_adv += count
                        all_topics.append({"name": name, "count": count, "tier": "Core DSA"})

                for t in fund_tags:
                    name = t.get("tagName", "")
                    count = t.get("problemsSolved", 0)
                    if name:
                        tag_map[name.lower()] = count
                        all_topics.append({"name": name, "count": count, "tier": "Fundamentals"})

                all_topics.sort(key=lambda x: x["count"], reverse=True)

                # Algorithmic Depth (0-100)
                if total_solved > 0:
                    dp_sc = min(35, dp_specific * 2.0)
                    adv_sc = min(30, (dp_and_adv - dp_specific) * 0.8)
                    diff_qual = ((med_solved * 1.5 + hard_solved * 3.0) / max(1, total_solved)) * 25
                    vol_sc = min(10, total_solved * 0.05)
                    alg_depth = int(min(100, dp_sc + adv_sc + diff_qual + vol_sc))
                else:
                    alg_depth = 0

                # 5. Submission Calendar & Authentic Monthly Timelines
                cal_str = matched.get("submissionCalendar", "{}") or "{}"
                cal_dict = {}
                monthly_submissions = {}
                earliest_activity_date = None
                latest_activity_date = None

                try:
                    cal_dict = json.loads(cal_str) if isinstance(cal_str, str) else cal_str
                    if cal_dict:
                        ts_list = sorted([int(k) for k in cal_dict.keys()])
                        if ts_list:
                            earliest_activity_date = datetime.fromtimestamp(ts_list[0], tz=timezone.utc).isoformat()
                            latest_activity_date = datetime.fromtimestamp(ts_list[-1], tz=timezone.utc).isoformat()
                            for ts in ts_list:
                                dt = datetime.fromtimestamp(ts, tz=timezone.utc)
                                m_key = dt.strftime("%Y-%m")
                                monthly_submissions[m_key] = monthly_submissions.get(m_key, 0) + cal_dict[str(ts)]
                except Exception:
                    pass

                solved_metric = ProvenanceMetric(
                    value=total_solved,
                    availability=Availability.AVAILABLE if total_solved > 0 else Availability.VERIFIED_ZERO,
                    confidence=Confidence.OFFICIAL_API,
                    source="leetcode_graphql_acSubmissionNum",
                    source_timestamp=now_iso,
                )

                if contest_history:
                    first_c_ts = contest_history[0].get("timestamp")
                    if first_c_ts and (earliest_activity_date is None or first_c_ts < earliest_activity_date):
                        earliest_activity_date = first_c_ts

                return {
                    "platform": cls.PLATFORM_NAME,
                    "username": matched.get("username", clean_user),
                    "status": "synced",
                    "verified": True,
                    "solved": total_solved,
                    "solved_metric": solved_metric.model_dump(),
                    "rank": rank_str,
                    "easy": easy_solved,
                    "medium": med_solved,
                    "hard": hard_solved,
                    "contest_rating": contest_rating,
                    "contest_rating_metric": contest_metric.model_dump(),
                    "contest_global_rank": contest_global_rank,
                    "contest_attended": contest_attended,
                    "contest_badge": contest_badge,
                    "contest_history": contest_history,
                    "topic_counts": {
                        "fundamentals": sum(t.get("problemsSolved", 0) for t in fund_tags),
                        "core_dsa": sum(t.get("problemsSolved", 0) for t in inter_tags),
                        "advanced_topics": dp_and_adv,
                        "dp_and_advanced": dp_and_adv,
                        "dp_specific": dp_specific,
                        "tree_problems": tag_map.get("tree", 0) or tag_map.get("binary tree", 0),
                        "hash_problems": tag_map.get("hash table", 0),
                        "binary_search": tag_map.get("binary search", 0),
                        "arrays": tag_map.get("array", 0),
                        "two_pointers": tag_map.get("two pointers", 0),
                        "strings": tag_map.get("string", 0),
                        "linked_list": tag_map.get("linked list", 0),
                        "sorting": tag_map.get("sorting", 0),
                    },
                    "topics": all_topics[:12],
                    "algorithmic_depth_score": alg_depth,
                    "submissionCalendar": cal_str,
                    "monthly_submissions": monthly_submissions,
                    "earliest_activity_date": earliest_activity_date,
                    "latest_activity_date": latest_activity_date,
                }

        except Exception as exc:
            return {
                "platform": cls.PLATFORM_NAME,
                "username": clean_user,
                "status": "error",
                "verified": False,
                "solved": 0,
                "rank": "Error",
                "easy": 0,
                "medium": 0,
                "hard": 0,
                "contest_rating": 0,
                "contest_rating_metric": ProvenanceMetric(
                    value=None, availability=Availability.UNAVAILABLE, source_timestamp=now_iso, error_reason=str(exc)
                ).model_dump(),
                "topic_counts": {},
                "topics": [],
                "algorithmic_depth_score": 0,
            }
