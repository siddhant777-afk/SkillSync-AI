from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.resume import ResumeData
from app.models.user import User
from app.schemas import AIResumeReviewRequest, ResumeUpdate
from app.services.ai_service import AIService

router = APIRouter()


@router.get("")
def get_resume(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = user.resume
    if not resume:
        resume = ResumeData(
            user_id=user.id,
            headline="Aspiring AI / ML & Software Engineer",
            summary="Passionate engineer focused on scalable architectures, machine learning systems, and robust backend microservices.",
            ats_score=84,
            education=[
                {
                    "degree": "B.Tech in Computer Science (AIML)",
                    "institution": user.profile.college if user.profile else "GL Bajaj Institute of Technology and Management",
                    "year": "2021 - 2025",
                    "score": "8.8 CGPA",
                }
            ],
            skills_json=["Python", "DSA", "Machine Learning", "FastAPI", "React", "PostgreSQL", "Docker", "Git"],
            projects_json=[
                {
                    "title": "SkillSync AI",
                    "stack": "FastAPI, PostgreSQL, React, Tailwind",
                    "description": "Built an automated career intelligence platform aggregating technical achievements and computing placement readiness scores.",
                },
                {
                    "title": "Customer Churn Prediction Pipeline",
                    "stack": "Python, Scikit-Learn, Streamlit",
                    "description": "Developed and deployed an end-to-end classification pipeline with SHAP explainability, achieving 91% precision.",
                },
            ],
            experience_json=[
                {
                    "role": "Software Engineering Intern",
                    "company": "Tech Innovations Lab",
                    "duration": "Jun 2024 - Aug 2024",
                    "description": "Implemented asynchronous REST APIs and optimized PostgreSQL database queries, reducing response times by 32%.",
                }
            ],
            achievements_json=[
                "500+ LeetCode problems solved (Top 18%)",
                "100 Days coding streak maintained on competitive platforms",
                "Runner Up in National College AI Hackathon 2024",
            ],
            ai_feedback="Your resume is strong on technical projects. Adding quantified impact metrics, deployment details, and role-specific keywords will increase your ATS pass rate.",
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

    return {
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

    db.commit()
    return {"success": True, "message": "Resume updated successfully."}


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
    review = await AIService.review_resume_ats(resume, target_role=target_role)

    resume.ats_score = review["ats_score"]
    resume.ai_feedback = review["feedback"]
    db.commit()

    return {
        "success": True,
        "ats_score": resume.ats_score,
        "feedback": resume.ai_feedback,
        "missing_keywords": review.get("missing_keywords", []),
    }
