"""
Platform Sync Service
Orchestrates verified data collection across GitHub, LeetCode, Codeforces, and CodeChef
using specialized platform adapters.
Computes placement readiness via authoritative RankingEngine.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx
from sqlalchemy.orm import Session

from app.models.profile import ConnectedAccounts, PlatformStats, StudentProfile
from app.models.user import User
from app.services.adapters import (
    CodeChefAdapter,
    CodeforcesAdapter,
    GitHubAdapter,
    LeetCodeAdapter,
)
from app.services.ranking_engine import RankingEngine
from app.services.timeline_service import TimelineService


class PlatformSyncService:
    @classmethod
    async def verify_handle(cls, platform: str, username: str) -> Dict[str, Any]:
        """Verify whether a user handle exists on a specified platform."""
        clean_user = (username or "").strip()
        clean_platform = (platform or "").strip().lower()

        if not clean_user:
            return {"platform": clean_platform, "username": "", "exists": False, "verified": False}

        if clean_platform == "github":
            headers = {"User-Agent": "SkillSync-AI/1.0"}
            async with httpx.AsyncClient(timeout=8.0, headers=headers) as client:
                try:
                    res = await client.get(f"https://api.github.com/users/{clean_user}")
                    exists = res.status_code == 200
                    return {
                        "platform": "github",
                        "username": clean_user,
                        "exists": exists,
                        "verified": exists,
                        "avatar_url": res.json().get("avatar_url") if exists else "",
                    }
                except Exception:
                    return {"platform": "github", "username": clean_user, "exists": False, "verified": False}

        elif clean_platform == "leetcode":
            data = await LeetCodeAdapter.fetch_data(clean_user, timeout=8.0)
            exists = data.get("verified", False)
            return {
                "platform": "leetcode",
                "username": clean_user,
                "exists": exists,
                "verified": exists,
            }

        elif clean_platform == "codeforces":
            data = await CodeforcesAdapter.fetch_data(clean_user, timeout=8.0)
            exists = data.get("verified", False)
            return {
                "platform": "codeforces",
                "username": clean_user,
                "exists": exists,
                "verified": exists,
            }

        elif clean_platform == "codechef":
            data = await CodeChefAdapter.fetch_data(clean_user, timeout=10.0)
            exists = data.get("verified", False)
            return {
                "platform": "codechef",
                "username": clean_user,
                "exists": exists,
                "verified": exists,
            }

        return {"platform": clean_platform, "username": clean_user, "exists": False, "verified": False}

    @classmethod
    async def sync_github(cls, username: str) -> Dict[str, Any]:
        return await GitHubAdapter.fetch_data(username)

    @classmethod
    async def sync_codeforces(cls, username: str) -> Dict[str, Any]:
        return await CodeforcesAdapter.fetch_data(username)

    @classmethod
    async def sync_leetcode(cls, username: str) -> Dict[str, Any]:
        return await LeetCodeAdapter.fetch_data(username)

    @classmethod
    async def sync_codechef(cls, username: str) -> Dict[str, Any]:
        return await CodeChefAdapter.fetch_data(username)

    @classmethod
    async def sync_all_accounts(cls, db: Session, user_id: int) -> Dict[str, Any]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}

        accounts = db.query(ConnectedAccounts).filter(ConnectedAccounts.user_id == user_id).first()
        if not accounts:
            accounts = ConnectedAccounts(user_id=user_id)
            db.add(accounts)
            db.commit()
            db.refresh(accounts)

        # Run fetches through specialized adapters
        gh_data = await cls.sync_github(accounts.github_username)
        cf_data = await cls.sync_codeforces(accounts.codeforces_username)
        lc_data = await cls.sync_leetcode(accounts.leetcode_username)
        cc_data = await cls.sync_codechef(accounts.codechef_username)

        platforms_map = {
            "github": gh_data,
            "codeforces": cf_data,
            "leetcode": lc_data,
            "codechef": cc_data,
        }

        # Persist stats in PlatformStats
        for platform, data in platforms_map.items():
            stat_obj = (
                db.query(PlatformStats)
                .filter(PlatformStats.user_id == user_id, PlatformStats.platform == platform)
                .first()
            )
            if not stat_obj:
                stat_obj = PlatformStats(
                    user_id=user_id,
                    platform=platform,
                    stats_data=data,
                    last_synced=datetime.now(timezone.utc),
                )
                db.add(stat_obj)
            else:
                stat_obj.stats_data = data
                stat_obj.last_synced = datetime.now(timezone.utc)

        # Build dynamic timeline
        timeline = TimelineService.build_timeline(
            leetcode_stats=lc_data,
            github_stats=gh_data,
            codeforces_stats=cf_data,
            codechef_stats=cc_data,
        )

        # Compute authoritative composite score via RankingEngine
        ranking_result = RankingEngine.calculate_composite_score(
            leetcode_stats=lc_data,
            codeforces_stats=cf_data,
            codechef_stats=cc_data,
            github_stats=gh_data,
            projects=user.projects,
            achievements=user.achievements,
            timeline=timeline,
        )

        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if profile:
            profile.placement_readiness = ranking_result.get("placement_readiness", 0)

        accounts.last_synced_at = datetime.now(timezone.utc)
        db.commit()

        return platforms_map
