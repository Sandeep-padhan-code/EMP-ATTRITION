from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime, timezone
from server.database import get_db
from server.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class MarkReadRequest(BaseModel):
    id: int

@router.get("")
def list_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    """, (current_user["id"],))
    rows = cur.fetchall()
    notifications = [dict(row) for row in rows]
    
    unread_count = sum(1 for n in notifications if not n["is_read"])
    conn.close()

    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE notifications
        SET is_read = 1
        WHERE id = ? AND user_id = ?
    """, (notification_id, current_user["id"]))
    conn.commit()
    conn.close()
    return {"success": True}

@router.post("/read-all")
def mark_all_notifications_read(current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = ?
    """, (current_user["id"],))
    conn.commit()
    conn.close()
    return {"success": True, "message": "All notifications marked as read"}
