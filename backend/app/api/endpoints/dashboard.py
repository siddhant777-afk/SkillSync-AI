from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import ConnectedAccounts, PlatformStats, StudentProfile
from app.models.project import Project
from app.models.skill import Skill, SkillGap
from app.models.user import User
from app.services.profile_service import update_user_profile_completion
from app.services.ranking_engine import RankingEngine
from app.services.timeline_service import TimelineService

router = APIRouter()


@router.get("")
def get_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = user.profile
    accounts = user.connected_accounts

    # Get platform stats
    platform_stats = user.platform_stats
    stats = {ps.platform: ps.stats_data for ps in platform_stats}

    gh_username = accounts.github_username if accounts else ""
    lc_username = accounts.leetcode_username if accounts else ""
    cf_username = accounts.codeforces_username if accounts else ""
    cc_username = accounts.codechef_username if accounts else ""
    kg_username = accounts.kaggle_username if accounts else ""

    gh_verified = bool(gh_username and "github" in stats and stats["github"].get("verified"))
    github_stats = stats.get("github", {
        "username": gh_username,
        "contributions": 0,
        "commits": 0,
        "repositories": 0,
        "repositories_list": [],
        "stars": 0,
        "followers": 0,
        "verified": False,
        "status": "synced" if gh_verified else "unconnected",
    })

    lc_verified = bool(lc_username and "leetcode" in stats and stats["leetcode"].get("verified"))
    leetcode_stats = stats.get("leetcode", {
        "username": lc_username,
        "solved": 0,
        "rank": "Unconnected" if not lc_username else "Unranked",
        "easy": 0,
        "medium": 0,
        "hard": 0,
        "acceptanceRate": 0.0,
        "contest_rating": 0,
        "contest_global_rank": 0,
        "contest_attended": 0,
        "contest_badge": "",
        "verified": False,
        "status": "synced" if lc_verified else "unconnected",
        "topic_counts": {},
        "topics": [],
        "algorithmic_depth_score": 0,
    })

    cf_verified = bool(cf_username and "codeforces" in stats and stats["codeforces"].get("verified"))
    codeforces_stats = stats.get("codeforces", {
        "username": cf_username,
        "rating": 0,
        "title": "Unconnected" if not cf_username else "Unrated",
        "maxRating": 0,
        "solved": 0,
        "verified": False,
        "status": "synced" if cf_verified else "unconnected",
        "rating_bands": {},
        "problem_indices": {},
        "topic_tags": {},
        "contest_history": [],
    })

    cc_verified = bool(cc_username and "codechef" in stats and stats["codechef"].get("verified"))
    codechef_stats = stats.get("codechef", {
        "username": cc_username,
        "rating": 0,
        "highest_rating": None,
        "highestRating": None,
        "title": "Unconnected" if not cc_username else "Unrated",
        "global_rank": None,
        "globalRank": 0,
        "country_rank": None,
        "countryRank": None,
        "solved": 0,
        "stars": "Unrated",
        "division": "Unrated",
        "difficulty_distribution": [],
        "difficulty_bands": {},
        "profile": {
            "rating": None,
            "highest_rating": None,
            "stars": "Unrated",
            "division": "Unrated",
            "global_rank": None,
            "country_rank": None,
        },
        "problems": {
            "total_solved": 0,
            "unique_solved_count": 0,
            "difficulty_distribution": [],
            "difficulty_bands": {},
            "contest_solved": 0,
            "practice_solved": 0,
        },
        "verified": False,
        "status": "synced" if cc_verified else "unconnected",
    })


    kg_verified = bool(kg_username and "kaggle" in stats and stats["kaggle"].get("verified"))
    kaggle_stats = stats.get("kaggle", {
        "username": kg_username,
        "notebooks": 0,
        "tier": "Unconnected" if not kg_username else "Contributor",
        "competitions": 0,
        "verified": False,
        "status": "synced" if kg_verified else "unconnected",
    })

    # Real user technical skills
    skills = [
        {"name": s.name, "level": s.level, "status": s.status, "category": s.category}
        for s in user.skills
    ]

    skill_gaps = [
        {"name": g.name, "priority": g.priority, "category": g.category}
        for g in user.skill_gaps
    ]

    # Real user achievements
    achievements = [
        {
            "id": a.id,
            "title": a.title,
            "date": a.date,
            "description": a.description,
            "icon": a.icon or "trophy",
        }
        for a in user.achievements
    ]

    # Recommendations
    recommendations = [r.text for r in user.recommendations]
    if not recommendations:
        recs = []
        if not lc_username:
            recs.append("Connect and verify your LeetCode handle to analyze DSA topic depth.")
        elif (leetcode_stats.get("solved") or 0) < 50:
            recs.append("Solve 30 more Core DSA & Advanced Topics problems on LeetCode to boost your placement score.")
        if not gh_username:
            recs.append("Connect your GitHub handle to showcase open-source projects and commit activity.")
        if not skills:
            recs.append("Add your key technical skills in Skills page to personalize job role matching.")
        if not achievements:
            recs.append("Log your non-DSA achievements (Hackathons, Research, Certifications) to stand out to recruiters.")
        recs.append("Review the Job Recommendations page to identify skill gaps for your dream role.")
        recommendations = recs[:4]

    # Build dynamic multi-platform timeline (no hardcoding, no synthetic multipliers)
    progress = TimelineService.build_timeline(
        leetcode_stats=leetcode_stats,
        github_stats=github_stats,
        codeforces_stats=codeforces_stats,
        codechef_stats=codechef_stats,
        max_months=12,
    )

    # Compute authoritative composite score via RankingEngine
    ranking_breakdown = RankingEngine.calculate_composite_score(
        leetcode_stats=leetcode_stats,
        codeforces_stats=codeforces_stats,
        codechef_stats=codechef_stats,
        github_stats=github_stats,
        projects=user.projects,
        achievements=user.achievements,
        timeline=progress,
    )

    readiness = ranking_breakdown["placement_readiness"]
    if profile:
        profile.placement_readiness = readiness
        db.commit()

    # Authentic ATS Score calculation
    resume = user.resume
    ats_score = resume.ats_score if (resume and resume.ats_score is not None) else 0

    # Dynamic Profile Completion
    completion_score = update_user_profile_completion(user, db)

    # Coding contests
    upcoming_events = [
        {"title": "LeetCode Weekly Contest", "date": "Every Sunday", "time": "08:00 AM"},
        {"title": "Codeforces Div 2 / Div 3 Round", "date": "Bi-weekly", "time": "08:05 PM"},
        {"title": "CodeChef Starters", "date": "Every Wednesday", "time": "08:00 PM"},
    ]

    initials = "".join([p[0] for p in user.full_name.split() if p]).upper() or "SS"

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "initials": initials,
        "year": profile.year if profile and profile.year else "",
        "branch": profile.branch if profile and profile.branch else "",
        "college": profile.college if profile and profile.college else "",
        "placementReadiness": readiness,
        "profileCompletion": completion_score,
        "careerGoal": profile.career_goal if profile and profile.career_goal else "",
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
        "ranking": ranking_breakdown,
        "upcomingEvents": upcoming_events,
        "ats_score": ats_score,
        "atsScore": ats_score,
    }


