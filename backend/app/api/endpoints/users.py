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
from app.services.ranking_engine import RankingEngine
from app.services.sync_service import PlatformSyncService
from app.services.timeline_service import TimelineService

router = APIRouter()


def compute_user_overall_rank(user_id: int, db: Session) -> int:
    """Calculates student's authoritative overall leaderboard rank across all enrolled students."""
    db_users = db.query(User).filter(User.role == "student").all()
    user_scores = []
    for u in db_users:
        stats = {ps.platform: ps.stats_data for ps in u.platform_stats}
        lc = stats.get("leetcode", {})
        cf = stats.get("codeforces", {})
        cc = stats.get("codechef", {})
        gh = stats.get("github", {})
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
        depth_score = ranking.get("dimension_scores", {}).get("problem_solving_depth", 0.0)
        lc_solved = lc.get("solved", 0)
        user_scores.append((u.id, composite_score, depth_score, lc_solved))

    user_scores.sort(key=lambda x: (x[1], x[2], x[3]), reverse=True)
    for rank, (uid, *_) in enumerate(user_scores, start=1):
        if uid == user_id:
            return rank
    return 1



@router.get("/profile")
def get_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = user.profile
    accounts = user.connected_accounts

    # Get latest platform stats
    stats = {}
    for ps in user.platform_stats:
        stats[ps.platform] = ps.stats_data

    # Strict platform fallbacks
    gh_username = (accounts.github_username or "").strip() if accounts else ""
    lc_username = (accounts.leetcode_username or "").strip() if accounts else ""
    cf_username = (accounts.codeforces_username or "").strip() if accounts else ""
    cc_username = (accounts.codechef_username or "").strip() if accounts else ""

    if not gh_username:
        github_stats = {
            "username": "",
            "contributions": 0,
            "repositories": 0,
            "stars": 0,
            "status": "unconnected",
            "verified": False,
        }
    else:
        gh_verified = bool("github" in stats and stats["github"].get("verified"))
        github_stats = dict(stats.get("github", {
            "username": gh_username,
            "contributions": 0,
            "repositories": 0,
            "stars": 0,
            "status": "synced" if gh_verified else "connected",
            "verified": gh_verified,
        }))
        github_stats["username"] = gh_username
        github_stats["verified"] = gh_verified
        github_stats["status"] = "synced" if gh_verified else "connected"

    if not lc_username:
        leetcode_stats = {
            "username": "",
            "solved": 0,
            "rank": "Unconnected",
            "status": "unconnected",
            "verified": False,
        }
    else:
        lc_verified = bool("leetcode" in stats and stats["leetcode"].get("verified"))
        leetcode_stats = dict(stats.get("leetcode", {
            "username": lc_username,
            "solved": 0,
            "rank": "Unranked",
            "status": "synced" if lc_verified else "connected",
            "verified": lc_verified,
        }))
        leetcode_stats["username"] = lc_username
        leetcode_stats["verified"] = lc_verified
        leetcode_stats["status"] = "synced" if lc_verified else "connected"

    if not cf_username:
        codeforces_stats = {
            "username": "",
            "rating": 0,
            "title": "Unconnected",
            "status": "unconnected",
            "verified": False,
        }
    else:
        cf_verified = bool("codeforces" in stats and stats["codeforces"].get("verified"))
        codeforces_stats = dict(stats.get("codeforces", {
            "username": cf_username,
            "rating": 0,
            "title": "Unrated",
            "status": "synced" if cf_verified else "connected",
            "verified": cf_verified,
        }))
        codeforces_stats["username"] = cf_username
        codeforces_stats["verified"] = cf_verified
        codeforces_stats["status"] = "synced" if cf_verified else "connected"

    if not cc_username:
        codechef_stats = {
            "username": "",
            "rating": 0,
            "title": "Unconnected",
            "status": "unconnected",
            "verified": False,
        }
    else:
        cc_verified = bool("codechef" in stats and stats["codechef"].get("verified"))
        codechef_stats = dict(stats.get("codechef", {
            "username": cc_username,
            "rating": 0,
            "title": "Unrated",
            "status": "synced" if cc_verified else "connected",
            "verified": cc_verified,
        }))
        codechef_stats["username"] = cc_username
        codechef_stats["verified"] = cc_verified
        codechef_stats["status"] = "synced" if cc_verified else "connected"

    overall_rank = compute_user_overall_rank(user.id, db)

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
        "overallRank": overall_rank,
        "isPrivate": bool(profile.is_private) if profile else False,
        "github": github_stats,
        "leetcode": leetcode_stats,
        "codeforces": codeforces_stats,
        "codechef": codechef_stats,
        "connectedAccounts": {
            "github": accounts.github_username if accounts else "",
            "leetcode": accounts.leetcode_username if accounts else "",
            "codeforces": accounts.codeforces_username if accounts else "",
            "codechef": accounts.codechef_username if accounts else "",
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
    if data.is_private is not None:
        profile.is_private = bool(data.is_private)
    elif data.isPrivate is not None:
        profile.is_private = bool(data.isPrivate)

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
    accounts.linkedin_url = data.linkedin_url or ""

    db.commit()
    update_user_profile_completion(user, db)
    return {"success": True, "message": "Coding accounts updated successfully."}


@router.post("/sync")
async def sync_user_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Sync external platforms (GitHub, LeetCode, Codeforces, CodeChef)
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
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)

    if "displayName" in data and data["displayName"]:
        user.full_name = data["displayName"]
    if "careerGoal" in data and data["careerGoal"] and profile:
        profile.career_goal = data["careerGoal"]
    if "isPrivate" in data and profile:
        profile.is_private = bool(data["isPrivate"])
    elif "is_private" in data and profile:
        profile.is_private = bool(data["is_private"])

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
    Verify an individual platform handle (leetcode, github, codeforces, codechef),
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
