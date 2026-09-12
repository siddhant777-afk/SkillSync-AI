from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.profile import PlatformStats, StudentProfile
from app.models.user import User

router = APIRouter()


@router.get("/candidates")
def search_candidates(
    role: Optional[str] = Query(None, description="Filter by career goal / role"),
    min_score: Optional[int] = Query(0, description="Minimum placement readiness score"),
    min_leetcode: Optional[int] = Query(0, description="Minimum LeetCode solved problems"),
    skill: Optional[str] = Query(None, description="Search by skill name"),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(User.role == "student")
    users = query.all()

    results = []
    for u in users:
        profile = u.profile
        if not profile:
            continue

        if min_score and (profile.placement_readiness or 0) < min_score:
            continue

        if role and role.lower() not in (profile.career_goal or "").lower():
            continue

        # Get platform stats
        stats = {ps.platform: ps.stats_data for ps in u.platform_stats}
        lc_solved = stats.get("leetcode", {}).get("solved", 0)
        if min_leetcode and lc_solved < min_leetcode:
            continue

        user_skills = [s.name for s in u.skills]
        if skill and not any(skill.lower() in s.lower() for s in user_skills):
            continue

        cf_rating = stats.get("codeforces", {}).get("rating", 0)
        gh_contributions = stats.get("github", {}).get("contributions", 0)

        results.append(
            {
                "id": u.id,
                "name": u.full_name,
                "email": u.email,
                "college": profile.college,
                "branch": profile.branch,
                "year": profile.year,
                "careerGoal": profile.career_goal,
                "placementReadiness": profile.placement_readiness,
                "leetcodeSolved": lc_solved,
                "codeforcesRating": cf_rating,
                "githubContributions": gh_contributions,
                "skills": user_skills[:5],
                "projectsCount": len(u.projects),
            }
        )

    # Sort candidates by placement readiness descending
    results.sort(key=lambda c: c["placementReadiness"], reverse=True)
    return results
