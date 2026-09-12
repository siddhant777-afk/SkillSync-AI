import random
import time
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.profile import ConnectedAccounts, StudentProfile, PlatformStats
from app.models.resume import ResumeData
from app.models.skill import Skill, SkillGap
from app.models.user import User
from app.schemas import (
    LoginOtpChallengeResponse,
    LoginRequestOtp,
    LoginVerifyOtp,
    SendVerificationCodeRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    VerifyEmailRequest,
)
from app.services.ai_service import ROLE_REQUIRED_SKILLS
from app.services.email_service import send_otp_email

router = APIRouter()

# Pending registration OTPs: email -> {"code": str, "expires_at": float}
PENDING_REGISTRATION_OTPS: Dict[str, Dict[str, Any]] = {}

# Verified registration emails: email -> expires_at (valid for 15 minutes to submit form)
VERIFIED_REGISTRATION_EMAILS: Dict[str, float] = {}

# Pending login OTPs: email -> {"code": str, "user_id": int, "expires_at": float}
PENDING_LOGIN_OTPS: Dict[str, Dict[str, Any]] = {}


def build_user_info(user: User) -> Dict[str, Any]:
    profile = user.profile
    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "role": user.role,
        "year": profile.year if profile else "3rd Year",
        "branch": profile.branch if profile else "AIML",
        "college": profile.college if profile else "Engineering College",
        "careerGoal": profile.career_goal if profile else "AI / ML Engineer",
    }


@router.post("/send-verification-code")
def send_verification_code(data: SendVerificationCodeRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()

    # Reject if email is already registered in database
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in.",
        )

    code = f"{random.randint(100000, 999999)}"

    # Attempt real email dispatch via SMTP and DNS MX check
    try:
        send_otp_email(to_email=email, otp_code=code, purpose="register")
    except (ValueError, RuntimeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    expires_at = time.time() + 60  # 1 minute
    PENDING_REGISTRATION_OTPS[email] = {
        "code": code,
        "expires_at": expires_at,
    }

    return {
        "success": True,
        "message": f"Verification code sent to {email}. Please check your email inbox.",
    }


@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    pending = PENDING_REGISTRATION_OTPS.get(email)

    if not pending or pending.get("expires_at", 0) < time.time():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired or was not requested. Please request a new code.",
        )

    if pending.get("code") != data.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check your email and try again.",
        )

    # Valid OTP: grant 15 minutes window to complete registration
    VERIFIED_REGISTRATION_EMAILS[email] = time.time() + 900
    PENDING_REGISTRATION_OTPS.pop(email, None)

    # If user already exists in DB, update is_verified
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

    # Strictly enforce email OTP verification
    verified_until = VERIFIED_REGISTRATION_EMAILS.get(email_clean, 0)
    is_verified = (verified_until > time.time())

    if not is_verified:
        code_provided = (data.verification_code or data.verificationCode or "").strip()
        pending = PENDING_REGISTRATION_OTPS.get(email_clean)
        if pending and pending.get("code") == code_provided and pending.get("expires_at", 0) > time.time():
            is_verified = True
            PENDING_REGISTRATION_OTPS.pop(email_clean, None)

    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not verified. Please verify the 6-digit OTP sent to your email before completing registration.",
        )

    # Remove temporary verification entry
    VERIFIED_REGISTRATION_EMAILS.pop(email_clean, None)

    full_name = data.get_full_name()
    career_goal = data.get_career_goal()

    # Create User in PostgreSQL
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

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": build_user_info(user),
    }


@router.post("/login-request-otp", response_model=LoginOtpChallengeResponse)
def login_request_otp(data: LoginRequestOtp, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="We cannot find an account with that email address.",
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
        )

    code = f"{random.randint(100000, 999999)}"

    # Attempt real email dispatch via SMTP and DNS MX check
    try:
        send_otp_email(to_email=email_clean, otp_code=code, purpose="login")
    except (ValueError, RuntimeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    expires_at = time.time() + 60  # 1 minute
    PENDING_LOGIN_OTPS[email_clean] = {
        "code": code,
        "user_id": user.id,
        "expires_at": expires_at,
    }

    return {
        "success": True,
        "otp_required": True,
        "email": user.email,
        "message": f"Two-step verification code sent to {user.email}. Please check your inbox.",
    }


@router.post("/login-verify-otp", response_model=TokenResponse)
def login_verify_otp(data: LoginVerifyOtp, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    pending = PENDING_LOGIN_OTPS.get(email_clean)

    if not pending or pending.get("expires_at", 0) < time.time():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired or was not requested. Please request a new code.",
        )

    if pending.get("code") != data.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check your email and try again.",
        )

    user = db.query(User).filter(User.id == pending["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    # Clear pending login OTP
    PENDING_LOGIN_OTPS.pop(email_clean, None)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": build_user_info(user),
    }


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    # Standard login triggers Amazon-style OTP request
    return login_request_otp(LoginRequestOtp(email=data.email, password=data.password), db=db)


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
