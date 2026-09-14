"""
Codeforces Platform Adapter
Interacts with official Codeforces REST APIs (user.info, user.rating, user.status).
Implements native rating tier classification, problem difficulty bucketing,
topic tag analysis, and contest timeline extraction.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx

from .base import (
    Availability,
    BasePlatformAdapter,
    Confidence,
    ContestHistoryEntry,
    ProvenanceMetric,
)


class CodeforcesAdapter(BasePlatformAdapter):
    PLATFORM_NAME = "codeforces"
    BASE_URL = "https://codeforces.com/api"

    @classmethod
    def get_tier_name(cls, rating: Optional[int]) -> str:
        """Official Codeforces rating title based on current contest rating."""
        if rating is None or rating <= 0:
            return "Unrated"
        if rating < 1200:
            return "Newbie"
        if rating < 1400:
            return "Pupil"
        if rating < 1600:
            return "Specialist"
        if rating < 1900:
            return "Expert"
        if rating < 2100:
            return "Candidate Master"
        if rating < 2300:
            return "Master"
        if rating < 2400:
            return "International Master"
        if rating < 2600:
            return "Grandmaster"
        if rating < 3000:
            return "International Grandmaster"
        return "Legendary Grandmaster"

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
                "title": "Unconnected",
                "maxRank": "Unconnected",
                "rating": 0,
                "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_CONNECTED, source="input").model_dump(),
                "maxRating": 0,
                "max_rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_CONNECTED, source="input").model_dump(),
                "solved": 0,
                "solved_metric": ProvenanceMetric(value=0, availability=Availability.NOT_CONNECTED, source="input").model_dump(),
                "rating_bands": {},
                "topic_tags": {},
                "contest_history": [],
                "first_activity_date": None,
                "latest_activity_date": None,
            }

        headers = {"User-Agent": "SkillSync-AI/1.0"}

        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            # 1. Fetch user.info
            user_info = None
            try:
                info_res = await client.get(f"{cls.BASE_URL}/user.info?handles={clean_user}")
                if info_res.status_code == 200:
                    data = info_res.json()
                    if data.get("status") == "OK" and data.get("result"):
                        user_info = data["result"][0]
                elif info_res.status_code == 400:
                    # User not found on Codeforces
                    err_comment = info_res.json().get("comment", "") if info_res.headers.get("content-type", "").startswith("application/json") else ""
                    return {
                        "platform": cls.PLATFORM_NAME,
                        "username": clean_user,
                        "status": "not_found",
                        "verified": False,
                        "title": "Not Found",
                        "maxRank": "Not Found",
                        "rating": 0,
                        "rating_metric": ProvenanceMetric(
                            value=None,
                            availability=Availability.NOT_FOUND,
                            confidence=Confidence.OFFICIAL_API,
                            source="codeforces_api_user_info",
                            source_timestamp=now_iso,
                            error_reason=f"Codeforces user not found: {err_comment}"
                        ).model_dump(),
                        "maxRating": 0,
                        "max_rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND).model_dump(),
                        "solved": 0,
                        "solved_metric": ProvenanceMetric(value=0, availability=Availability.NOT_FOUND).model_dump(),
                        "rating_bands": {},
                        "topic_tags": {},
                        "contest_history": [],
                    }
            except Exception as exc:
                return {
                    "platform": cls.PLATFORM_NAME,
                    "username": clean_user,
                    "status": "error",
                    "verified": False,
                    "title": "Unavailable",
                    "maxRank": "Unavailable",
                    "rating": 0,
                    "rating_metric": ProvenanceMetric(
                        value=None,
                        availability=Availability.UNAVAILABLE,
                        source="codeforces_api_user_info",
                        source_timestamp=now_iso,
                        error_reason=str(exc)
                    ).model_dump(),
                    "maxRating": 0,
                    "max_rating_metric": ProvenanceMetric(value=None, availability=Availability.UNAVAILABLE).model_dump(),
                    "solved": 0,
                    "solved_metric": ProvenanceMetric(value=None, availability=Availability.UNAVAILABLE).model_dump(),
                    "rating_bands": {},
                    "topic_tags": {},
                    "contest_history": [],
                }

            if not user_info:
                return {
                    "platform": cls.PLATFORM_NAME,
                    "username": clean_user,
                    "status": "not_found",
                    "verified": False,
                    "title": "Not Found",
                    "maxRank": "Not Found",
                    "rating": 0,
                    "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND).model_dump(),
                    "maxRating": 0,
                    "max_rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND).model_dump(),
                    "solved": 0,
                    "solved_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND).model_dump(),
                    "rating_bands": {},
                    "topic_tags": {},
                    "contest_history": [],
                }

            raw_rating = user_info.get("rating")
            raw_max_rating = user_info.get("maxRating")
            rank_title = user_info.get("rank") or cls.get_tier_name(raw_rating)

            if raw_rating is not None and raw_rating > 0:
                rating_metric = ProvenanceMetric(
                    value=int(raw_rating),
                    availability=Availability.AVAILABLE,
                    confidence=Confidence.OFFICIAL_API,
                    source="codeforces_api_user_info",
                    source_timestamp=now_iso,
                )
            else:
                rating_metric = ProvenanceMetric(
                    value=None,
                    availability=Availability.UNRATED,
                    confidence=Confidence.OFFICIAL_API,
                    source="codeforces_api_user_info",
                    source_timestamp=now_iso,
                )

            if raw_max_rating is not None and raw_max_rating > 0:
                max_rating_metric = ProvenanceMetric(
                    value=int(raw_max_rating),
                    availability=Availability.AVAILABLE,
                    confidence=Confidence.OFFICIAL_API,
                    source="codeforces_api_user_info",
                    source_timestamp=now_iso,
                )
            else:
                max_rating_metric = ProvenanceMetric(
                    value=None,
                    availability=Availability.UNRATED,
                    confidence=Confidence.OFFICIAL_API,
                    source="codeforces_api_user_info",
                    source_timestamp=now_iso,
                )

            # 2. Fetch user.rating (Contest History)
            contest_history = []
            first_contest_date = None
            latest_contest_date = None
            try:
                rating_res = await client.get(f"{cls.BASE_URL}/user.rating?handle={clean_user}")
                if rating_res.status_code == 200:
                    rdata = rating_res.json()
                    if rdata.get("status") == "OK":
                        raw_contests = rdata.get("result", [])
                        for c in raw_contests:
                            ts_sec = c.get("ratingUpdateTimeSeconds")
                            dt_str = datetime.fromtimestamp(ts_sec, tz=timezone.utc).isoformat() if ts_sec else None
                            delta = None
                            if "newRating" in c and "oldRating" in c:
                                delta = c["newRating"] - c["oldRating"]
                            entry = ContestHistoryEntry(
                                contest_id=str(c.get("contestId")),
                                contest_name=c.get("contestName", ""),
                                timestamp=dt_str,
                                unix_timestamp=ts_sec,
                                rating=c.get("newRating"),
                                rank=c.get("rank"),
                                delta=delta,
                            )
                            contest_history.append(entry.model_dump())
                        if contest_history:
                            first_contest_date = contest_history[0].get("timestamp")
                            latest_contest_date = contest_history[-1].get("timestamp")
            except Exception:
                pass

            # 3. Fetch user.status (Submissions, Problem Ratings & Tags)
            solved_map: Dict[str, Dict[str, Any]] = {}
            topic_tags: Dict[str, int] = {}
            rating_bands = {
                "< 1000 (Newbie Basics)": 0,
                "1000–1199 (Newbie Advanced)": 0,
                "1200–1399 (Pupil)": 0,
                "1400–1599 (Specialist)": 0,
                "1600–1899 (Expert)": 0,
                "1900–2099 (Candidate Master)": 0,
                "2100+ (Master+)": 0,
                "Unrated": 0,
            }

            first_sub_date = None
            latest_sub_date = None

            try:
                sub_res = await client.get(f"{cls.BASE_URL}/user.status?handle={clean_user}&from=1&count=1000")
                if sub_res.status_code == 200:
                    sdata = sub_res.json()
                    if sdata.get("status") == "OK":
                        subs = sdata.get("result", [])
                        # Submissions are returned newest first
                        if subs:
                            latest_ts = subs[0].get("creationTimeSeconds")
                            if latest_ts:
                                latest_sub_date = datetime.fromtimestamp(latest_ts, tz=timezone.utc).isoformat()
                            earliest_ts = subs[-1].get("creationTimeSeconds")
                            if earliest_ts:
                                first_sub_date = datetime.fromtimestamp(earliest_ts, tz=timezone.utc).isoformat()

                        for s in subs:
                            if s.get("verdict") == "OK" and "problem" in s:
                                prob = s["problem"]
                                c_id = prob.get("contestId")
                                idx = prob.get("index")
                                p_key = f"{c_id}_{idx}" if (c_id and idx) else prob.get("name", "")

                                if p_key and p_key not in solved_map:
                                    solved_map[p_key] = prob
                                    p_rating = prob.get("rating")
                                    if p_rating is not None:
                                        if p_rating < 1000:
                                            rating_bands["< 1000 (Newbie Basics)"] += 1
                                        elif p_rating < 1200:
                                            rating_bands["1000–1199 (Newbie Advanced)"] += 1
                                        elif p_rating < 1400:
                                            rating_bands["1200–1399 (Pupil)"] += 1
                                        elif p_rating < 1600:
                                            rating_bands["1400–1599 (Specialist)"] += 1
                                        elif p_rating < 1900:
                                            rating_bands["1600–1899 (Expert)"] += 1
                                        elif p_rating < 2100:
                                            rating_bands["1900–2099 (Candidate Master)"] += 1
                                        else:
                                            rating_bands["2100+ (Master+)"] += 1
                                    else:
                                        rating_bands["Unrated"] += 1

                                    for tag in prob.get("tags", []):
                                        t_norm = tag.lower().strip()
                                        topic_tags[t_norm] = topic_tags.get(t_norm, 0) + 1
            except Exception:
                pass

            total_solved = len(solved_map)
            solved_metric = ProvenanceMetric(
                value=total_solved,
                availability=Availability.AVAILABLE if total_solved > 0 else Availability.VERIFIED_ZERO,
                confidence=Confidence.OFFICIAL_API,
                source="codeforces_api_user_status",
                source_timestamp=now_iso,
            )

            # Earliest verified activity: compare earliest contest vs earliest submission
            earliest_activity = first_contest_date or first_sub_date
            latest_activity = latest_contest_date or latest_sub_date

            reg_time = user_info.get("registrationTimeSeconds")
            account_created_at = datetime.fromtimestamp(reg_time, tz=timezone.utc).isoformat() if reg_time else None

            return {
                "platform": cls.PLATFORM_NAME,
                "username": user_info.get("handle", clean_user),
                "status": "synced",
                "verified": True,
                "title": rank_title.title(),
                "rating": rating_metric.value or 0,  # Backward compatible flat field
                "rating_metric": rating_metric.model_dump(),
                "maxRating": max_rating_metric.value or 0,
                "max_rating_metric": max_rating_metric.model_dump(),
                "maxRank": (user_info.get("maxRank") or rank_title).title(),
                "solved": total_solved,
                "solved_metric": solved_metric.model_dump(),
                "rating_bands": rating_bands,
                "topic_tags": topic_tags,
                "contest_history": contest_history,
                "account_created_at": account_created_at,
                "earliest_activity_date": earliest_activity,
                "latest_activity_date": latest_activity,
                "avatar_url": user_info.get("titlePhoto") or user_info.get("avatar") or "",
            }
