import random
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.profile import ConnectedAccounts, StudentProfile, PlatformStats
from app.models.resume import ResumeData
from app.models.skill import Skill, SkillGap
from app.models.user import User
from app.schemas import (
    SendVerificationCodeRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    VerifyEmailRequest,
)
from app.services.ai_service import ROLE_REQUIRED_SKILLS

router = APIRouter()

# In-memory store for pending email verification codes
PENDING_VERIFICATIONS: Dict[str, str] = {}


@router.post("/send-verification-code")
def send_verification_code(data: SendVerificationCodeRequest):
    email = data.email.lower().strip()
    code = f"{random.randint(100000, 999999)}"
    PENDING_VERIFICATIONS[email] = code
    return {
        "success": True,
        "message": f"Verification code sent to {email}.",
        "code": code,  # Provided in response for easy demonstration/testing
    }


@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    expected = PENDING_VERIFICATIONS.get(email)

    # Accept either the generated OTP, or default test code 123456
    if expected and expected == data.code.strip():
        valid = True
    elif data.code.strip() == "123456":
        valid = True
    else:
        valid = False

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    # If user already registered, mark verified
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.is_verified = True
        db.commit()

    return {
        "success": True,
        "verified": True,
        "message": "Email verified successfully.",
    }


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists. Please login.",
        )

    full_name = data.get_full_name()
    career_goal = data.get_career_goal()

    # Create User
    user = User(
        email=email_clean,
        hashed_password=get_password_hash(data.password),
        full_name=full_name,
        role=data.role or "student",
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize Student Profile
    profile = StudentProfile(
        user_id=user.id,
        year=data.year or "3rd Year",
        branch=data.branch or "AIML",
        college=data.college or "Engineering College",
        career_goal=career_goal,
        placement_readiness=70,
        profile_completion=80,
    )
    db.add(profile)

    # Initialize Connected Accounts
    accounts = ConnectedAccounts(
        user_id=user.id,
        github_username=data.github or "",
        leetcode_username=data.leetcode or "",
        codeforces_username=data.codeforces or "",
        codechef_username=data.codechef or "",
        kaggle_username=data.kaggle or "",
    )
    db.add(accounts)

    # Initialize role-relevant skills for new student
    req_skills = ROLE_REQUIRED_SKILLS.get(career_goal, ROLE_REQUIRED_SKILLS["AI / ML Engineer"])
    for s in req_skills[:5]:
        db.add(Skill(user_id=user.id, name=s["name"], level=70, category=s["category"], status="Strong"))

    # Initialize initial skill gaps
    for s in req_skills[5:]:
        db.add(SkillGap(user_id=user.id, name=s["name"], priority=s["priority"], category=s["category"], reason="Target competency for role"))

    # Initialize Resume
    resume = ResumeData(
        user_id=user.id,
        headline=f"Aspiring {career_goal}",
        summary=f"Enthusiastic {data.branch or 'Computer Science'} student specializing in {career_goal} with a strong foundation in software engineering, algorithms, and practical development.",
        ats_score=78,
        skills_json=[s["name"] for s in req_skills[:6]],
        education=[
            {
                "degree": f"B.Tech in {data.branch or 'Computer Science'}",
                "institution": data.college or "Engineering College",
                "year": data.year or "3rd Year",
                "score": "8.5 CGPA",
            }
        ],
    )
    db.add(resume)

    db.commit()

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    user_info = {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "role": user.role,
        "year": profile.year,
        "branch": profile.branch,
        "college": profile.college,
        "careerGoal": profile.career_goal,
    }

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_info,
    }


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    profile = user.profile
    user_info = {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "role": user.role,
        "year": profile.year if profile else "3rd Year",
        "branch": profile.branch if profile else "AIML",
        "college": profile.college if profile else "Engineering College",
        "careerGoal": profile.career_goal if profile else "AI / ML Engineer",
    }

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_info,
    }


@router.post("/logout")
def logout():
    return {"success": True, "message": "Logged out successfully."}


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    profile = user.profile
    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "role": user.role,
        "avatarUrl": user.avatar_url,
        "year": profile.year if profile else "3rd Year",
        "branch": profile.branch if profile else "AIML",
        "college": profile.college if profile else "Engineering College",
        "careerGoal": profile.career_goal if profile else "AI / ML Engineer",
        "placementReadiness": profile.placement_readiness if profile else 75,
        "profileCompletion": profile.profile_completion if profile else 85,
    }
