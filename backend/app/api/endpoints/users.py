from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import ConnectedAccounts, PlatformStats, StudentProfile
from app.models.project import Project
from app.models.resume import ResumeData
from app.models.skill import Skill, SkillGap
from app.models.user import User
from app.schemas import ConnectedAccountsUpdate, ProfileUpdate
from app.services.ai_service import AIService
from app.services.sync_service import PlatformSyncService

router = APIRouter()


@router.get("/profile")
def get_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = user.profile
    accounts = user.connected_accounts

    # Get latest platform stats
    stats = {}
    for ps in user.platform_stats:
        stats[ps.platform] = ps.stats_data

    # Default fallbacks
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

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "initials": "".join([part[0] for part in user.full_name.split() if part]).upper() or "SS",
        "year": profile.year if profile else "3rd Year",
        "branch": profile.branch if profile else "AIML",
        "college": profile.college if profile else "GL Bajaj Institute of Technology and Management",
        "bio": profile.bio if profile else "",
        "careerGoal": profile.career_goal if profile else "AI / ML Engineer",
        "placementReadiness": profile.placement_readiness if profile else 82,
        "profileCompletion": profile.profile_completion if profile else 90,
        "github": github_stats,
        "leetcode": leetcode_stats,
        "codeforces": codeforces_stats,
        "codechef": codechef_stats,
        "kaggle": kaggle_stats,
        "connectedAccounts": {
            "github": accounts.github_username if accounts else "",
            "leetcode": accounts.leetcode_username if accounts else "",
            "codeforces": accounts.codeforces_username if accounts else "",
            "codechef": accounts.codechef_username if accounts else "",
            "kaggle": accounts.kaggle_username if accounts else "",
            "lastSynced": accounts.last_synced_at if accounts else None,
        },
    }


@router.put("/profile")
def update_user_profile(
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = user.profile
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)

    if data.full_name:
        user.full_name = data.full_name
    if data.bio is not None:
        profile.bio = data.bio
    if data.year:
        profile.year = data.year
    if data.branch:
        profile.branch = data.branch
    if data.college:
        profile.college = data.college
    if data.career_goal:
        profile.career_goal = data.career_goal
    if data.target_company_type:
        profile.target_company_type = data.target_company_type

    db.commit()
    return {"success": True, "message": "Profile updated successfully."}


@router.get("/coding-profiles")
def get_coding_profiles(user: User = Depends(get_current_user)):
    accounts = user.connected_accounts
    return {
        "github_username": accounts.github_username if accounts else "",
        "leetcode_username": accounts.leetcode_username if accounts else "",
        "codeforces_username": accounts.codeforces_username if accounts else "",
        "codechef_username": accounts.codechef_username if accounts else "",
        "kaggle_username": accounts.kaggle_username if accounts else "",
        "linkedin_url": accounts.linkedin_url if accounts else "",
    }


@router.put("/coding-profiles")
def update_coding_profiles(
    data: ConnectedAccountsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts = user.connected_accounts
    if not accounts:
        accounts = ConnectedAccounts(user_id=user.id)
        db.add(accounts)

    accounts.github_username = data.github_username or ""
    accounts.leetcode_username = data.leetcode_username or ""
    accounts.codeforces_username = data.codeforces_username or ""
    accounts.codechef_username = data.codechef_username or ""
    accounts.kaggle_username = data.kaggle_username or ""
    accounts.linkedin_url = data.linkedin_url or ""

    db.commit()
    return {"success": True, "message": "Coding accounts updated successfully."}


@router.post("/sync")
async def sync_user_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Sync external platforms (GitHub, LeetCode, Codeforces, CodeChef, Kaggle)
    and re-calculate placement readiness score and skill gaps.
    """
    stats_map = await PlatformSyncService.sync_all_accounts(db, user.id)

    # Recompute Placement Readiness
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    resume = db.query(ResumeData).filter(ResumeData.user_id == user.id).first()

    new_score = AIService.calculate_placement_readiness(stats_map, skills, projects, resume)

    profile = user.profile
    if profile:
        profile.placement_readiness = new_score
        # Dynamically refresh skill gaps based on career goal
        gaps = AIService.identify_skill_gaps(profile.career_goal, skills)
        db.query(SkillGap).filter(SkillGap.user_id == user.id).delete()
        for g in gaps:
            db.add(SkillGap(user_id=user.id, name=g["name"], priority=g["priority"], category=g["category"], reason=g["reason"]))

    db.commit()

    return {
        "success": True,
        "message": "All connected profiles synced successfully!",
        "stats": stats_map,
        "placementReadiness": new_score,
    }


@router.put("/settings")
def update_settings(
    data: Dict[str, Any],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = user.profile
    if "displayName" in data and data["displayName"]:
        user.full_name = data["displayName"]
    if "careerGoal" in data and data["careerGoal"] and profile:
        profile.career_goal = data["careerGoal"]

    db.commit()
    return {"success": True, "message": "Settings saved successfully."}