@router.get("/progress")
def get_progress_analytics(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = user.profile
    stats = {ps.platform: ps.stats_data for ps in user.platform_stats}
    lc = stats.get("leetcode", {})
    gh = stats.get("github", {})
    cf = stats.get("codeforces", {})
    cc = stats.get("codechef", {})

    # Build dynamic timeline
    progress = TimelineService.build_timeline(
        leetcode_stats=lc,
        github_stats=gh,
        codeforces_stats=cf,
        codechef_stats=cc,
        max_months=12,
    )

    ranking_breakdown = RankingEngine.calculate_composite_score(
        leetcode_stats=lc,
        codeforces_stats=cf,
        codechef_stats=cc,
        github_stats=gh,
        projects=user.projects,
        achievements=user.achievements,
        timeline=progress,
    )

    readiness = ranking_breakdown["placement_readiness"]
    completion_score = update_user_profile_completion(user, db)

    return {
        "placementReadiness": readiness,
        "problemsSolved": lc.get("solved", 0) + cf.get("solved", 0) + cc.get("solved", 0),
        "leetcodeSolved": lc.get("solved", 0),
        "codeforcesSolved": cf.get("solved", 0),
        "codechefSolved": cc.get("solved", 0),
        "githubContributions": gh.get("contributions", 0),
        "projectsCount": len(user.projects),
        "profileCompletion": completion_score,
        "timeline": progress,
        "ranking": ranking_breakdown,
        "leetcode": lc,
        "codeforces": cf,
        "codechef": cc,
        "github": gh,
    }
