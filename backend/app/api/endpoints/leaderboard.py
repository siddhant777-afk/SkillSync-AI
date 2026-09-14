from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.normalizer import normalize_college_name, normalize_branch_name
from app.models.profile import PlatformStats, StudentProfile
from app.models.user import User
from app.services.ranking_engine import RankingEngine
from app.services.timeline_service import TimelineService

router = APIRouter()


@router.get("")
def get_multi_college_leaderboard(
    college: Optional[str] = Query("all", description="Filter by college name or 'all'"),
    branch: Optional[str] = Query("all", description="Filter by branch or 'all'"),
    sort_by: Optional[str] = Query("composite", description="Sort by: composite, dsa, contest, engineering, readiness, dp_advanced"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Multi-college student ranking system evaluated by authoritative RankingEngine across
    Competitive Programming, Problem Solving Depth, Software Engineering, and Portfolio.
    """
    all_students = []

    # 1. Fetch real DB students
    db_users = db.query(User).filter(User.role == "student").all()
    for u in db_users:
        profile = u.profile
        stats = {ps.platform: ps.stats_data for ps in u.platform_stats}
        lc = stats.get("leetcode", {})
        cf = stats.get("codeforces", {})
        cc = stats.get("codechef", {})
        gh = stats.get("github", {})

        lc_solved = lc.get("solved", 0)
        topic_counts = lc.get("topic_counts", {})
        dp_count = topic_counts.get("dp_specific", 0)
        dp_adv_count = topic_counts.get("advanced_topics", 0) or topic_counts.get("dp_and_advanced", 0)
        alg_depth = lc.get("algorithmic_depth_score", 0)

        cf_rating = cf.get("rating", 0)
        cf_rank = cf.get("title", "Unrated")

        cc_rating = cc.get("rating", 0)
        cc_stars = cc.get("stars", "Unrated")

        gh_contribs = gh.get("contributions", 0) or gh.get("commits", 0)

        # Build timeline & compute authoritative score
        timeline = TimelineService.build_timeline(
            leetcode_stats=lc,
            github_stats=gh,
            codeforces_stats=cf,
            codechef_stats=cc,
            max_months=6,
        )

        ranking = RankingEngine.calculate_composite_score(
            leetcode_stats=lc,
            codeforces_stats=cf,
            codechef_stats=cc,
            github_stats=gh,
            projects=u.projects,
            achievements=u.achievements,
            timeline=timeline,
        )

        composite_score = ranking.get("composite_score", 0.0)
        dim_scores = ranking.get("dimension_scores", {})
        cp_score = dim_scores.get("competitive_programming") or 0.0
        depth_score = dim_scores.get("problem_solving_depth") or 0.0
        eng_score = dim_scores.get("software_engineering") or 0.0
        proj_score = dim_scores.get("project_portfolio") or 0.0

        badges = ranking.get("badges", [])
        top_ach = u.achievements[0].title if u.achievements else None

        user_college = normalize_college_name(profile.college) if (profile and profile.college) else ""
        user_branch = normalize_branch_name(profile.branch) if (profile and profile.branch) else ""

        all_students.append({
            "id": u.id,
            "name": u.full_name,
            "college": user_college,
            "branch": user_branch,
            "year": profile.year if profile and profile.year else "",
            "compositeScore": composite_score,
            "cpScore": cp_score,
            "depthScore": depth_score,
            "engineeringScore": eng_score,
            "projectScore": proj_score,
            "leetcodeSolved": lc_solved,
            "dpSolved": dp_count,
            "dpAndAdvanced": dp_adv_count,
            "advancedTopicsSolved": dp_adv_count,
            "algorithmicDepth": alg_depth,
            "codeforcesRating": cf_rating,
            "codeforcesRank": cf_rank,
            "codechefRating": cc_rating,
            "codechefStars": cc_stars,
            "githubContributions": gh_contribs,
            "placementReadiness": ranking.get("placement_readiness", 0),
            "badges": badges,
            "nonDsaAchievement": top_ach,
            "verified": lc.get("verified", False) or cf.get("verified", False) or gh.get("verified", False) or cc.get("verified", False),
            "isCurrentUser": u.id == user.id,
        })

    # Group colleges and branches case-insensitively
    college_map = {}
    for s in all_students:
        c = s.get("college", "")
        if c:
            key = c.lower()
            if key not in college_map:
                college_map[key] = c

    for s in all_students:
        key = s.get("college", "").lower()
        if key in college_map:
            s["college"] = college_map[key]

    all_colleges = sorted(list(college_map.values()))
    target_college = "GL Bajaj Institute of Technology and Management"
    if target_college not in all_colleges:
        all_colleges.insert(0, target_college)

    branch_map = {}
    for s in all_students:
        b_name = s.get("branch", "")
        if b_name:
            key = b_name.lower()
            if key not in branch_map:
                branch_map[key] = b_name

    for s in all_students:
        key = s.get("branch", "").lower()
        if key in branch_map:
            s["branch"] = branch_map[key]

    all_branches = sorted(list(branch_map.values()))

    # Apply filters
    filtered = all_students
    if college and college.strip().lower() != "all":
        norm_filter = college.strip().lower()
        filtered = [
            s for s in filtered
            if s["college"] and (norm_filter in s["college"].lower() or s["college"].lower() in norm_filter)
        ]

    if branch and branch.strip().lower() != "all":
        norm_b_filter = branch.strip().lower()
        filtered = [
            s for s in filtered
            if s["branch"] and (norm_b_filter in s["branch"].lower() or s["branch"].lower() in norm_b_filter)
        ]

    # Apply sorting
    if sort_by in ("contest", "cp"):
        filtered.sort(key=lambda s: (s["cpScore"], s["codeforcesRating"], s["leetcodeSolved"]), reverse=True)
    elif sort_by in ("dsa", "depth"):
        filtered.sort(key=lambda s: (s["depthScore"], s["leetcodeSolved"], s["algorithmicDepth"]), reverse=True)
    elif sort_by in ("engineering", "github"):
        filtered.sort(key=lambda s: (s["engineeringScore"], s["githubContributions"]), reverse=True)
    elif sort_by in ("dp_advanced", "advanced_topics"):
        filtered.sort(key=lambda s: (s["advancedTopicsSolved"], s["algorithmicDepth"], s["leetcodeSolved"]), reverse=True)
    else:  # default 'composite' or 'readiness'
        filtered.sort(key=lambda s: (s["compositeScore"], s["depthScore"], s["leetcodeSolved"]), reverse=True)

    # Assign rank numbers
    ranked_list = []
    for idx, student in enumerate(filtered, start=1):
        item = dict(student)
        item["rank"] = idx
        ranked_list.append(item)

    podium = ranked_list[:3]

    return {
        "colleges": all_colleges,
        "branches": all_branches,
        "totalStudents": len(ranked_list),
        "sortBy": sort_by,
        "topPodium": podium,
        "leaderboard": ranked_list,
    }
