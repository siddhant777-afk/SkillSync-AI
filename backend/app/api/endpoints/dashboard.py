from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.achievement import Achievement
from app.models.project import Project
from app.models.recommendation import Recommendation
from app.models.skill import Skill, SkillGap
from app.models.user import User

router = APIRouter()


@router.get("")
def get_dashboard_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = user.profile
    accounts = user.connected_accounts

    # Platform stats
    stats = {ps.platform: ps.stats_data for ps in user.platform_stats}

    gh_username = accounts.github_username if accounts else ""
    lc_username = accounts.leetcode_username if accounts else ""
    cf_username = accounts.codeforces_username if accounts else ""
    cc_username = accounts.codechef_username if accounts else ""
    kg_username = accounts.kaggle_username if accounts else ""

    github_stats = stats.get("github", {
        "username": gh_username,
        "contributions": 0 if not gh_username else 150,
        "repositories": 0 if not gh_username else 5,
    })
    leetcode_stats = stats.get("leetcode", {
        "username": lc_username,
        "solved": 0 if not lc_username else 45,
        "rank": "Unranked" if not lc_username else "Top 45%",
    })
    codeforces_stats = stats.get("codeforces", {
        "username": cf_username,
        "rating": 0 if not cf_username else 1200,
        "title": "Unrated" if not cf_username else "Newbie",
    })
    codechef_stats = stats.get("codechef", {
        "username": cc_username,
        "rating": 0 if not cc_username else 1400,
        "title": "Unrated" if not cc_username else "1★",
    })
    kaggle_stats = stats.get("kaggle", {
        "username": kg_username,
        "notebooks": 0 if not kg_username else 1,
    })

    # Skills & Gaps
    skills = [
        {"name": s.name, "level": s.level, "status": s.status, "category": s.category}
        for s in user.skills
    ]
    if not skills:
        skills = [
            {"name": "Python", "level": 90, "status": "Strong"},
            {"name": "DSA", "level": 88, "status": "Strong"},
            {"name": "Machine Learning", "level": 80, "status": "Strong"},
            {"name": "SQL", "level": 75, "status": "Strong"},
            {"name": "Web Development", "level": 60, "status": "Growing"},
            {"name": "System Design", "level": 40, "status": "Needs Improvement"},
        ]

    skill_gaps = [
        {"name": g.name, "priority": g.priority, "category": g.category}
        for g in user.skill_gaps
    ]
    if not skill_gaps:
        skill_gaps = [
            {"name": "Kubernetes", "priority": "High", "category": "DevOps"},
            {"name": "Data Engineering", "priority": "High", "category": "Data"},
            {"name": "CI/CD", "priority": "Medium", "category": "Engineering"},
            {"name": "Docker", "priority": "Medium", "category": "Cloud"},
            {"name": "Go / Golang", "priority": "Low", "category": "Backend"},
        ]

    # Achievements
    achievements = [
        {"title": a.title, "date": a.date, "description": a.description, "icon": a.icon}
        for a in user.achievements
    ]
    if not achievements:
        achievements = [
            {"title": "500 LeetCode Problems Solved", "date": "20 May 2024", "description": "Consistent DSA practice milestone.", "icon": "leetcode"},
            {"title": "100 Days Coding Streak", "date": "18 May 2024", "description": "Maintained a daily competitive programming streak.", "icon": "streak"},
            {"title": "Top 10% LeetCode Weekly Contest", "date": "12 May 2024", "description": "Strong contest performance.", "icon": "contest"},
        ]

    # Recommendations
    recommendations = [r.text for r in user.recommendations]
    if not recommendations:
        recommendations = [
            "Learn Docker and containerize one of your ML projects.",
            "Practice 50 more Graph and DP problems on LeetCode.",
            "Build and deploy an end-to-end ML project with CI/CD.",
            "Start low-level System Design with APIs, caching and databases.",
        ]

    # Progress charts
    progress = {
        "months": ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
        "leetcode": [420, 455, 500, 540, 585, 625],
        "github": [180, 255, 330, 410, 510, 620],
        "projects": [2, 3, 4, 5, 6, 8],
    }

    # Upcoming coding contests
    upcoming_events = [
        {"title": "LeetCode Weekly Contest 395", "date": "25 May 2024", "time": "08:00 PM"},
        {"title": "Codeforces Round #930", "date": "26 May 2024", "time": "03:35 PM"},
        {"title": "CodeChef Starters 133", "date": "27 May 2024", "time": "11:00 AM"},
    ]

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "initials": "".join([p[0] for p in user.full_name.split() if p]).upper() or "SS",
        "year": profile.year if profile else "3rd Year",
        "branch": profile.branch if profile else "AIML",
        "college": profile.college if profile else "GL Bajaj Institute of Technology and Management",
        "placementReadiness": profile.placement_readiness if profile else 82,
        "profileCompletion": profile.profile_completion if profile else 90,
        "careerGoal": profile.career_goal if profile else "AI / ML Engineer",
        "github": github_stats,
        "leetcode": leetcode_stats,
        "codeforces": codeforces_stats,
        "codechef": codechef_stats,
        "kaggle": kaggle_stats,
        "skills": skills,
        "skillGaps": skill_gaps,
        "achievements": achievements,
        "recommendations": recommendations,
        "progress": progress,
        "upcomingEvents": upcoming_events,
    }


@router.get("/progress")
def get_progress_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = user.profile
    stats = {ps.platform: ps.stats_data for ps in user.platform_stats}
    lc = stats.get("leetcode", {})
    gh = stats.get("github", {})
    projects_count = len(user.projects)

    return {
        "placementReadiness": profile.placement_readiness if profile else 82,
        "problemsSolved": lc.get("solved", 420),
        "githubContributions": gh.get("contributions", 620),
        "projectsCount": max(3, projects_count),
        "profileCompletion": profile.profile_completion if profile else 90,
        "history": {
            "months": ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
            "leetcode": [420, 455, 500, 540, 585, 625],
            "github": [180, 255, 330, 410, 510, 620],
            "readiness": [68, 72, 75, 78, 80, profile.placement_readiness if profile else 82],
        },
    }
