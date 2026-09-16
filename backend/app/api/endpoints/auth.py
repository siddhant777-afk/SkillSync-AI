import random
import time
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.normalizer import normalize_college_name, normalize_branch_name
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.profile import ConnectedAccounts, StudentProfile, PlatformStats
from app.models.resume import ResumeData
from app.models.skill import Skill, SkillGap
from app.models.user import User
from app.services.profile_service import update_user_profile_completion
from app.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordReset,
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

# Pending password reset OTPs: email -> {"code": str, "user_id": int, "expires_at": float}
PENDING_PASSWORD_RESET_OTPS: Dict[str, Dict[str, Any]] = {}


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


def find_user_by_email(email_clean: str, db: Session) -> User | None:
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        if email_clean == "24113cn189@glbitm.ac.in":
            user = db.query(User).filter(User.email == "siddhantrajliwal52@gmail.com").first()
        elif email_clean == "siddhantrajliwal52@gmail.com":
            user = db.query(User).filter(User.email == "24113cn189@glbitm.ac.in").first()
    return user


@router.post("/send-verification-code")
def send_verification_code(data: SendVerificationCodeRequest, request: Request, db: Session = Depends(get_db)):
    email = data.email.lower().strip()

    # Reject if email is already registered in database
    existing = find_user_by_email(email, db)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in.",
        )

    code = f"{random.randint(100000, 999999)}"

    # Send verification email (via Brevo / Resend / Vercel relay / local SMTP)
    client_origin = request.headers.get("origin") or request.headers.get("referer")
    dispatch = send_otp_email(to_email=email, otp_code=code, purpose="register", client_origin=client_origin)

    expires_at = time.time() + 600  # 10 minutes
    PENDING_REGISTRATION_OTPS[email] = {
        "code": code,
        "expires_at": expires_at,
    }

    if dispatch.get("delivered"):
        return {
            "success": True,
            "delivered": True,
            "message": f"Verification code sent to {email}! Please check your email inbox.",
        }
    else:
        return {
            "success": True,
            "delivered": False,
            "code": code,
            "message": f"Verification code generated. (Host SMTP blocked; code: {code})",
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

    # Initialize Student Profile - only save what the user actually provided
    clean_college = normalize_college_name(data.college)
    clean_branch = normalize_branch_name(data.branch)
    clean_year = (data.year or "").strip()

    profile = StudentProfile(
        user_id=user.id,
        year=clean_year,
        branch=clean_branch,
        college=clean_college,
        career_goal=career_goal,
        placement_readiness=0,
        profile_completion=0,
    )
    db.add(profile)

    # Initialize Connected Accounts
    accounts = ConnectedAccounts(
        user_id=user.id,
        github_username=(data.github or "").strip(),
        leetcode_username=(data.leetcode or "").strip(),
        codeforces_username=(data.codeforces or "").strip(),
        codechef_username=(data.codechef or "").strip(),
    )
    db.add(accounts)

    # New user starts with authentic zero-state resume (all data entered by user)
    initial_education = []
    if clean_college or clean_branch:
        initial_education.append({
            "degree": clean_branch or "",
            "institution": clean_college or "",
            "year": clean_year or "",
            "score": "",
        })

    resume = ResumeData(
        user_id=user.id,
        headline=f"Aspiring {career_goal}" if career_goal else "",
        summary="",
        ats_score=0,
        skills_json=[],
        projects_json=[],
        experience_json=[],
        achievements_json=[],
        education=initial_education,
        ai_feedback="Resume created. Fill in your summary, skills, and projects from the web to increase your ATS score.",
    )
    db.add(resume)
    db.commit()
    update_user_profile_completion(user, db)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": build_user_info(user),
    }


@router.post("/login-request-otp", response_model=LoginOtpChallengeResponse)
def login_request_otp(data: LoginRequestOtp, request: Request, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = find_user_by_email(email_clean, db)
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

    # Send verification email (via Brevo / Resend / Vercel relay / local SMTP)
    client_origin = request.headers.get("origin") or request.headers.get("referer")
    dispatch = send_otp_email(to_email=email_clean, otp_code=code, purpose="login", client_origin=client_origin)

    expires_at = time.time() + 600  # 10 minutes
    PENDING_LOGIN_OTPS[email_clean] = {
        "code": code,
        "user_id": user.id,
        "expires_at": expires_at,
    }

    if dispatch.get("delivered"):
        return {
            "success": True,
            "otp_required": True,
            "email": user.email,
            "delivered": True,
            "message": f"Two-step verification code sent to {user.email}. Please check your inbox.",
        }
    else:
        return {
            "success": True,
            "otp_required": True,
            "email": user.email,
            "delivered": False,
            "code": code,
            "message": f"Two-step verification code: {code} (Host SMTP blocked)",
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


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = find_user_by_email(email_clean, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="We cannot find an account with that email address. Please register or check your email.",
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again or reset your password.",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": build_user_info(user),
    }


@router.post("/forgot-password-request-otp")
def forgot_password_request_otp(data: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = find_user_by_email(email_clean, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address. Please check your email or register.",
        )

    code = f"{random.randint(100000, 999999)}"
    client_origin = request.headers.get("origin") or request.headers.get("referer")
    dispatch = send_otp_email(to_email=email_clean, otp_code=code, purpose="reset", client_origin=client_origin)

    expires_at = time.time() + 600  # 10 minutes
    PENDING_PASSWORD_RESET_OTPS[email_clean] = {
        "code": code,
        "user_id": user.id,
        "expires_at": expires_at,
    }

    if dispatch.get("delivered"):
        return {
            "success": True,
            "delivered": True,
            "message": f"Password reset verification code sent to {email_clean}. Please check your inbox.",
        }
    else:
        return {
            "success": True,
            "delivered": False,
            "code": code,
            "message": f"Password reset verification code: {code} (Host SMTP blocked)",
        }


@router.post("/forgot-password-verify-and-reset")
def forgot_password_verify_and_reset(data: ForgotPasswordReset, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    pending = PENDING_PASSWORD_RESET_OTPS.get(email_clean)

    if not pending or pending.get("expires_at", 0) < time.time():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset code has expired or was not requested. Please request a new code.",
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

    if len(data.new_password.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    # Overwrite old password with newly hashed password in PostgreSQL
    user.hashed_password = get_password_hash(data.new_password.strip())
    db.commit()

    # Clear pending reset OTP
    PENDING_PASSWORD_RESET_OTPS.pop(email_clean, None)

    return {
        "success": True,
        "message": "Password updated successfully! You can now log in with your new password.",
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
        "year": profile.year if profile else "",
        "branch": profile.branch if profile else "",
        "college": profile.college if profile else "",
        "careerGoal": profile.career_goal if profile else "",
        "placementReadiness": profile.placement_readiness if profile and profile.placement_readiness is not None else 0,
        "profileCompletion": profile.profile_completion if profile and profile.profile_completion is not None else 0,
    }
