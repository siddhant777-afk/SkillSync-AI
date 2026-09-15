"""
Contest API Endpoints
Provides real-time contest calendar data for Codeforces, LeetCode, and CodeChef.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Query

from app.services.contest_service import ContestService

router = APIRouter()


@router.get("", response_model=Dict[str, Any])
async def get_contests(
    platform: str = Query("all", description="Filter by platform: all, codeforces, leetcode, codechef"),
    status: str = Query("all", description="Filter by status: all, live, upcoming, completed"),
    search: Optional[str] = Query(None, description="Search term for contest title"),
    refresh: bool = Query(False, description="Force refresh external platform data"),
) -> Dict[str, Any]:
    """
    Retrieve real coding contests from Codeforces, LeetCode, and CodeChef.
    Supports platform, status, and search filters with live dynamic status calculation.
    """
    data = await ContestService.get_all_contests(force_refresh=refresh)
    contests = data.get("contests", [])

    # Filter by platform
    clean_platform = (platform or "all").lower().strip()
    if clean_platform != "all":
        contests = [c for c in contests if c.get("platform") == clean_platform]

    # Filter by status
    clean_status = (status or "all").lower().strip()
    if clean_status != "all":
        contests = [c for c in contests if c.get("status") == clean_status]

    # Filter by search
    if search:
        query = search.lower().strip()
        contests = [c for c in contests if query in c.get("name", "").lower() or query in c.get("description", "").lower()]

    return {
        "contests": contests,
        "total_count": len(contests),
        "last_updated": data.get("last_updated"),
        "platform_status": data.get("platform_status", {}),
    }
