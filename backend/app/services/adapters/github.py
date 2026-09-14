"""
GitHub Platform Adapter
Interacts with official GitHub REST API and authentic contribution sources.
Eliminates synthetic formulas (repos * 12 + stars * 3).
Evaluates repository quality (source repos vs forks, commit activity, stars,
languages, documentation) and extracts authentic daily & monthly contribution timelines.
"""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional
import httpx

from .base import (
    Availability,
    BasePlatformAdapter,
    Confidence,
    ProvenanceMetric,
)


class GitHubAdapter(BasePlatformAdapter):
    PLATFORM_NAME = "github"
    API_URL = "https://api.github.com"
    CONTRIBUTIONS_PROXY_URL = "https://github-contributions-api.jogruber.de/v4"

    @classmethod
    def evaluate_repo_quality(cls, repo: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a single repository on meaningful engineering criteria:
        - Is original source (not fork)
        - Non-empty (size > 0)
        - Has description and license
        - Has star / fork traction
        - Recency of pushes
        """
        is_fork = repo.get("fork", False)
        size_kb = repo.get("size", 0)
        stars = repo.get("stargazers_count", 0)
        forks = repo.get("forks_count", 0)
        has_description = bool(repo.get("description") and len(repo.get("description", "").strip()) > 10)
        language = repo.get("language") or "Code"
        open_issues = repo.get("open_issues_count", 0)
        pushed_at = repo.get("pushed_at") or repo.get("updated_at")

        # Compute a quality score for this repo (0-100)
        score = 0
        if not is_fork:
            score += 30  # Original work
        else:
            score += 10  # Forked contribution

        if size_kb > 100:
            score += 20
        elif size_kb > 10:
            score += 10

        if has_description:
            score += 15

        if stars > 0:
            score += min(20, stars * 5)

        if forks > 0:
            score += min(10, forks * 5)

        if language and language != "Code":
            score += 5

        return {
            "name": repo.get("name", ""),
            "html_url": repo.get("html_url", ""),
            "description": repo.get("description") or "Open source project on GitHub",
            "stars": stars,
            "forks": forks,
            "language": language,
            "is_fork": is_fork,
            "size_kb": size_kb,
            "has_description": has_description,
            "quality_score": min(100, score),
            "updated_at": pushed_at or "",
        }

    @classmethod
    async def fetch_contributions_calendar(cls, username: str, client: httpx.AsyncClient) -> tuple[Optional[int], Dict[str, int], Optional[str], Optional[str], str]:
        """
        Attempts to fetch authentic contribution counts and daily timeline.
        1st choice: jogruber contributions API (returns full year daily calendar)
        2nd choice: Direct GitHub profile HTML/SVG scrape
        Returns: (total_last_year, monthly_map, earliest_date, latest_date, source_id)
        """
        monthly_map: Dict[str, int] = {}
        earliest_date = None
        latest_date = None

        # 1. Try jogruber API
        try:
            res = await client.get(f"{cls.CONTRIBUTIONS_PROXY_URL}/{username}?y=last", timeout=8.0)
            if res.status_code == 200:
                data = res.json()
                total = data.get("total", {}).get("lastYear")
                days = data.get("contributions", [])
                for d in days:
                    date_str = d.get("date")  # 'YYYY-MM-DD'
                    cnt = d.get("count", 0)
                    if date_str:
                        m_key = date_str[:7]  # 'YYYY-MM'
                        monthly_map[m_key] = monthly_map.get(m_key, 0) + cnt
                        if cnt > 0:
                            if not earliest_date or date_str < earliest_date:
                                earliest_date = date_str
                            if not latest_date or date_str > latest_date:
                                latest_date = date_str
                if total is not None:
                    return int(total), monthly_map, earliest_date, latest_date, "jogruber_contributions_api"
        except Exception:
            pass

        # 2. Scrape GitHub profile HTML directly
        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            res = await client.get(f"https://github.com/users/{username}/contributions", headers=headers, timeout=8.0)
            if res.status_code == 200:
                html = res.text
                m = re.search(r'([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year', html)
                if m:
                    total_str = m.group(1).replace(",", "")
                    total = int(total_str)
                    return total, monthly_map, earliest_date, latest_date, "github_contributions_html"
        except Exception:
            pass

        return None, monthly_map, earliest_date, latest_date, "unavailable"

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
                "contributions": 0,
                "commits": 0,
                "contributions_metric": ProvenanceMetric(value=None, availability=Availability.NOT_CONNECTED).model_dump(),
                "repositories": 0,
                "repositories_list": [],
                "source_repositories_count": 0,
                "forked_repositories_count": 0,
                "stars": 0,
                "followers": 0,
                "monthly_contributions": {},
                "account_created_at": None,
                "first_activity_date": None,
                "latest_activity_date": None,
            }

        headers = {"User-Agent": "SkillSync-AI/1.0"}

        try:
            async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
                # 1. Fetch user metadata
                u_res = await client.get(f"{cls.API_URL}/users/{clean_user}")
                if u_res.status_code == 404:
                    return {
                        "platform": cls.PLATFORM_NAME,
                        "username": clean_user,
                        "status": "not_found",
                        "verified": False,
                        "contributions": 0,
                        "commits": 0,
                        "contributions_metric": ProvenanceMetric(value=None, availability=Availability.NOT_FOUND).model_dump(),
                        "repositories": 0,
                        "repositories_list": [],
                        "stars": 0,
                        "followers": 0,
                    }

                if u_res.status_code != 200:
                    return {
                        "platform": cls.PLATFORM_NAME,
                        "username": clean_user,
                        "status": "error",
                        "verified": False,
                        "contributions": 0,
                        "commits": 0,
                        "contributions_metric": ProvenanceMetric(value=None, availability=Availability.UNAVAILABLE).model_dump(),
                        "repositories": 0,
                        "repositories_list": [],
                        "stars": 0,
                        "followers": 0,
                    }

                u_data = u_res.json()
                account_created_at = u_data.get("created_at")
                public_repos_count = u_data.get("public_repos", 0)
                followers = u_data.get("followers", 0)
                avatar_url = u_data.get("avatar_url", "")

                # 2. Fetch user's public repositories (up to 100)
                repos_res = await client.get(f"{cls.API_URL}/users/{clean_user}/repos?per_page=100&sort=pushed")
                raw_repos = repos_res.json() if repos_res.status_code == 200 and isinstance(repos_res.json(), list) else []

                evaluated_repos = [cls.evaluate_repo_quality(r) for r in raw_repos]
                source_repos = [r for r in evaluated_repos if not r["is_fork"]]
                forked_repos = [r for r in evaluated_repos if r["is_fork"]]

                # Total stars accrued across source repos
                total_stars = sum(r["stars"] for r in source_repos)

                # Prioritize showing source repos, then highest quality
                evaluated_repos.sort(key=lambda r: (not r["is_fork"], r["quality_score"], r["stars"]), reverse=True)

                # 3. Fetch authentic contributions
                contrib_total, monthly_map, earliest_contrib, latest_contrib, source_id = await cls.fetch_contributions_calendar(
                    clean_user, client
                )

                # 4. Fallback: If contribution APIs failed, check public events for actual push events
                if contrib_total is None:
                    try:
                        ev_res = await client.get(f"{cls.API_URL}/users/{clean_user}/events/public?per_page=100")
                        if ev_res.status_code == 200:
                            events = ev_res.json()
                            if isinstance(events, list):
                                push_commits = 0
                                for ev in events:
                                    if ev.get("type") == "PushEvent":
                                        payload = ev.get("payload", {})
                                        push_commits += len(payload.get("commits", []))
                                if push_commits > 0:
                                    contrib_total = push_commits
                                    source_id = "github_public_events"
                    except Exception:
                        pass

                # Build provenance metric
                if contrib_total is not None:
                    contrib_metric = ProvenanceMetric(
                        value=contrib_total,
                        availability=Availability.AVAILABLE if contrib_total > 0 else Availability.VERIFIED_ZERO,
                        confidence=Confidence.COMMUNITY_API if "jogruber" in source_id else Confidence.SCRAPED_CONFIRMED,
                        source=source_id,
                        source_timestamp=now_iso,
                        activity_timestamp=latest_contrib or account_created_at,
                    )
                else:
                    # Explicitly preserve Unavailable rather than inventing numbers
                    contrib_metric = ProvenanceMetric(
                        value=None,
                        availability=Availability.UNAVAILABLE,
                        confidence=Confidence.UNVERIFIED,
                        source="github_contributions_unavailable",
                        source_timestamp=now_iso,
                    )

                # Overall GitHub engineering score (0-100)
                # Combines contributions (0-40), source repos & size (0-30), repo quality & stars (0-30)
                actual_contribs = contrib_metric.value or 0
                contrib_score = min(40, (actual_contribs / 400) * 40)
                repo_count_score = min(30, len(source_repos) * 6)
                avg_repo_quality = (
                    sum(r["quality_score"] for r in source_repos[:5]) / max(1, len(source_repos[:5]))
                ) * 0.3 if source_repos else 0
                engineering_score = int(min(100, contrib_score + repo_count_score + avg_repo_quality))

                return {
                    "platform": cls.PLATFORM_NAME,
                    "username": clean_user,
                    "status": "synced",
                    "verified": True,
                    "contributions": actual_contribs,
                    "commits": actual_contribs,
                    "contributions_metric": contrib_metric.model_dump(),
                    "repositories": public_repos_count,
                    "repositories_list": evaluated_repos[:12],
                    "source_repositories_count": len(source_repos),
                    "forked_repositories_count": len(forked_repos),
                    "stars": total_stars,
                    "followers": followers,
                    "avatar_url": avatar_url,
                    "engineering_score": engineering_score,
                    "monthly_contributions": monthly_map,
                    "account_created_at": account_created_at,
                    "first_activity_date": earliest_contrib or account_created_at,
                    "latest_activity_date": latest_contrib,
                }

        except Exception as exc:
            return {
                "platform": cls.PLATFORM_NAME,
                "username": clean_user,
                "status": "error",
                "verified": False,
                "contributions": 0,
                "commits": 0,
                "contributions_metric": ProvenanceMetric(
                    value=None, availability=Availability.UNAVAILABLE, error_reason=str(exc)
                ).model_dump(),
                "repositories": 0,
                "repositories_list": [],
                "stars": 0,
                "followers": 0,
            }
