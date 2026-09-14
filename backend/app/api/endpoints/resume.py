from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.resume import ResumeData
from app.models.user import User
from app.schemas import AIResumeReviewRequest, ResumeUpdate
from app.services.ai_service import AIService
from app.services.profile_service import update_user_profile_completion


def calculate_ats_score(resume: ResumeData, user: User) -> int:
    """Calculates an authentic multi-factor ATS score based on standard ATS parser rules."""
    # If the user has not entered any core resume content yet, ATS score is strictly 0
    has_content = bool(
        (resume.skills_json and len(resume.skills_json) > 0) or
        (resume.summary and len(resume.summary.strip()) > 0) or
        (resume.education and len(resume.education) > 0) or
        (resume.projects_json and len(resume.projects_json) > 0) or
        (resume.experience_json and len(resume.experience_json) > 0) or
        (resume.achievements_json and len(resume.achievements_json) > 0)
    )
    if not has_content:
        return 0

    score = 0
    # 1. Header & Contact Verification (15 pts)
    if user.email and user.full_name:
        score += 8
    if resume.headline and len(resume.headline.strip()) > 3:
        score += 7

    # 2. Professional Summary (15 pts)
    if resume.summary and len(resume.summary.strip()) >= 50:
        score += 15
    elif resume.summary and len(resume.summary.strip()) >= 20:
        score += 8

    # 3. Education (15 pts)
    edu_list = resume.education or []
    if len(edu_list) > 0 and (edu_list[0].get("institution") or edu_list[0].get("degree")):
        score += 15

    # 4. Technical Skills Matrix (25 pts)
    skills = resume.skills_json or []
    if len(skills) >= 6:
        score += 25
    elif len(skills) >= 3:
        score += 18
    elif len(skills) >= 1:
        score += 10

    # 5. Portfolio Projects & Descriptions (20 pts)
    projects = resume.projects_json or []
    if len(projects) >= 2:
        score += 20
    elif len(projects) >= 1:
        score += 12

    # 6. Achievements, Honors & Work Experience (10 pts)
    achievements = resume.achievements_json or []
    experience = resume.experience_json or []
    if len(achievements) + len(experience) >= 2:
        score += 10
    elif len(achievements) + len(experience) >= 1:
        score += 5

    return min(98, max(0, score))

router = APIRouter()


