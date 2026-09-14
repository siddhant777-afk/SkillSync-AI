from datetime import datetime, timezone
from typing import Any, Dict
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import ConnectedAccounts, PlatformStats, StudentProfile
from app.models.project import Project
from app.models.resume import ResumeData
from app.models.skill import Skill, SkillGap
from app.models.user import User
from app.schemas import ConnectedAccountsUpdate, ProfileUpdate
from app.core.normalizer import normalize_college_name, normalize_branch_name
from app.services.ai_service import AIService
from app.services.profile_service import update_user_profile_completion
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
        "contributions": 0,
        "repositories": 0,
        "stars": 0,
        "status": "unconnected" if not gh_username else "connected",
        "verified": bool(gh_username and "github" in stats and stats["github"].get("verified")),
    })
    leetcode_stats = stats.get("leetcode", {
        "username": lc_username,
        "solved": 0,
        "rank": "Unconnected" if not lc_username else "Unranked",
        "status": "unconnected" if not lc_username else "connected",
        "verified": bool(lc_username and "leetcode" in stats and stats["leetcode"].get("verified")),
    })
    codeforces_stats = stats.get("codeforces", {
        "username": cf_username,
        "rating": 0,
        "title": "Unconnected" if not cf_username else "Unrated",
        "status": "unconnected" if not cf_username else "connected",
        "verified": bool(cf_username and "codeforces" in stats and stats["codeforces"].get("verified")),
    })
    codechef_stats = stats.get("codechef", {
        "username": cc_username,
        "rating": 0,
        "title": "Unconnected" if not cc_username else "Unrated",
        "status": "unconnected" if not cc_username else "connected",
        "verified": bool(cc_username and "codechef" in stats and stats["codechef"].get("verified")),
    })
    kaggle_stats = stats.get("kaggle", {
        "username": kg_username,
        "notebooks": 0,
        "tier": "Unconnected" if not kg_username else "Unranked",
        "status": "unconnected" if not kg_username else "connected",
        "verified": bool(kg_username and "kaggle" in stats and stats["kaggle"].get("verified")),
    })

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "initials": "".join([part[0] for part in user.full_name.split() if part]).upper() or "SS",
        "year": profile.year if profile and profile.year else "",
        "branch": profile.branch if profile and profile.branch else "",
        "college": profile.college if profile and profile.college else "",
        "bio": profile.bio if profile and profile.bio else "",
        "careerGoal": profile.career_goal if profile and profile.career_goal else "",
        "placementReadiness": profile.placement_readiness if profile and profile.placement_readiness is not None else 0,
        "profileCompletion": update_user_profile_completion(user, db),
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
    if data.branch is not None:
        profile.branch = normalize_branch_name(data.branch)
    if data.college is not None:
        profile.college = normalize_college_name(data.college)
    if data.career_goal:
        profile.career_goal = data.career_goal
    if data.target_company_type:
        profile.target_company_type = data.target_company_type

    db.commit()
    update_user_profile_completion(user, db)
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
    update_user_profile_completion(user, db)
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
    update_user_profile_completion(user, db)

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
    update_user_profile_completion(user, db)
    return {"success": True, "message": "Settings saved successfully."}


class VerifyPlatformRequest(BaseModel):
    platform: str
    username: str


@router.post("/verify-platform")
async def verify_and_sync_single_platform(
    payload: VerifyPlatformRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Verify an individual platform handle (leetcode, github, codeforces, codechef, kaggle),
    extract live statistics, persist the verified handle, and recompute placement readiness.
    """
    clean_platform = payload.platform.lower().strip()
    clean_user = payload.username.strip()

    if not clean_user:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    verify_res = await PlatformSyncService.verify_handle(clean_platform, clean_user)
    if not verify_res.get("exists") and not verify_res.get("verified"):
        return {
            "success": False,
            "verified": False,
            "platform": clean_platform,
            "username": clean_user,
            "message": f"Handle '@{clean_user}' could not be verified on {clean_platform.capitalize()}. Please check the handle or ensure your profile privacy is set to Public.",
        }

    # Save to connected accounts
    accounts = user.connected_accounts
    if not accounts:
        accounts = ConnectedAccounts(user_id=user.id)
        db.add(accounts)

    if clean_platform == "leetcode":
        accounts.leetcode_username = clean_user
        stats_data = await PlatformSyncService.sync_leetcode(clean_user)
    elif clean_platform == "github":
        accounts.github_username = clean_user
        stats_data = await PlatformSyncService.sync_github(clean_user)
    elif clean_platform == "codeforces":
        accounts.codeforces_username = clean_user
        stats_data = await PlatformSyncService.sync_codeforces(clean_user)
    elif clean_platform == "codechef":
        accounts.codechef_username = clean_user
        stats_data = await PlatformSyncService.sync_codechef(clean_user)
    elif clean_platform == "kaggle":
        accounts.kaggle_username = clean_user
        stats_data = await PlatformSyncService.sync_kaggle(clean_user)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {clean_platform}")

    accounts.last_synced_at = datetime.now(timezone.utc)

    # Persist or update PlatformStats
    ps = db.query(PlatformStats).filter(
        PlatformStats.user_id == user.id,
        PlatformStats.platform == clean_platform,
    ).first()
    if not ps:
        ps = PlatformStats(user_id=user.id, platform=clean_platform, stats_data=stats_data)
        db.add(ps)
    else:
        ps.stats_data = stats_data

    # Recompute placement readiness
    all_stats = {s.platform: s.stats_data for s in user.platform_stats}
    all_stats[clean_platform] = stats_data
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    resume = db.query(ResumeData).filter(ResumeData.user_id == user.id).first()

    new_score = AIService.calculate_placement_readiness(all_stats, skills, projects, resume)
    profile = user.profile
    if profile:
        profile.placement_readiness = new_score

    db.commit()

    return {
        "success": True,
        "verified": True,
        "platform": clean_platform,
        "username": clean_user,
        "stats": stats_data,
        "placementReadiness": new_score,
        "message": f"Successfully verified @{clean_user} and extracted live metrics from {clean_platform.capitalize()}!",
    }
