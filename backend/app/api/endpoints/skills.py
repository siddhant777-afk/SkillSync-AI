from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.skill import Skill, SkillGap
from app.models.user import User
from app.schemas import SkillCreate, SkillUpdate

router = APIRouter()


@router.get("")
def get_skills(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    gaps = db.query(SkillGap).filter(SkillGap.user_id == user.id).all()

    return {
        "skills": [
            {
                "id": s.id,
                "name": s.name,
                "level": s.level,
                "score": s.level,
                "category": s.category,
                "status": s.status,
            }
            for s in skills
        ],
        "skillGaps": [
            {
                "id": g.id,
                "name": g.name,
                "priority": g.priority,
                "category": g.category,
                "reason": g.reason,
            }
            for g in gaps
        ],
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def add_skill(data: SkillCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    status_label = "Strong" if data.level >= 75 else ("Growing" if data.level >= 50 else "Needs Improvement")
    skill = Skill(
        user_id=user.id,
        name=data.name,
        level=data.level,
        category=data.category or "Technical",
        status=data.status or status_label,
    )
    db.add(skill)

    # Check if this resolves a skill gap
    matching_gap = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == user.id, SkillGap.name.ilike(f"%{data.name}%"))
        .first()
    )
    if matching_gap:
        db.delete(matching_gap)

    # Record momentum notification
    from app.models.notification import Notification
    from datetime import datetime
    skill.created_at = datetime.utcnow()
    notif = Notification(
        user_id=user.id,
        type="skill_milestone",
        title=f"⚡ Skill Mastered: {skill.name}",
        message=f"Added {skill.name} ({skill.level}%). Your technical versatility and placement momentum have been updated.",
        link="/skills",
        link_label="View Skill Matrix",
        company="SkillSync AI",
        tags=[skill.name, skill.category],
        is_read=False,
    )
    db.add(notif)

    db.commit()
    db.refresh(skill)

    return {
        "id": skill.id,
        "name": skill.name,
        "level": skill.level,
        "score": skill.level,
        "category": skill.category,
        "status": skill.status,
    }


@router.put("/{skill_id}")
def update_skill(
    skill_id: int,
    data: SkillUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    if data.name:
        skill.name = data.name
    if data.level is not None:
        skill.level = data.level
        skill.status = "Strong" if data.level >= 75 else ("Growing" if data.level >= 50 else "Needs Improvement")
    if data.category:
        skill.category = data.category
    if data.status:
        skill.status = data.status

    db.commit()
    return {"success": True, "message": "Skill updated successfully"}


@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(skill)
    db.commit()
    return {"success": True, "message": "Skill deleted successfully"}
