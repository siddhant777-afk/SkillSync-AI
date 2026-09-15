"""
CodeChef Platform Adapter
Extracts contest rating, official star tiers (1★ to 7★), division,
solved problem counts, and full contest rating history from official CodeChef profile.
Strictly distinguishes unrated / inactive profiles from unavailable / not found.
"""

from datetime import datetime, timezone
import json
import re
from typing import Any, Dict, List, Optional
import httpx

from .base import (
    Availability,
    BasePlatformAdapter,
    Confidence,
    ContestHistoryEntry,
    ProvenanceMetric,
)


class CodeChefAdapter(BasePlatformAdapter):
    PLATFORM_NAME = "codechef"
    BASE_URL = "https://www.codechef.com/users"

    @classmethod
    def get_stars_and_division(cls, rating: Optional[int]) -> tuple[str, str]:
        """
        Official CodeChef Star & Division mapping:
        - 1★: 0-1399 (Div 4)
        - 2★: 1400-1599 (Div 3)
        - 3★: 1600-1799 (Div 2)
        - 4★: 1800-1999 (Div 2)
        - 5★: 2000-2199 (Div 1)
        - 6★: 2200-2499 (Div 1)
        - 7★: 2500+ (Div 1)
        """
        if rating is None or rating <= 0:
            return "Unrated", "Unrated"
        if rating < 1400:
            return "1★", "Div 4"
        if rating < 1600:
            return "2★", "Div 3"
        if rating < 1800:
            return "3★", "Div 2"
        if rating < 2000:
            return "4★", "Div 2"
        if rating < 2200:
            return "5★", "Div 1"
        if rating < 2500:
            return "6★", "Div 1"
        return "7★", "Div 1"

    @classmethod
    async def fetch_data(cls, username: str, timeout: float = 12.0) -> Dict[str, Any]:
        clean_user = (username or "").strip()
        now_iso = datetime.now(timezone.utc).isoformat()

        empty_profile = {
            "rating": None,
            "highest_rating": None,
            "stars": "Unrated",
            "division": "Unrated",
            "global_rank": None,
            "country_rank": None,
        }
        empty_problems = {
            "total_solved": 0,
            "unique_solved_count": 0,
            "difficulty_distribution": [],
            "difficulty_bands": {},
            "contest_solved": 0,
            "practice_solved": 0,
        }

        if not clean_user:
            return {
                "platform": cls.PLATFORM_NAME,
                "username": "",
                "status": "unconnected",
                "verified": False,
                "profile": empty_profile,
                "problems": empty_problems,
                "rating": 0,
                "highest_rating": None,
                "highestRating": None,
                "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_CONNECTED, source="input").model_dump(),
                "stars": "Unrated",
                "division": "Unrated",
                "title": "Unconnected",
                "global_rank": None,
                "globalRank": 0,
                "country_rank": None,
                "countryRank": None,
                "solved": 0,
                "difficulty_distribution": [],
                "difficulty_bands": {},
                "solved_metric": ProvenanceMetric(value=0, availability=Availability.NOT_CONNECTED, source="input").model_dump(),
                "contest_history": [],
                "first_activity_date": None,
                "latest_activity_date": None,
            }

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

        try:
            async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as client:
                res = await client.get(f"{cls.BASE_URL}/{clean_user}")

                if res.status_code == 404:
                    return {
                        "platform": cls.PLATFORM_NAME,
                        "username": clean_user,
                        "status": "not_found",
                        "verified": False,
                        "profile": empty_profile,
                        "problems": empty_problems,
                        "rating": 0,
                        "highest_rating": None,
                        "highestRating": None,
                        "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND, source="codechef_html").model_dump(),
                        "stars": "Unrated",
                        "division": "Unrated",
                        "title": "Not Found",
                        "global_rank": None,
                        "globalRank": 0,
                        "country_rank": None,
                        "countryRank": None,
                        "solved": 0,
                        "difficulty_distribution": [],
                        "difficulty_bands": {},
                        "contest_history": [],
                    }

                html = res.text

                # Check if page is an actual user profile or CodeChef's generic redirect/fallback
                has_profile = (
                    "user-details-container" in html
                    or "rating-number" in html
                    or "var all_rating" in html
                    or "user-profile-container" in html
                )

                if not has_profile:
                    return {
                        "platform": cls.PLATFORM_NAME,
                        "username": clean_user,
                        "status": "not_found",
                        "verified": False,
                        "profile": empty_profile,
                        "problems": empty_problems,
                        "rating": 0,
                        "highest_rating": None,
                        "highestRating": None,
                        "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND, source="codechef_html").model_dump(),
                        "stars": "Unrated",
                        "division": "Unrated",
                        "title": "Not Found",
                        "global_rank": None,
                        "globalRank": 0,
                        "country_rank": None,
                        "countryRank": None,
                        "solved": 0,
                        "difficulty_distribution": [],
                        "difficulty_bands": {},
                        "contest_history": [],
                    }

                # 1. Parse Current Rating (whitespace-tolerant regex)
                r_match = re.search(r'class="rating-number"[^>]*>\s*(\d+)\s*<', html) or re.search(r'<div class="rating-number">\s*(\d+)\s*<', html)
                rating_val = int(r_match.group(1)) if r_match else None

                # 2. Parse Highest Rating
                hr_match = re.search(r'eChef Rating[\s\S]*?[Hh]ighest\s*[Rr]ating\s*(\d+)', html) or re.search(r'[Hh]ighest\s*[Rr]ating\s*(\d+)', html)
                highest_rating_val = int(hr_match.group(1)) if hr_match else None

                # 3. Parse Contest Rating History (var all_rating)
                contest_history = []
                all_r_match = re.search(r'var all_rating = (\[[\s\S]*?\]);', html)
                if all_r_match:
                    try:
                        raw_contests = json.loads(all_r_match.group(1))
                        for c in raw_contests:
                            end_dt_str = c.get("end_date")
                            unix_ts = None
                            iso_ts = None
                            if end_dt_str:
                                try:
                                    dt = datetime.strptime(end_dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
                                    unix_ts = int(dt.timestamp())
                                    iso_ts = dt.isoformat()
                                except Exception:
                                    iso_ts = end_dt_str

                            entry = ContestHistoryEntry(
                                contest_id=c.get("code"),
                                contest_name=c.get("name", ""),
                                timestamp=iso_ts,
                                unix_timestamp=unix_ts,
                                rating=int(c.get("rating")) if c.get("rating") and str(c.get("rating")).isdigit() else None,
                                rank=int(c.get("rank")) if c.get("rank") and str(c.get("rank")).isdigit() else None,
                            )
                            contest_history.append(entry.model_dump())
                    except Exception:
                        pass

                # If rating-number wasn't parsed but contest history has latest rating
                if rating_val is None and contest_history:
                    latest_r = contest_history[-1].get("rating")
                    if latest_r:
                        rating_val = latest_r

                # 4. Derive Stars & Division from official CodeChef bands
                derived_stars, derived_div = cls.get_stars_and_division(rating_val)

                # Check explicit stars in markup
                s_match = re.search(r'class="rating-star"[^>]*>([\s\S]*?)</div>', html)
                explicit_stars_count = 0
                if s_match:
                    explicit_stars_count = len(re.findall(r'★|&#9733;', s_match.group(1)))
                stars_label = f"{explicit_stars_count}★" if explicit_stars_count > 0 else derived_stars

                # Check explicit division in markup
                d_match = re.search(r'\((Div\s*\d+)\)', html, re.IGNORECASE)
                division_label = d_match.group(1).capitalize() if d_match else derived_div

                # 5. Global Rank & Country Rank
                gr_match = (
                    re.search(r'<strong class=[\'"]global-rank[\'"][^>]*>\s*(\d+)\s*<', html)
                    or re.search(r'<a[^>]*href="/ratings/all"[^>]*>\s*<strong>\s*(\d+)\s*</strong>', html, re.IGNORECASE)
                    or re.search(r'<strong>\s*(\d+)\s*</strong>\s*</a>\s*Global Rank', html, re.IGNORECASE)
                )
                global_rank_val = int(gr_match.group(1)) if gr_match else None

                cr_match = (
                    re.search(r'<a[^>]*filterBy=Country[^>]*>\s*<strong>\s*(\d+)\s*</strong>', html, re.IGNORECASE)
                    or re.search(r'<strong>\s*(\d+)\s*</strong>\s*</a>\s*Country Rank', html, re.IGNORECASE)
                )
                country_rank_val = int(cr_match.group(1)) if cr_match else None

                # 6. Parse Solved Problems and Native Difficulty Distribution
                sol_match = re.search(r'Total Problems Solved:\s*(\d+)', html) or re.search(r'<h3>Total Problems Solved:\s*(\d+)</h3>', html)
                solved_val = int(sol_match.group(1)) if sol_match else None

                ps_match = re.search(r'<section class="rating-data-section problems-solved">([\s\S]*?)</section>', html)
                unique_problems: Dict[str, Dict[str, Any]] = {}
                contest_solved_count = 0
                practice_solved_count = 0

                if ps_match:
                    ps_html = ps_match.group(1)
                    # Extract contest blocks: <h5><span>Contest Name</span></h5><p><span>...</span></p>
                    c_blocks = re.findall(r"<div class=['\"]content['\"]><h5><span[^>]*>([\s\S]*?)</span></h5><p><span>([\s\S]*?)</span></p></div>", ps_html)
                    for c_title_raw, p_list_raw in c_blocks:
                        c_title = re.sub(r'<[^>]+>', '', c_title_raw).strip()
                        c_div_match = re.search(r'Division\s*(\d+)|Div\s*(\d+)', c_title, re.IGNORECASE)
                        nominal_diff = None
                        if c_div_match:
                            div_num = int(c_div_match.group(1) or c_div_match.group(2))
                            if div_num == 1:
                                nominal_diff = 2000
                            elif div_num == 2:
                                nominal_diff = 1600
                            elif div_num == 3:
                                nominal_diff = 1400
                            elif div_num == 4:
                                nominal_diff = 800

                        p_names = re.findall(r'<span[^>]*style="font-size:\s*12px"[^>]*>([^<]+)</span>', p_list_raw)
                        if not p_names:
                            for item in p_list_raw.split(','):
                                clean_item = re.sub(r'<[^>]+>', '', item).replace('&nbsp;', ' ').strip()
                                if clean_item and len(clean_item) > 1:
                                    p_names.append(clean_item)

                        for p_name in p_names:
                            p_name_clean = p_name.replace('&nbsp;', ' ').strip()
                            if not p_name_clean:
                                continue
                            key = p_name_clean.lower()
                            if key not in unique_problems:
                                unique_problems[key] = {
                                    "name": p_name_clean,
                                    "contest": c_title,
                                    "difficulty": nominal_diff,
                                }
                            contest_solved_count += 1

                    # Extract practice problem links if present
                    for a_match in re.finditer(r'<a href="(/problems/[^"]+)"[^>]*>([^<]+)</a>', ps_html):
                        p_name_clean = a_match.group(2).replace('&nbsp;', ' ').strip()
                        key = p_name_clean.lower()
                        if key not in unique_problems:
                            unique_problems[key] = {
                                "name": p_name_clean,
                                "contest": "Practice",
                                "difficulty": None,
                            }
                            practice_solved_count += 1

                if solved_val is None:
                    if unique_problems:
                        solved_val = len(unique_problems)
                    elif "Problems Solved:" in html:
                        solved_val = 0

                # Build native numerical difficulty distribution
                diff_distribution: List[Dict[str, Any]] = []
                diff_counts: Dict[Optional[int], int] = {}
                for p_info in unique_problems.values():
                    d = p_info["difficulty"]
                    diff_counts[d] = diff_counts.get(d, 0) + 1

                # If solved_val exceeds unique contest problems extracted, unlisted problems have difficulty = null
                effective_total = solved_val if solved_val is not None else len(unique_problems)
                unlisted_count = max(0, effective_total - len(unique_problems))
                if unlisted_count > 0:
                    diff_counts[None] = diff_counts.get(None, 0) + unlisted_count

                # Standardized CodeChef numerical bands for charts
                diff_bands = {
                    "< 1000": 0,
                    "1000–1199": 0,
                    "1200–1399": 0,
                    "1400–1599": 0,
                    "1600–1799": 0,
                    "1800–1999": 0,
                    "2000+": 0,
                    "Unrated": 0,
                }

                for diff, count in diff_counts.items():
                    label = f"{diff}" if diff is not None else "Unrated / Difficulty unavailable"
                    diff_distribution.append({
                        "difficulty": diff,
                        "label": label,
                        "count": count,
                    })
                    if diff is None:
                        diff_bands["Unrated"] += count
                    elif diff < 1000:
                        diff_bands["< 1000"] += count
                    elif diff < 1200:
                        diff_bands["1000–1199"] += count
                    elif diff < 1400:
                        diff_bands["1200–1399"] += count
                    elif diff < 1600:
                        diff_bands["1400–1599"] += count
                    elif diff < 1800:
                        diff_bands["1600–1799"] += count
                    elif diff < 2000:
                        diff_bands["1800–1999"] += count
                    else:
                        diff_bands["2000+"] += count

                # Sort distribution by difficulty (None at the end)
                diff_distribution.sort(key=lambda x: (x["difficulty"] is None, x["difficulty"] or 0))

                # Construct provenance metrics
                if rating_val is not None:
                    rating_metric = ProvenanceMetric(
                        value=rating_val,
                        availability=Availability.AVAILABLE,
                        confidence=Confidence.SCRAPED_CONFIRMED,
                        source="codechef_html_profile",
                        source_timestamp=now_iso,
                    )
                else:
                    rating_metric = ProvenanceMetric(
                        value=None,
                        availability=Availability.UNRATED,
                        confidence=Confidence.SCRAPED_CONFIRMED,
                        source="codechef_html_profile",
                        source_timestamp=now_iso,
                    )

                if solved_val is not None:
                    solved_metric = ProvenanceMetric(
                        value=solved_val,
                        availability=Availability.AVAILABLE if solved_val > 0 else Availability.VERIFIED_ZERO,
                        confidence=Confidence.SCRAPED_CONFIRMED,
                        source="codechef_html_profile",
                        source_timestamp=now_iso,
                    )
                else:
                    solved_metric = ProvenanceMetric(
                        value=None,
                        availability=Availability.UNAVAILABLE,
                        confidence=Confidence.UNVERIFIED,
                        source="codechef_html_profile",
                        source_timestamp=now_iso,
                    )

                first_activity = contest_history[0].get("timestamp") if contest_history else None
                latest_activity = contest_history[-1].get("timestamp") if contest_history else None

                profile_payload = {
                    "rating": rating_val,
                    "highest_rating": highest_rating_val,
                    "stars": stars_label,
                    "division": division_label,
                    "global_rank": global_rank_val,
                    "country_rank": country_rank_val,
                }

                problems_payload = {
                    "total_solved": solved_val if solved_val is not None else 0,
                    "unique_solved_count": len(unique_problems),
                    "difficulty_distribution": diff_distribution,
                    "difficulty_bands": diff_bands,
                    "contest_solved": contest_solved_count,
                    "practice_solved": practice_solved_count,
                }

                return {
                    "platform": cls.PLATFORM_NAME,
                    "username": clean_user,
                    "status": "synced",
                    "verified": True,
                    # Structured separation
                    "profile": profile_payload,
                    "problems": problems_payload,
                    # Top-level backwards compatibility
                    "rating": rating_val or 0,
                    "highest_rating": highest_rating_val,
                    "highestRating": highest_rating_val,
                    "stars": stars_label,
                    "division": division_label,
                    "title": stars_label if stars_label != "Unrated" else division_label,
                    "global_rank": global_rank_val,
                    "globalRank": global_rank_val or 0,
                    "country_rank": country_rank_val,
                    "countryRank": country_rank_val,
                    "solved": solved_val if solved_val is not None else 0,
                    "difficulty_distribution": diff_distribution,
                    "difficulty_bands": diff_bands,
                    "rating_metric": rating_metric.model_dump(),
                    "solved_metric": solved_metric.model_dump(),
                    "contest_history": contest_history,
                    "first_activity_date": first_activity,
                    "latest_activity_date": latest_activity,
                }

        except Exception as exc:
            return {
                "platform": cls.PLATFORM_NAME,
                "username": clean_user,
                "status": "error",
                "verified": False,
                "profile": empty_profile,
                "problems": empty_problems,
                "rating": 0,
                "highest_rating": None,
                "highestRating": None,
                "rating_metric": ProvenanceMetric(
                    value=None,
                    availability=Availability.UNAVAILABLE,
                    source="codechef_adapter",
                    source_timestamp=now_iso,
                    error_reason=str(exc)
                ).model_dump(),
                "stars": "Unrated",
                "division": "Unrated",
                "title": "Unavailable",
                "global_rank": None,
                "globalRank": 0,
                "country_rank": None,
                "countryRank": None,
                "solved": 0,
                "difficulty_distribution": [],
                "difficulty_bands": {},
                "solved_metric": ProvenanceMetric(value=None, availability=Availability.UNAVAILABLE).model_dump(),
                "contest_history": [],
            }

