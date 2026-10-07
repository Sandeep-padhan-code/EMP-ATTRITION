import sqlite3
import hashlib
import hmac
import secrets
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

DB_PATH = Path(__file__).resolve().parent / "attrition_platform.db"

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: Optional[str] = None) -> str:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, expected_hash = stored_hash.split(":", 1)
        actual_hash = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
        return hmac.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

def init_db():
    conn = get_db()
    cur = conn.cursor()
    
    # 1. Users Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL, -- 'hr' or 'employee'
        name TEXT NOT NULL,
        employee_number INTEGER, -- references dataset EmployeeNumber
        department TEXT,
        job_role TEXT,
        avatar_url TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 2. Conversations Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        employee_name TEXT NOT NULL,
        hr_user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        topic TEXT DEFAULT 'General Check-in',
        status TEXT DEFAULT 'active', -- 'active', 'resolved', 'pending'
        last_message_preview TEXT,
        last_message_at TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # 3. Messages Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        sender_id INTEGER NOT NULL,
        sender_role TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        recipient_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'Check-in',
        is_read INTEGER DEFAULT 0,
        read_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
    """)

    # 4. Notifications Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL, -- 'message', 'action_plan', 'alert', 'system'
        link TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    # 5. Retention Action Plans & HR Notes
    cur.execute("""
    CREATE TABLE IF NOT EXISTS action_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_number INTEGER NOT NULL,
        employee_name TEXT NOT NULL,
        created_by_hr_id INTEGER NOT NULL,
        created_by_name TEXT NOT NULL,
        action_type TEXT NOT NULL, -- '1-on-1 Check-in', 'Workload Balancing', 'Compensation Review', 'Growth Plan'
        priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
        status TEXT DEFAULT 'Open', -- 'Open', 'In Progress', 'Completed'
        notes TEXT NOT NULL,
        target_date TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 6. Employee Sentiment & Feedback
    cur.execute("""
    CREATE TABLE IF NOT EXISTS employee_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_number INTEGER NOT NULL,
        employee_name TEXT,
        category TEXT NOT NULL,
        sentiment TEXT NOT NULL,
        message TEXT NOT NULL,
        is_anonymous INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Pending HR Review',
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

def seed_demo_data(ml_service_instance):
    """Seeds default HR and Employee accounts with realistic conversation history."""
    conn = get_db()
    cur = conn.cursor()

    # Check if HR user exists
    cur.execute("SELECT id FROM users WHERE email = 'hr@acme-corp.internal'")
    hr_exists = cur.fetchone()

    now = datetime.now(timezone.utc).isoformat()

    if not hr_exists:
        # 1. Create Default HR User
        cur.execute("""
            INSERT INTO users (email, password_hash, role, name, employee_number, department, job_role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "hr@acme-corp.internal",
            hash_password("admin123"),
            "hr",
            "Elena Rostova",
            None,
            "Human Resources",
            "VP of People & Talent Intelligence",
            now
        ))
        hr_id = cur.lastrowid

        # 2. Create Employee Accounts for dataset employees
        # We will create accounts for high-risk and medium-risk sample employees, e.g. Emp #1, #2, #3, #4, #5
        sample_emp_ids = [1, 2, 3, 4, 5, 10, 14, 20]
        emp_users = {}

        for emp_id in sample_emp_ids:
            emp = ml_service_instance.get_employee_by_id(emp_id)
            if emp:
                cur.execute("""
                    INSERT INTO users (email, password_hash, role, name, employee_number, department, job_role, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"employee{emp_id}@acme-corp.internal",
                    hash_password("password123"),
                    "employee",
                    emp["name"],
                    emp["employeeNumber"],
                    emp["department"],
                    emp["jobRole"],
                    now
                ))
                emp_user_id = cur.lastrowid
                emp_users[emp_id] = (emp_user_id, emp)

        # 3. Seed Conversations & Messages
        # For Emp #1 (High Risk)
        if 1 in emp_users:
            emp1_user_id, emp1_data = emp_users[1]
            conv1_id = f"conv_emp_1"
            cur.execute("""
                INSERT INTO conversations (id, employee_id, employee_name, hr_user_id, title, topic, status, last_message_preview, last_message_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                conv1_id,
                1,
                emp1_data["name"],
                hr_id,
                f"Workload & Role Engagement Check-in",
                "Workload Balancing",
                "active",
                "Thanks for checking in Elena. I've been feeling quite stretched with recent sprint overtime.",
                now,
                now
            ))

            # HR message
            cur.execute("""
                INSERT INTO messages (conversation_id, sender_id, sender_role, sender_name, recipient_id, content, category, is_read, read_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                conv1_id,
                hr_id,
                "hr",
                "Elena Rostova",
                emp1_user_id,
                f"Hi {emp1_data['name'].split()[0]}, I noticed our engineering workload has been intense lately. I'd love to connect for 15 minutes this week to see how you're feeling and ensure you have the support you need.",
                "Workload",
                1,
                now,
                now
            ))

            # Employee reply
            cur.execute("""
                INSERT INTO messages (conversation_id, sender_id, sender_role, sender_name, recipient_id, content, category, is_read, read_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                conv1_id,
                emp1_user_id,
                "employee",
                emp1_data["name"],
                hr_id,
                "Thanks for reaching out Elena. I appreciate you noticing. It's been pretty demanding with back-to-back release deliverables. I'd really appreciate a quick conversation about pacing and resources.",
                "Workload",
                0,
                None,
                now
            ))

            # Notifications for HR and Employee
            cur.execute("""
                INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                hr_id,
                f"New reply from {emp1_data['name']}",
                f"{emp1_data['name']} replied to 'Workload & Role Engagement Check-in'",
                "message",
                f"/hr/messages?conv={conv1_id}",
                0,
                now
            ))

            cur.execute("""
                INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                emp1_user_id,
                "New message from People & Talent Team",
                "Elena Rostova initiated a Workload & Role Engagement check-in.",
                "message",
                "/employee/messages",
                0,
                now
            ))

            # Seed Action Plan for Emp #1
            cur.execute("""
                INSERT INTO action_plans (employee_number, employee_name, created_by_hr_id, created_by_name, action_type, priority, status, notes, target_date, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                1,
                emp1_data["name"],
                hr_id,
                "Elena Rostova",
                "Workload Balancing",
                "High",
                "In Progress",
                "Met with engineering lead to reduce sprint commitments by 20% and evaluate contractor allocation.",
                "2026-10-20",
                now
            ))

        conn.commit()

    conn.close()
