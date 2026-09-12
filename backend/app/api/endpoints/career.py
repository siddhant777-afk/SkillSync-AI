from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.achievement import Achievement
from app.models.recommendation import Recommendation
from app.models.user import User

router = APIRouter()


@router.get("/career/recommendations")
def get_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user.id)
        .order_by(Recommendation.sequence)
        .all()
    )
    if not recs:
        default_texts = [
            "Learn Docker and containerize one of your ML projects.",
            "Practice 50 more Graph and DP problems on LeetCode.",
            "Build and deploy an end-to-end ML project with CI/CD.",
            "Start low-level System Design with APIs, caching and databases.",
        ]
        return {
            "careerFit": "91%",
            "learningPriority": "High",
            "projectOpportunity": "2",
            "recommendations": default_texts,
        }

    return {
        "careerFit": "91%",
        "learningPriority": "High",
        "projectOpportunity": "2",
        "recommendations": [r.text for r in recs],
    }


@router.get("/achievements")
def get_achievements(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    achievements = (
        db.query(Achievement)
        .filter(Achievement.user_id == user.id)
        .order_by(Achievement.created_at.desc())
        .all()
    )
    if not achievements:
        return [
            {
                "title": "500 LeetCode Problems Solved",
                "date": "20 May 2024",
                "description": "Consistent DSA practice milestone.",
                "icon": "leetcode",
            },
            {
                "title": "100 Days Coding Streak",
                "date": "18 May 2024",
                "description": "Maintained a daily competitive programming streak.",
                "icon": "streak",
            },
            {
                "title": "Top 10% LeetCode Weekly Contest",
                "date": "12 May 2024",
                "description": "Strong contest performance.",
                "icon": "contest",
            },
        ]

    return [
        {
            "id": a.id,
            "title": a.title,
            "date": a.date,
            "description": a.description,
            "icon": a.icon,
        }
        for a in achievements
    ]
