from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.normalizer import normalize_college_name, normalize_branch_name
from app.models.profile import PlatformStats, StudentProfile
from app.models.user import User

router = APIRouter()

# Multi-college benchmark profiles for peer comparison
BENCHMARK_STUDENTS = [
    {
        "id": 101,
        "name": "Aarav Gupta",
        "college": "Delhi Technological University (DTU)",
        "branch": "Computer Science",
        "year": "4th Year",
        "leetcodeSolved": 580,
        "dpSolved": 85,
        "algorithmicDepth": 92,
        "codeforcesRating": 1720,
        "codeforcesRank": "Expert",
        "githubContributions": 740,
        "placementReadiness": 94,
        "badges": ["DP & Graph Specialist", "Codeforces Expert"],
        "nonDsaAchievement": "1st Place - Smart India Hackathon 2024",
        "verified": True,
    },
    {
        "id": 102,
        "name": "Priya Mehra",
        "college": "IIT Delhi",
        "branch": "Information Technology",
        "year": "3rd Year",
        "leetcodeSolved": 490,
        "dpSolved": 72,
        "algorithmicDepth": 88,
        "codeforcesRating": 1650,
        "codeforcesRank": "Specialist",
        "githubContributions": 510,
        "placementReadiness": 91,
        "badges": ["DP Specialist", "Open Source Contributor"],
        "nonDsaAchievement": "Published IEEE Paper on Graph Neural Networks",
        "verified": True,
    },
    {
        "id": 103,
        "name": "Rohan Deshmukh",
        "college": "BITS Pilani",
        "branch": "Computer Science",
        "year": "4th Year",
        "leetcodeSolved": 410,
        "dpSolved": 55,
        "algorithmicDepth": 82,
        "codeforcesRating": 1580,
        "codeforcesRank": "Specialist",
        "githubContributions": 620,
        "placementReadiness": 87,
        "badges": ["Core DSA Expert", "Kaggle Bronze"],
        "nonDsaAchievement": "AWS Certified Solutions Architect",
        "verified": True,
    },
    {
        "id": 104,
        "name": "Ananya Sen",
        "college": "IIIT Hyderabad",
        "branch": "AIML",
        "year": "3rd Year",
        "leetcodeSolved": 340,
        "dpSolved": 48,
        "algorithmicDepth": 79,
        "codeforcesRating": 1520,
        "codeforcesRank": "Pupil",
        "githubContributions": 380,
        "placementReadiness": 84,
        "badges": ["AI/ML Specialist", "DP Practitioner"],
        "nonDsaAchievement": "Core Developer - PyTorch NLP Community",
        "verified": True,
    },
    {
        "id": 105,
        "name": "Karan Malhotra",
        "college": "NIT Trichy",
        "branch": "Electronics & Communication",
        "year": "3rd Year",
        "leetcodeSolved": 280,
        "dpSolved": 32,
        "algorithmicDepth": 68,
        "codeforcesRating": 1410,
        "codeforcesRank": "Pupil",
        "githubContributions": 290,
        "placementReadiness": 78,
        "badges": ["Core Algorithms", "Hackathon Winner"],
        "nonDsaAchievement": "Winner - Google Solution Challenge 2024",
        "verified": True,
    },
]


