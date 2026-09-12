from datetime import datetime, timezone
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class ResumeData(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    ats_score = Column(Integer, default=84)
    headline = Column(String(255), default="Aspiring Software & AI Engineer")
    summary = Column(Text, default="Passionate engineer with experience in full-stack and machine learning systems.")
    education = Column(JSON, default=list)  # list of {degree, institution, year, score}
    skills_json = Column(JSON, default=list)  # list of string skill categories or skills
    projects_json = Column(JSON, default=list)  # list of resume formatted projects
    experience_json = Column(JSON, default=list)  # list of experience / internships
    achievements_json = Column(JSON, default=list)  # list of certifications / awards
    ai_feedback = Column(Text, default="Your resume is strong on technical projects. Adding quantified impact metrics and cloud deployment details will boost your ATS pass rate.")

    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resume")
