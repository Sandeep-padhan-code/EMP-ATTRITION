from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from server.database import get_db
from server.auth import get_current_user
from server.ml_service import ml_service

router = APIRouter(prefix="/api/messages", tags=["Messages"])

class SendMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    recipient_employee_number: Optional[int] = None
    recipient_id: Optional[int] = None
    content: str
    category: Optional[str] = "Check-in"
    title: Optional[str] = None

class MarkReadRequest(BaseModel):
    message_id: int

@router.get("/conversations")
def list_conversations(current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()

    if current_user["role"] == "hr":
        # HR sees all active conversations
        cur.execute("""
            SELECT c.*, 
                   (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.recipient_id = ? AND m.is_read = 0) as unread_count
            FROM conversations c
            ORDER BY c.last_message_at DESC
        """, (current_user["id"],))
    else:
        # Employee sees only their own conversation
        emp_num = current_user.get("employee_number")
        cur.execute("""
            SELECT c.*,
                   (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.recipient_id = ? AND m.is_read = 0) as unread_count
            FROM conversations c
            WHERE c.employee_id = ?
            ORDER BY c.last_message_at DESC
        """, (current_user["id"], emp_num))

    rows = cur.fetchall()
    conversations = [dict(row) for row in rows]
    conn.close()

    return {"conversations": conversations}

@router.get("/conversations/{conversation_id}")
def get_conversation_messages(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    conn = get_db()
    cur = conn.cursor()

    # Verify access to conversation
    cur.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
    conv = cur.fetchone()
    if not conv:
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    if current_user["role"] != "hr" and conv["employee_id"] != current_user.get("employee_number"):
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied to this conversation thread")

    # Mark incoming messages as read for this user
    now = datetime.now(timezone.utc).isoformat()
    cur.execute("""
        UPDATE messages
        SET is_read = 1, read_at = ?
        WHERE conversation_id = ? AND recipient_id = ? AND is_read = 0
    """, (now, conversation_id, current_user["id"]))
    conn.commit()

    # Fetch all messages in thread
    cur.execute("""
        SELECT * FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
    """, (conversation_id,))
    messages = [dict(row) for row in cur.fetchall()]
    conn.close()

    return {
        "conversation": dict(conv),
        "messages": messages
    }

@router.post("")
def send_message(
    payload: SendMessageRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    conn = get_db()
    cur = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()

    conv_id = payload.conversation_id
    recipient_id = payload.recipient_id

    if current_user["role"] == "hr":
        # HR sending to employee
        if not conv_id and payload.recipient_employee_number:
            conv_id = f"conv_emp_{payload.recipient_employee_number}"

        if not conv_id:
            conn.close()
            raise HTTPException(status_code=400, detail="Missing conversation_id or recipient_employee_number")

        # Check if conversation exists, or create it
        cur.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
        conv = cur.fetchone()

        if not conv:
            emp_num = payload.recipient_employee_number or int(conv_id.replace("conv_emp_", ""))
            emp = ml_service.get_employee_by_id(emp_num)
            emp_name = emp["name"] if emp else f"Employee #{emp_num}"
            conv_title = payload.title or f"Retention & Role Check-in with {emp_name}"

            cur.execute("""
                INSERT INTO conversations (id, employee_id, employee_name, hr_user_id, title, topic, status, last_message_preview, last_message_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                conv_id,
                emp_num,
                emp_name,
                current_user["id"],
                conv_title,
                payload.category or "Check-in",
                "active",
                payload.content[:80],
                now,
                now
            ))
            
            # Find employee user ID if registered
            cur.execute("SELECT id FROM users WHERE employee_number = ?", (emp_num,))
            emp_user = cur.fetchone()
            if not emp_user:
                # Create user account for this employee on demand so they can login and reply
                cur.execute("""
                    INSERT INTO users (email, password_hash, role, name, employee_number, department, job_role, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"employee{emp_num}@acme-corp.internal",
                    "dummy_hash",
                    "employee",
                    emp_name,
                    emp_num,
                    emp["department"] if emp else "",
                    emp["jobRole"] if emp else "",
                    now
                ))
                recipient_id = cur.lastrowid
            else:
                recipient_id = emp_user["id"]
        else:
            cur.execute("SELECT id FROM users WHERE employee_number = ?", (conv["employee_id"],))
            emp_user = cur.fetchone()
            recipient_id = emp_user["id"] if emp_user else 0

    else:
        # Employee sending to HR
        emp_num = current_user.get("employee_number")
        conv_id = conv_id or f"conv_emp_{emp_num}"

        cur.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
        conv = cur.fetchone()

        if not conv:
            # Find default HR user
            cur.execute("SELECT id FROM users WHERE role = 'hr' LIMIT 1")
            hr_user = cur.fetchone()
            hr_id = hr_user["id"] if hr_user else 1

            cur.execute("""
                INSERT INTO conversations (id, employee_id, employee_name, hr_user_id, title, topic, status, last_message_preview, last_message_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                conv_id,
                emp_num,
                current_user["name"],
                hr_id,
                f"HR Communication Thread",
                payload.category or "General",
                "active",
                payload.content[:80],
                now,
                now
            ))
            recipient_id = hr_id
        else:
            recipient_id = conv["hr_user_id"]

    # Insert Message
    cur.execute("""
        INSERT INTO messages (conversation_id, sender_id, sender_role, sender_name, recipient_id, content, category, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (
        conv_id,
        current_user["id"],
        current_user["role"],
        current_user["name"],
        recipient_id,
        payload.content.strip(),
        payload.category or "Check-in",
        now
    ))
    message_id = cur.lastrowid

    # Update Conversation timestamp and preview
    cur.execute("""
        UPDATE conversations
        SET last_message_preview = ?, last_message_at = ?
        WHERE id = ?
    """, (payload.content.strip()[:80], now, conv_id))

    # Create Notification for recipient
    notif_title = f"New message from {current_user['name']}"
    notif_link = f"/hr/messages?conv={conv_id}" if current_user["role"] == "employee" else "/employee/messages"
    
    cur.execute("""
        INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
    """, (
        recipient_id,
        notif_title,
        payload.content.strip()[:100],
        "message",
        notif_link,
        now
    ))

    conn.commit()

    # Return created message
    cur.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
    created_msg = dict(cur.fetchone())
    conn.close()

    return {"message": created_msg, "conversation_id": conv_id}
