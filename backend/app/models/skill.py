from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(100), nullable=False)
    level = Column(Integer, default=70)  # 0 to 100 percentage
    category = Column(String(100), default="Technical")
    status = Column(String(50), default="Strong")  # Strong, Growing, Needs Improvement

    user = relationship("User", back_populates="skills")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(100), nullable=False)
    priority = Column(String(50), default="High")  # High, Medium, Low
    category = Column(String(100), default="Engineering")
    reason = Column(String(255), default="Required for target career goal")

    user = relationship("User", back_populates="skill_gaps")
