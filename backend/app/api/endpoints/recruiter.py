from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.normalizer import normalize_college_name, normalize_branch_name, are_colleges_matching
from app.models.profile import PlatformStats, StudentProfile
from app.models.user import User

router = APIRouter()


def create_platform_breakdown(
    lc_handle, lc_rating, lc_badge, lc_solved, lc_adv,
    cf_handle, cf_rating, cf_rank, cf_solved,
    cc_handle, cc_rating, cc_stars, cc_solved,
    gh_handle, gh_commits, gh_repos_count, gh_repos=None
):
    return {
        "leetcode": {
            "platform": "LeetCode",
            "handle": lc_handle,
            "verified": bool(lc_handle),
            "contestRating": lc_rating,
            "contestBadge": lc_badge,
            "solved": lc_solved,
            "advancedTopicsSolved": lc_adv,
            "profileUrl": f"https://leetcode.com/u/{lc_handle}" if lc_handle else "",
        },
        "codeforces": {
            "platform": "Codeforces",
            "handle": cf_handle,
            "verified": bool(cf_handle),
            "rating": cf_rating,
            "maxRating": cf_rating,
            "rank": cf_rank,
            "solved": cf_solved,
            "profileUrl": f"https://codeforces.com/profile/{cf_handle}" if cf_handle else "",
        },
        "codechef": {
            "platform": "CodeChef",
            "handle": cc_handle,
            "verified": bool(cc_handle),
            "rating": cc_rating,
            "stars": cc_stars,
            "solved": cc_solved,
            "profileUrl": f"https://www.codechef.com/users/{cc_handle}" if cc_handle else "",
        },
        "github": {
            "platform": "GitHub",
            "handle": gh_handle,
            "verified": bool(gh_handle),
            "commits": gh_commits,
            "repositoriesCount": gh_repos_count,
            "repositoriesList": gh_repos or [],
            "profileUrl": f"https://github.com/{gh_handle}" if gh_handle else "",
        },
    }


@router.get("/candidates")
def search_candidates(
    role: Optional[str] = Query(None, description="Filter by career goal or sector"),
    college: Optional[str] = Query(None, description="Filter by college"),
    min_score: Optional[int] = Query(0, description="Minimum placement readiness score"),
    min_leetcode: Optional[int] = Query(0, description="Minimum LeetCode solved problems"),
    min_dp: Optional[int] = Query(0, description="Minimum Advanced Topics solved"),
    min_advanced: Optional[int] = Query(0, description="Minimum Advanced Topics solved"),
    skill: Optional[str] = Query(None, description="Search by skill name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = []
    effective_min_adv = max(min_dp or 0, min_advanced or 0)

    # 1. Real DB students
    query = db.query(User).filter(User.role == "student")
    users = query.all()

    for u in users:
        profile = u.profile
        if not profile:
            continue

        readiness = profile.placement_readiness if profile and profile.placement_readiness is not None else 0
        if min_score and readiness < min_score:
            continue

        if role and role.lower() not in (profile.career_goal or "").lower():
            continue

        if college and not are_colleges_matching(college, profile.college):
            continue

        stats = {ps.platform: ps.stats_data for ps in u.platform_stats}
        lc_stats = stats.get("leetcode", {})
        lc_solved = lc_stats.get("solved", 0)
        topic_counts = lc_stats.get("topic_counts", {})
        dp_solved = topic_counts.get("dp_specific", 0)
        adv_topics = topic_counts.get("advanced_topics", 0) or topic_counts.get("dp_and_advanced", 0) or dp_solved
        alg_depth = lc_stats.get("algorithmic_depth_score", 0)

        if min_leetcode and lc_solved < min_leetcode:
            continue

        if effective_min_adv and adv_topics < effective_min_adv:
            continue

        user_skills = [s.name for s in u.skills]
        if skill and not any(skill.lower() in s.lower() for s in user_skills):
            continue

        cf_stats = stats.get("codeforces", {})
        cc_stats = stats.get("codechef", {})
        gh_stats = stats.get("github", {})

        lc_contest_rating = lc_stats.get("contest_rating", 0)
        cf_rating = cf_stats.get("rating", 0)
        cc_rating = cc_stats.get("rating", 0)
        max_contest_rating = max(lc_contest_rating, cf_rating, cc_rating, 0)

        cf_solved = cf_stats.get("solved", 0)
        cc_solved = cc_stats.get("solved", 0)
        total_questions = lc_solved + cf_solved + cc_solved

        gh_commits = gh_stats.get("commits", 0) or gh_stats.get("contributions", 0)
        projects_count = len(u.projects)
        achievements_list = [a.title for a in u.achievements]
        achievements_count = len(achievements_list)

        results.append({
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "college": normalize_college_name(profile.college) if (profile and profile.college) else "",
            "branch": normalize_branch_name(profile.branch) if (profile and profile.branch) else "",
            "year": profile.year if (profile and profile.year) else "",
            "careerGoal": profile.career_goal or "Software Engineer",
            "placementReadiness": readiness,
            # Priority metrics (1 to 5)
            "maxContestRating": max_contest_rating,
            "totalQuestionsSolved": total_questions,
            "achievementsCount": achievements_count,
            "projectsCount": projects_count,
            "commitsCount": gh_commits,
            # Individual platform metrics
            "leetcodeSolved": lc_solved,
            "leetcodeContestRating": lc_contest_rating,
            "codeforcesRating": cf_rating,
            "codeforcesSolved": cf_solved,
            "codechefRating": cc_rating,
            "codechefSolved": cc_solved,
            "dpSolved": dp_solved,
            "advancedTopicsSolved": adv_topics,
            "algorithmicDepth": alg_depth,
            "githubContributions": gh_commits,
            "skills": user_skills,
            "verifiedHandles": {
                "leetcode": lc_stats.get("verified", False),
                "github": gh_stats.get("verified", False),
                "codeforces": cf_stats.get("verified", False),
                "codechef": cc_stats.get("verified", False),
            },
            "achievements": achievements_list,
            "platformBreakdown": create_platform_breakdown(
                lc_handle=lc_stats.get("username") or "",
                lc_rating=lc_contest_rating,
                lc_badge=lc_stats.get("contest_badge") or "",
                lc_solved=lc_solved,
                lc_adv=adv_topics,
                cf_handle=cf_stats.get("username") or "",
                cf_rating=cf_rating,
                cf_rank=cf_stats.get("rank") or cf_stats.get("title") or "Unrated",
                cf_solved=cf_solved,
                cc_handle=cc_stats.get("username") or "",
                cc_rating=cc_rating,
                cc_stars=cc_stats.get("stars") or "",
                cc_solved=cc_solved,
                gh_handle=gh_stats.get("username") or "",
                gh_commits=gh_commits,
                gh_repos_count=gh_stats.get("repositories", 0) or len(gh_stats.get("repositories_list", [])),
                gh_repos=gh_stats.get("repositories_list", []),
            ),
        })


    # Strict multi-tier priority sort:
    # 1st: Contest Rating -> 2nd: Questions Solved -> 3rd: Achievements -> 4th: Projects -> 5th: Commits
    results.sort(
        key=lambda c: (
            c.get("maxContestRating", 0),
            c.get("totalQuestionsSolved", 0),
            c.get("achievementsCount", 0),
            c.get("projectsCount", 0),
            c.get("commitsCount", 0),
            c.get("placementReadiness", 0),
        ),
        reverse=True,
    )
    return results
