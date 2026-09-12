from fastapi import APIRouter

from app.api.endpoints import auth, career, dashboard, projects, recruiter, resume, skills, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(dashboard.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume"])
api_router.include_router(career.router, prefix="", tags=["Career & Achievements"])
api_router.include_router(recruiter.router, prefix="/recruiter", tags=["Recruiter"])
