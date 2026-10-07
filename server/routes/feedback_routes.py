from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from server.database import get_db
from server.auth import get_current_user, require_hr

router = APIRouter(prefix="/api/feedback", tags=["Feedback & Sentiment"])

class SubmitFeedbackRequest(BaseModel):
    category: str
    sentiment: str # Positive, Neutral, Concerned
    message: str
    is_anonymous: bool = False

@router.post("")
def submit_employee_feedback(
    payload: SubmitFeedbackRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Feedback message cannot be empty")

    conn = get_db()
    cur = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()

    emp_num = current_user.get("employee_number", 0)
    emp_name = "Anonymous Employee" if payload.is_anonymous else current_user["name"]

    cur.execute("""
        INSERT INTO employee_feedback (employee_number, employee_name, category, sentiment, message, is_anonymous, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending HR Review', ?)
    """, (
        0 if payload.is_anonymous else emp_num,
        emp_name,
        payload.category,
        payload.sentiment,
        payload.message.strip(),
        1 if payload.is_anonymous else 0,
        now
    ))
    
    # Notify HR of new feedback
    cur.execute("SELECT id FROM users WHERE role = 'hr'")
    hr_users = cur.fetchall()
    for hr in hr_users:
        cur.execute("""
            INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
            VALUES (?, ?, ?, 'alert', '/hr/intelligence', 0, ?)
        """, (
            hr["id"],
            f"New Sentiment Pulse ({payload.sentiment})",
            f"Category: {payload.category} - from {emp_name}",
            now
        ))

    conn.commit()
    conn.close()

    return {"success": True, "message": "Feedback submitted confidentially. Thank you for your input."}

@router.get("")
def list_employee_feedback(current_user: Dict[str, Any] = Depends(require_hr)):
    """HR only: Review submitted employee feedback and sentiment pulse."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM employee_feedback ORDER BY created_at DESC LIMIT 50")
    feedback = [dict(row) for row in cur.fetchall()]
    conn.close()
    return {"feedback": feedback}
