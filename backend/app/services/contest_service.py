"""
Contest Service
Fetches, normalizes, and caches real-time contest data from Codeforces, LeetCode, and CodeChef.
Computes dynamic live/upcoming/completed statuses in UTC.
Provides in-memory caching and platform-level fault tolerance.
"""

import asyncio
from datetime import datetime, timezone, timedelta
import logging
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger(__name__)


def format_duration(seconds: int) -> str:
    """Format duration in seconds into human-readable string like '2h 15m'."""
    if seconds <= 0:
        return "0m"
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    if hours > 0 and minutes > 0:
        return f"{hours}h {minutes}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{minutes}m"


class ContestService:
    # In-memory cache
    _cache: Dict[str, Any] = {
        "contests": [],
        "last_updated": None,
        "platform_status": {
            "codeforces": "unknown",
            "leetcode": "unknown",
            "codechef": "unknown",
        },
    }
    _cache_ttl_seconds: int = 900  # 15 minutes
    _lock = asyncio.Lock()

    @classmethod
    def _compute_status(cls, start_dt: datetime, end_dt: datetime, now_dt: datetime) -> str:
        """Compute dynamic status against current UTC time."""
        if now_dt < start_dt:
            return "upcoming"
        elif start_dt <= now_dt < end_dt:
            return "live"
        else:
            return "completed"

    @classmethod
    async def fetch_codeforces_contests(cls, client: httpx.AsyncClient, now_dt: datetime) -> List[Dict[str, Any]]:
        """Fetch Codeforces official contests via contest.list."""
        contests = []
        try:
            res = await client.get("https://codeforces.com/api/contest.list?gym=false", timeout=12.0)
            if res.status_code == 200:
                data = res.json()
                if data.get("status") == "OK":
                    raw_list = data.get("result", [])
                    cutoff_completed = now_dt - timedelta(days=14)

                    for c in raw_list:
                        start_ts = c.get("startTimeSeconds")
                        duration_sec = c.get("durationSeconds", 7200)
                        if not start_ts:
                            continue

                        start_dt = datetime.fromtimestamp(start_ts, tz=timezone.utc)
                        end_dt = start_dt + timedelta(seconds=duration_sec)

                        if end_dt < cutoff_completed:
                            continue

                        status = cls._compute_status(start_dt, end_dt, now_dt)
                        c_id = c.get("id")

                        contests.append({
                            "id": f"cf_{c_id}",
                            "platform": "codeforces",
                            "name": c.get("name", f"Codeforces Round #{c_id}"),
                            "description": f"Official Codeforces {c.get('type', 'ICPC')} round",
                            "start_time": start_dt.isoformat(),
                            "end_time": end_dt.isoformat(),
                            "duration_seconds": duration_sec,
                            "duration_formatted": format_duration(duration_sec),
                            "status": status,
                            "contest_url": f"https://codeforces.com/contest/{c_id}",
                            "registration_url": f"https://codeforces.com/contestRegistration/{c_id}" if status == "upcoming" else f"https://codeforces.com/contest/{c_id}",
                            "registration_type": "external",
                            "platform_metadata": {
                                "contest_id": c_id,
                                "phase": c.get("phase"),
                                "type": c.get("type"),
                            },
                        })
        except Exception as e:
            logger.warning(f"Failed to fetch Codeforces contests: {e}")
            raise e
        return contests

    @classmethod
    async def fetch_leetcode_contests(cls, client: httpx.AsyncClient, now_dt: datetime) -> List[Dict[str, Any]]:
        """Fetch LeetCode contests via public GraphQL."""
        contests = []
        query = """
        query {
            allContests {
                title
                titleSlug
                startTime
                duration
                originStartTime
                isVirtual
            }
        }
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://leetcode.com/contest/",
            }
            res = await client.post("https://leetcode.com/graphql", json={"query": query}, headers=headers, timeout=12.0)
            if res.status_code == 200:
                data = res.json()
                raw_list = data.get("data", {}).get("allContests", [])
                cutoff_completed = now_dt - timedelta(days=14)

                for c in raw_list:
                    if c.get("isVirtual"):
                        continue

                    start_ts = c.get("startTime")
                    duration_sec = c.get("duration", 5400)
                    if not start_ts:
                        continue

                    start_dt = datetime.fromtimestamp(start_ts, tz=timezone.utc)
                    end_dt = start_dt + timedelta(seconds=duration_sec)

                    if end_dt < cutoff_completed:
                        continue

                    status = cls._compute_status(start_dt, end_dt, now_dt)
                    slug = c.get("titleSlug", "")

                    contests.append({
                        "id": f"lc_{slug}",
                        "platform": "leetcode",
                        "name": c.get("title", slug.replace("-", " ").title()),
                        "description": "Official LeetCode rated weekly/biweekly contest",
                        "start_time": start_dt.isoformat(),
                        "end_time": end_dt.isoformat(),
                        "duration_seconds": duration_sec,
                        "duration_formatted": format_duration(duration_sec),
                        "status": status,
                        "contest_url": f"https://leetcode.com/contest/{slug}",
                        "registration_url": f"https://leetcode.com/contest/{slug}",
                        "registration_type": "external",
                        "platform_metadata": {
                            "titleSlug": slug,
                            "originStartTime": c.get("originStartTime"),
                        },
                    })
        except Exception as e:
            logger.warning(f"Failed to fetch LeetCode contests: {e}")
            raise e
        return contests

    @classmethod
    async def fetch_codechef_contests(cls, client: httpx.AsyncClient, now_dt: datetime) -> List[Dict[str, Any]]:
        """Fetch CodeChef contests via official public contest list API."""
        contests = []
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            res = await client.get("https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc", headers=headers, timeout=12.0)
            if res.status_code == 200:
                data = res.json()
                present = data.get("present_contests", [])
                future = data.get("future_contests", [])
                past = data.get("past_contests", [])

                cutoff_completed = now_dt - timedelta(days=14)

                all_raw = []
                for p in present:
                    all_raw.append(p)
                for f in future:
                    all_raw.append(f)
                for pt in past[:15]:
                    all_raw.append(pt)

                for c in all_raw:
                    code = c.get("contest_code")
                    if not code:
                        continue

                    start_iso = c.get("contest_start_date_iso")
                    end_iso = c.get("contest_end_date_iso")

                    if start_iso:
                        try:
                            start_dt = datetime.fromisoformat(start_iso).astimezone(timezone.utc)
                        except Exception:
                            continue
                    else:
                        continue

                    if end_iso:
                        try:
                            end_dt = datetime.fromisoformat(end_iso).astimezone(timezone.utc)
                        except Exception:
                            duration_min = int(c.get("contest_duration", 120))
                            end_dt = start_dt + timedelta(minutes=duration_min)
                    else:
                        duration_min = int(c.get("contest_duration", 120))
                        end_dt = start_dt + timedelta(minutes=duration_min)

                    if end_dt < cutoff_completed:
                        continue

                    duration_sec = int((end_dt - start_dt).total_seconds())
                    status = cls._compute_status(start_dt, end_dt, now_dt)

                    contests.append({
                        "id": f"cc_{code}",
                        "platform": "codechef",
                        "name": c.get("contest_name", f"CodeChef {code}"),
                        "description": "Official CodeChef rated contest",
                        "start_time": start_dt.isoformat(),
                        "end_time": end_dt.isoformat(),
                        "duration_seconds": duration_sec,
                        "duration_formatted": format_duration(duration_sec),
                        "status": status,
                        "contest_url": f"https://www.codechef.com/{code}",
                        "registration_url": f"https://www.codechef.com/{code}",
                        "registration_type": "external",
                        "platform_metadata": {
                            "contest_code": code,
                            "contest_id": c.get("contest_id"),
                        },
                    })
        except Exception as e:
            logger.warning(f"Failed to fetch CodeChef contests: {e}")
            raise e
        return contests

    @classmethod
    async def get_all_contests(cls, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Returns all contests from Codeforces, LeetCode, and CodeChef.
        Utilizes caching and re-evaluates dynamic status for each contest based on current time.
        """
        now_dt = datetime.now(timezone.utc)

        async with cls._lock:
            cached_contests = cls._cache.get("contests", [])
            last_updated = cls._cache.get("last_updated")

            is_expired = True
            if last_updated:
                elapsed = (now_dt - last_updated).total_seconds()
                if elapsed < cls._cache_ttl_seconds:
                    is_expired = False

            if not force_refresh and not is_expired and cached_contests:
                # Re-compute dynamic status for cached contests based on current moment
                updated_contests = []
                for c in cached_contests:
                    start_dt = datetime.fromisoformat(c["start_time"])
                    end_dt = datetime.fromisoformat(c["end_time"])
                    c_copy = dict(c)
                    c_copy["status"] = cls._compute_status(start_dt, end_dt, now_dt)
                    updated_contests.append(c_copy)

                updated_contests.sort(key=lambda x: (
                    0 if x["status"] == "live" else (1 if x["status"] == "upcoming" else 2),
                    x["start_time"] if x["status"] != "completed" else -datetime.fromisoformat(x["start_time"]).timestamp()
                ))

                return {
                    "contests": updated_contests,
                    "last_updated": last_updated.isoformat(),
                    "platform_status": cls._cache.get("platform_status", {}),
                }

            # Fetch fresh from platforms concurrently
            platform_status = {
                "codeforces": "unavailable",
                "leetcode": "unavailable",
                "codechef": "unavailable",
            }
            all_contests = []

            async with httpx.AsyncClient() as client:
                cf_task = cls.fetch_codeforces_contests(client, now_dt)
                lc_task = cls.fetch_leetcode_contests(client, now_dt)
                cc_task = cls.fetch_codechef_contests(client, now_dt)

                results = await asyncio.gather(cf_task, lc_task, cc_task, return_exceptions=True)

                if isinstance(results[0], list):
                    all_contests.extend(results[0])
                    platform_status["codeforces"] = "available"
                else:
                    logger.error(f"Codeforces fetch failed: {results[0]}")

                if isinstance(results[1], list):
                    all_contests.extend(results[1])
                    platform_status["leetcode"] = "available"
                else:
                    logger.error(f"LeetCode fetch failed: {results[1]}")

                if isinstance(results[2], list):
                    all_contests.extend(results[2])
                    platform_status["codechef"] = "available"
                else:
                    logger.error(f"CodeChef fetch failed: {results[2]}")

            if not all_contests and cached_contests:
                logger.warning("All platform fetches failed; returning stale cache")
                return {
                    "contests": cached_contests,
                    "last_updated": (last_updated or now_dt).isoformat(),
                    "platform_status": platform_status,
                }

            # Deduplicate by ID
            seen_ids = set()
            deduped = []
            for c in all_contests:
                if c["id"] not in seen_ids:
                    seen_ids.add(c["id"])
                    deduped.append(c)

            deduped.sort(key=lambda x: (
                0 if x["status"] == "live" else (1 if x["status"] == "upcoming" else 2),
                x["start_time"] if x["status"] != "completed" else -datetime.fromisoformat(x["start_time"]).timestamp()
            ))

            cls._cache["contests"] = deduped
            cls._cache["last_updated"] = now_dt
            cls._cache["platform_status"] = platform_status

            return {
                "contests": deduped,
                "last_updated": now_dt.isoformat(),
                "platform_status": platform_status,
            }
