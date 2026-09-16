from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


# ==========================================
# Auth Schemas
# ==========================================
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    fullName: Optional[str] = None
    role: Optional[str] = "student"
    year: Optional[str] = "3rd Year"
    branch: Optional[str] = "AIML"
    college: Optional[str] = "Engineering College"
    career_goal: Optional[str] = None
    careerGoal: Optional[str] = None
    github: Optional[str] = ""
    leetcode: Optional[str] = ""
    codeforces: Optional[str] = ""
    codechef: Optional[str] = ""
    kaggle: Optional[str] = ""
    verification_code: Optional[str] = None
    verificationCode: Optional[str] = None

    def get_full_name(self) -> str:
        name = self.full_name or self.fullName
        if name and name.strip():
            return name.strip()
        return self.email.split("@")[0].capitalize()

    def get_career_goal(self) -> str:
        goal = self.career_goal or self.careerGoal
        return goal or "AI / ML Engineer"


class SendVerificationCodeRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoginRequestOtp(BaseModel):
    email: EmailStr
    password: str


class LoginVerifyOtp(BaseModel):
    email: EmailStr
    code: str


class LoginOtpChallengeResponse(BaseModel):
    success: bool
    otp_required: bool = True
    email: str
    message: str
    delivered: Optional[bool] = True
    code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordReset(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(min_length=6)


# ==========================================
# Profile & Accounts Schemas
# ==========================================
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    year: Optional[str] = None
    branch: Optional[str] = None
    college: Optional[str] = None
    career_goal: Optional[str] = None
    target_company_type: Optional[str] = None
    is_private: Optional[bool] = None
    isPrivate: Optional[bool] = None


class ConnectedAccountsUpdate(BaseModel):
    github_username: Optional[str] = ""
    leetcode_username: Optional[str] = ""
    codeforces_username: Optional[str] = ""
    codechef_username: Optional[str] = ""
    kaggle_username: Optional[str] = ""
    linkedin_url: Optional[str] = ""


# ==========================================
# Skill Schemas
# ==========================================
class SkillCreate(BaseModel):
    name: str
    level: int = Field(ge=0, le=100)
    category: Optional[str] = "Technical"
    status: Optional[str] = "Strong"


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[int] = Field(default=None, ge=0, le=100)
    category: Optional[str] = None
    status: Optional[str] = None


# ==========================================
# Project Schemas
# ==========================================
class ProjectCreate(BaseModel):
    name: str
    description: str
    stack: str
    github_url: Optional[str] = ""
    live_url: Optional[str] = ""
    status: Optional[str] = "In Progress"
    score: Optional[int] = 80


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    stack: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    status: Optional[str] = None
    score: Optional[int] = None


# ==========================================
# Resume Schemas
# ==========================================
class ResumeUpdate(BaseModel):
    headline: Optional[str] = None
    summary: Optional[str] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills_json: Optional[List[Any]] = None
    projects_json: Optional[List[Dict[str, Any]]] = None
    experience_json: Optional[List[Dict[str, Any]]] = None
    achievements_json: Optional[List[Dict[str, Any]]] = None


class AIResumeReviewRequest(BaseModel):
    target_role: Optional[str] = None
