from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.api.deps import get_current_user, get_db
from app.models.notification import Notification
from app.models.user import User
from app.services.live_jobs_service import LiveJobsService

router = APIRouter()


@router.get("")
async def get_notifications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Auto-generate fresh live job and milestone notifications if user has less than 2
    count = db.query(Notification).filter(Notification.user_id == user.id).count()
    if count < 3:
        await LiveJobsService.sync_notifications_for_user(db, user)

    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )

    unread_count = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).count()

    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "link": n.link,
                "linkLabel": n.link_label or "Apply Now",
                "company": n.company,
                "tags": n.tags or [],
                "isRead": n.is_read,
                "createdAt": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ],
        "unreadCount": unread_count,
    }


@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    return {"success": True, "message": "Notification marked as read"}


@router.post("/mark-all-read")
def mark_all_read(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"success": True, "message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notif)
    db.commit()
    return {"success": True, "message": "Notification dismissed"}


@router.post("/sync-jobs")
async def sync_live_jobs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_alerts = await LiveJobsService.sync_notifications_for_user(db, user)
    return {"success": True, "newAlerts": new_alerts, "message": f"Found and synced {new_alerts} new verified openings."}
