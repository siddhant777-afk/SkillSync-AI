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

        if not clean_user:
            return {
                "platform": cls.PLATFORM_NAME,
                "username": "",
                "status": "unconnected",
                "verified": False,
                "rating": 0,
                "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_CONNECTED, source="input").model_dump(),
                "stars": "Unrated",
                "division": "Unrated",
                "title": "Unconnected",
                "globalRank": 0,
                "solved": 0,
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
                        "rating": 0,
                        "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND, source="codechef_html").model_dump(),
                        "stars": "Unrated",
                        "division": "Unrated",
                        "title": "Not Found",
                        "globalRank": 0,
                        "solved": 0,
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
                        "rating": 0,
                        "rating_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND, source="codechef_html").model_dump(),
                        "stars": "Unrated",
                        "division": "Unrated",
                        "title": "Not Found",
                        "globalRank": 0,
                        "solved": 0,
                        "contest_history": [],
                    }

                # 1. Parse Rating (whitespace-tolerant regex)
                r_match = re.search(r'class="rating-number"[^>]*>\s*(\d+)\s*<', html) or re.search(r'<div class="rating-number">\s*(\d+)\s*<', html)
                rating_val = int(r_match.group(1)) if r_match else None

                # 2. Parse Contest Rating History (var all_rating)
                contest_history = []
                all_r_match = re.search(r'var all_rating = (\[[\s\S]*?\]);', html)
                if all_r_match:
                    try:
                        raw_contests = json.loads(all_r_match.group(1))
                        for c in raw_contests:
                            # format: '2023-02-08 22:30:00'
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

                # 3. Derive Stars & Division from official CodeChef bands
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

                # 4. Solved Problems Count
                sol_match = re.search(r'Total Problems Solved:\s*(\d+)', html) or re.search(r'<h3>Total Problems Solved:\s*(\d+)</h3>', html)
                solved_val = int(sol_match.group(1)) if sol_match else None
                if solved_val is None:
                    # Check if user has explicit 0 solved
                    if "Problems Solved:" in html:
                        solved_val = 0

                # 5. Global Rank
                gr_match = re.search(r'class=[\'"]global-rank[\'"][^>]*>\s*(\d+)\s*<', html) or re.search(r'Global Rank[^\d]*(\d+)', html)
                global_rank = int(gr_match.group(1)) if gr_match else None

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

                return {
                    "platform": cls.PLATFORM_NAME,
                    "username": clean_user,
                    "status": "synced",
                    "verified": True,
                    "rating": rating_val or 0,  # Backward compatible flat field
                    "rating_metric": rating_metric.model_dump(),
                    "stars": stars_label,
                    "division": division_label,
                    "title": stars_label if stars_label != "Unrated" else division_label,
                    "globalRank": global_rank or 0,
                    "solved": solved_val if solved_val is not None else 0,
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
                "rating": 0,
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
                "globalRank": 0,
                "solved": 0,
                "solved_metric": ProvenanceMetric(value=None, availability=Availability.UNAVAILABLE).model_dump(),
                "contest_history": [],
            }