@router.get("")
def get_multi_college_leaderboard(
    college: Optional[str] = Query("all", description="Filter by college name or 'all'"),
    branch: Optional[str] = Query("all", description="Filter by branch or 'all'"),
    sort_by: Optional[str] = Query("dsa", description="Sort by: dsa, dp_advanced, contest, readiness"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Multi-college student ranking system across DSA, DP vs Basics depth, contest ratings, and readiness."""
    all_students = []

    # 1. Fetch real DB students
    db_users = db.query(User).filter(User.role == "student").all()
    for u in db_users:
        profile = u.profile
        stats = {ps.platform: ps.stats_data for ps in u.platform_stats}
        lc = stats.get("leetcode", {})
        cf = stats.get("codeforces", {})
        gh = stats.get("github", {})

        lc_solved = lc.get("solved", 0)
        topic_counts = lc.get("topic_counts", {})
        dp_count = topic_counts.get("dp_specific", 0)
        dp_adv_count = topic_counts.get("dp_and_advanced", 0)
        alg_depth = lc.get("algorithmic_depth_score", 0)
        cf_rating = cf.get("rating", 0)
        cf_rank = cf.get("title", "Unrated")
        gh_contribs = gh.get("contributions", 0)
        readiness = profile.placement_readiness if profile and profile.placement_readiness is not None else 0

        # Topic badges
        badges = []
        if dp_adv_count >= 30:
            badges.append("DP & Graph Specialist")
        elif lc_solved >= 100:
            badges.append("Core DSA Expert")
        elif lc_solved > 0:
            badges.append("Active Coder")
        else:
            badges.append("Rising Talent")

        if cf_rating >= 1600:
            badges.append("Contest Master")
        elif cf_rating >= 1400:
            badges.append("Contest Specialist")

        # Top non-DSA achievement
        top_ach = u.achievements[0].title if u.achievements else None

        user_college = normalize_college_name(profile.college) if (profile and profile.college) else ""
        user_branch = normalize_branch_name(profile.branch) if (profile and profile.branch) else ""

        all_students.append({
            "id": u.id,
            "name": u.full_name,
            "college": user_college,
            "branch": user_branch,
            "year": profile.year if profile and profile.year else "",
            "leetcodeSolved": lc_solved,
            "dpSolved": dp_count or int(dp_adv_count * 0.4),
            "dpAndAdvanced": dp_adv_count,
            "algorithmicDepth": alg_depth,
            "codeforcesRating": cf_rating,
            "codeforcesRank": cf_rank,
            "githubContributions": gh_contribs,
            "placementReadiness": readiness,
            "badges": badges,
            "nonDsaAchievement": top_ach,
            "verified": lc.get("verified", False) or cf.get("verified", False) or gh.get("verified", False),
            "isCurrentUser": u.id == user.id,
        })

    # 2. Append benchmark students ONLY for testing account (subhi@example.com)
    # Real verified users strictly see real registered students from PostgreSQL!
    if user and user.email and user.email.lower().strip() == "subhi@example.com":
        for b in BENCHMARK_STUDENTS:
            all_students.append({
                "id": b["id"],
                "name": b["name"],
                "college": normalize_college_name(b["college"]),
                "branch": normalize_branch_name(b["branch"]),
                "year": b["year"],
                "leetcodeSolved": b["leetcodeSolved"],
                "dpSolved": b["dpSolved"],
                "dpAndAdvanced": int(b["dpSolved"] * 1.5),
                "algorithmicDepth": b["algorithmicDepth"],
                "codeforcesRating": b["codeforcesRating"],
                "codeforcesRank": b["codeforcesRank"],
                "githubContributions": b["githubContributions"],
                "placementReadiness": b["placementReadiness"],
                "badges": b["badges"],
                "nonDsaAchievement": b["nonDsaAchievement"],
                "verified": b["verified"],
                "isCurrentUser": False,
            })

    # Group colleges and branches case-insensitively so differing casing maps to a single canonical name
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
    if sort_by == "contest":
        filtered.sort(key=lambda s: (s["codeforcesRating"], s["leetcodeSolved"]), reverse=True)
    elif sort_by == "readiness":
        filtered.sort(key=lambda s: (s["placementReadiness"], s["leetcodeSolved"]), reverse=True)
    elif sort_by == "dp_advanced":
        filtered.sort(key=lambda s: (s["dpSolved"], s["algorithmicDepth"], s["leetcodeSolved"]), reverse=True)
    else:  # default 'dsa'
        filtered.sort(key=lambda s: (s["leetcodeSolved"], s["algorithmicDepth"]), reverse=True)

    # Assign rank numbers
    ranked_list = []
    for idx, student in enumerate(filtered, start=1):
        item = dict(student)
        item["rank"] = idx
        ranked_list.append(item)

    # Top podium (ranks 1, 2, 3)
    podium = ranked_list[:3]

    return {
        "colleges": all_colleges,
        "branches": all_branches,
        "totalStudents": len(ranked_list),
        "sortBy": sort_by,
        "topPodium": podium,
        "leaderboard": ranked_list,
    }
