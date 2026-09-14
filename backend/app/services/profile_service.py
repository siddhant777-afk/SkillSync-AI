from typing import Any, Dict
from sqlalchemy.orm import Session

from app.models.user import User


def calculate_profile_completion(user: User) -> int:
    """
    Dynamically calculates the profile completion percentage (0-100%)
    based on all aspects stored in the student's account:
    1. Core Identity & Academic Information (20 pts max)
       - Full Name: 4 pts
       - College: 4 pts
       - Branch: 4 pts
       - Year: 4 pts
       - Bio (>=10 chars): 4 pts
    2. Career Strategy & Goals (10 pts max)
       - Career Goal: 5 pts
       - Target Sector / Company Type: 5 pts
    3. Connected Coding & Professional Accounts (20 pts max)
       - LeetCode username: 5 pts
       - GitHub username: 5 pts
       - Codeforces username: 5 pts
       - CodeChef OR Kaggle OR LinkedIn: 5 pts
    4. Technical Skills Inventory (20 pts max)
       - 1-2 skills: 5 pts
       - 3-4 skills: 10 pts
       - 5-6 skills: 15 pts
       - 7+ skills: 20 pts
    5. Projects Portfolio (15 pts max)
       - 1 project: 8 pts
       - 2+ projects: 15 pts
    6. Non-DSA Achievements & Certifications (10 pts max)
       - 1 achievement: 5 pts
       - 2+ achievements: 10 pts
    7. Professional Resume & ATS Details (5 pts max)
       - Resume headline, summary, or education: 5 pts
    """
    if not user:
        return 0

    profile = user.profile
    accounts = user.connected_accounts
    score = 0

    # 1. Core Identity & Academic Info (up to 20 pts)
    if user.full_name and len(user.full_name.strip()) > 0:
        score += 4
    if profile:
        if profile.college and len(profile.college.strip()) > 0:
            score += 4
        if profile.branch and len(profile.branch.strip()) > 0:
            score += 4
        if profile.year and len(profile.year.strip()) > 0:
            score += 4
        if profile.bio and len(profile.bio.strip()) >= 10:
            score += 4

    # 2. Career Strategy & Goals (up to 10 pts)
    if profile:
        if profile.career_goal and len(profile.career_goal.strip()) > 0:
            score += 5
        if profile.target_company_type and len(profile.target_company_type.strip()) > 0:
            score += 5

    # 3. Connected Coding & Professional Accounts (up to 20 pts)
    if accounts:
        if accounts.leetcode_username and len(accounts.leetcode_username.strip()) > 0:
            score += 5
        if accounts.github_username and len(accounts.github_username.strip()) > 0:
            score += 5
        if accounts.codeforces_username and len(accounts.codeforces_username.strip()) > 0:
            score += 5
        if (
            (accounts.codechef_username and len(accounts.codechef_username.strip()) > 0)
            or (accounts.kaggle_username and len(accounts.kaggle_username.strip()) > 0)
            or (accounts.linkedin_url and len(accounts.linkedin_url.strip()) > 0)
        ):
            score += 5

    # 4. Technical Skills Inventory (up to 20 pts)
    skills_count = len(user.skills) if user.skills else 0
    if skills_count >= 7:
        score += 20
    elif skills_count >= 5:
        score += 15
    elif skills_count >= 3:
        score += 10
    elif skills_count >= 1:
        score += 5

    # 5. Projects Portfolio (up to 15 pts)
    projects_count = len(user.projects) if user.projects else 0
    if projects_count >= 2:
        score += 15
    elif projects_count >= 1:
        score += 8

    # 6. Achievements & Certifications (up to 10 pts)
    achievements_count = len(user.achievements) if user.achievements else 0
    if achievements_count >= 2:
        score += 10
    elif achievements_count >= 1:
        score += 5

    # 7. Resume ATS / Content (up to 5 pts)
    resume = user.resume
    if resume:
        has_resume_content = bool(
            (resume.headline and len(resume.headline.strip()) > 0)
            or (resume.summary and len(resume.summary.strip()) > 0)
            or (resume.education and len(resume.education) > 0)
            or (resume.skills_json and len(resume.skills_json) > 0)
        )
        if has_resume_content:
            score += 5

    return min(100, max(0, score))


def update_user_profile_completion(user: User, db: Session) -> int:
    """
    Computes and writes the up-to-date dynamic profile completion score to the database.
    """
    if not user:
        return 0

    score = calculate_profile_completion(user)
    if user.profile:
        user.profile.profile_completion = score
    db.commit()
    return score
