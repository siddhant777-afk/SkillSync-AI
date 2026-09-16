from datetime import datetime, timezone
from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    year = Column(String(50), default="")
    branch = Column(String(100), default="")
    college = Column(String(255), default="")
    bio = Column(Text, nullable=True)
    career_goal = Column(String(100), default="")
    target_company_type = Column(String(100), default="")
    placement_readiness = Column(Integer, default=0)
    profile_completion = Column(Integer, default=0)
    is_private = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")


class ConnectedAccounts(Base):
    __tablename__ = "connected_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    github_username = Column(String(100), default="")
    leetcode_username = Column(String(100), default="")
    codeforces_username = Column(String(100), default="")
    codechef_username = Column(String(100), default="")
    kaggle_username = Column(String(100), default="")
    linkedin_url = Column(String(255), default="")

    last_synced_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="connected_accounts")


class PlatformStats(Base):
    __tablename__ = "platform_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False)  # github, leetcode, codeforces, codechef, kaggle
    stats_data = Column(JSON, default=dict)  # Solved, ratings, stars, contributions, etc.
    last_synced = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="platform_stats")