@router.get("")
def get_resume(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = user.profile
    resume = user.resume
    if not resume:
        # Initialize cleanly from user profile
        user_skills = [s.name for s in user.skills]
        user_projects = [
            {"title": p.name, "stack": p.stack or "", "description": p.description}
            for p in user.projects
        ]

        user_achievements = [a.title for a in user.achievements]

        edu = []
        if profile and (profile.college or profile.branch):
            edu.append({
                "degree": profile.branch or "",
                "institution": profile.college or "",
                "year": profile.year or "",
                "score": "",
            })

        resume = ResumeData(
            user_id=user.id,
            headline=f"Aspiring {profile.career_goal}" if (profile and profile.career_goal) else "",
            summary="",
            ats_score=0,
            education=edu,
            skills_json=user_skills,
            projects_json=user_projects,
            experience_json=[],
            achievements_json=user_achievements,
            ai_feedback="Resume initialized. Add your summary, skills, and projects to increase your ATS score.",
        )
        resume.ats_score = calculate_ats_score(resume, user)
        db.add(resume)
        db.commit()
        db.refresh(resume)

    return {
        "fullName": user.full_name,
        "email": user.email,
        "college": profile.college if profile else "",
        "branch": profile.branch if profile else "",
        "headline": resume.headline,
        "summary": resume.summary,
        "ats_score": resume.ats_score,
        "education": resume.education or [],
        "skills": resume.skills_json or [],
        "projects": resume.projects_json or [],
        "experience": resume.experience_json or [],
        "achievements": resume.achievements_json or [],
        "ai_feedback": resume.ai_feedback,
    }


@router.post("/auto-fill")
def auto_fill_from_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Pulls verified coding stats, custom achievements, skills, and projects directly into the resume."""
    profile = user.profile
    stats = {ps.platform: ps.stats_data for ps in user.platform_stats}
    lc = stats.get("leetcode", {})
    cf = stats.get("codeforces", {})
    gh = stats.get("github", {})

    resume = user.resume
    if not resume:
        resume = ResumeData(user_id=user.id)
        db.add(resume)

    # 1. Headline & Summary
    goal = profile.career_goal if profile and profile.career_goal else "Software Engineer"
    resume.headline = f"Aspiring {goal}"
    college_name = profile.college if (profile and profile.college) else ""
    branch_name = profile.branch if (profile and profile.branch) else ""
    if college_name or branch_name:
        resume.summary = (
            f"Driven {branch_name} student at {college_name} "
            f"with verified technical capabilities in algorithmic problem solving and software architecture."
        ).strip()
    else:
        resume.summary = ""

    # 2. Education - only what user provided
    edu = []
    if profile and (profile.college or profile.branch):
        edu.append({
            "degree": profile.branch or "",
            "institution": profile.college or "",
            "year": profile.year or "",
            "score": "",
        })
    resume.education = edu

    # 3. Skills - strictly user verified skills
    skills_list = [s.name for s in user.skills]
    resume.skills_json = skills_list

    # 4. Projects - strictly user projects
    projects_list = [
        {
            "title": p.name,
            "stack": p.stack or "",
            "description": p.description,
        }
        for p in user.projects
    ]
    resume.projects_json = projects_list

    # 5. Achievements - strictly real platform achievements
    achievements_bullets = []
    lc_solved = lc.get("solved", 0)
    if lc_solved > 0:
        achievements_bullets.append(f"Solved {lc_solved}+ algorithmic problems on LeetCode ({lc.get('rank', 'Active')})")

    cf_rating = cf.get("rating", 0)
    if cf_rating > 0:
        achievements_bullets.append(f"Codeforces Rating: {cf_rating} ({cf.get('title', 'Specialist')})")

    gh_contribs = gh.get("contributions", 0)
    if gh_contribs > 0:
        achievements_bullets.append(f"Active open-source contributor with {gh_contribs}+ GitHub contributions")

    for ach in user.achievements:
        achievements_bullets.append(f"{ach.title} - {ach.description}")

    resume.achievements_json = achievements_bullets

    # Calculate authentic ATS score
    resume.ats_score = calculate_ats_score(resume, user)

    db.commit()
    db.refresh(resume)
    update_user_profile_completion(user, db)

    return {
        "success": True,
        "message": "Resume auto-filled with live profile data",
        "resume": {
            "fullName": user.full_name,
            "email": user.email,
            "college": profile.college if profile else "",
            "branch": profile.branch if profile else "",
            "headline": resume.headline,
            "summary": resume.summary,
            "ats_score": resume.ats_score,
            "education": resume.education,
            "skills": resume.skills_json,
            "projects": resume.projects_json,
            "experience": resume.experience_json or [],
            "achievements": resume.achievements_json,
            "ai_feedback": "Resume updated with your live verified achievements and skills.",
        }
    }


@router.put("")
def update_resume(
    data: ResumeUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = user.resume
    if not resume:
        resume = ResumeData(user_id=user.id)
        db.add(resume)

    if data.headline is not None:
        resume.headline = data.headline
    if data.summary is not None:
        resume.summary = data.summary
    if data.education is not None:
        resume.education = data.education
    if data.skills_json is not None:
        resume.skills_json = data.skills_json
    if data.projects_json is not None:
        resume.projects_json = data.projects_json
    if data.experience_json is not None:
        resume.experience_json = data.experience_json
    if data.achievements_json is not None:
        resume.achievements_json = data.achievements_json

    resume.ats_score = calculate_ats_score(resume, user)
    db.commit()
    update_user_profile_completion(user, db)
    return {"success": True, "message": "Resume updated successfully.", "ats_score": resume.ats_score}


@router.post("/ai-review")
async def run_ai_review(
    req: AIResumeReviewRequest = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = user.resume
    if not resume:
        resume = ResumeData(user_id=user.id)
        db.add(resume)
        db.commit()
        db.refresh(resume)

    target_role = (req.target_role if req else None) or (user.profile.career_goal if user.profile else "Software Engineer")
    calculated_score = calculate_ats_score(resume, user)
    review = await AIService.review_resume_ats(resume, target_role=target_role, base_score=calculated_score)

    resume.ats_score = calculated_score
    resume.ai_feedback = review["feedback"]
    db.commit()

    return {
        "success": True,
        "ats_score": resume.ats_score,
        "feedback": resume.ai_feedback,
        "missing_keywords": review.get("missing_keywords", []),
    }
