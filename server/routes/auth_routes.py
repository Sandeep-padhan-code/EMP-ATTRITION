from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from server.database import get_db, verify_password
from server.auth import create_access_token, get_current_user
from server.ml_service import ml_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, password_hash, role, name, employee_number, department, job_role FROM users WHERE email = ?",
        (creds.email.strip().lower(),)
    )
    user = cur.fetchone()
    conn.close()

    if not user or not verify_password(creds.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    token = create_access_token(
        user_id=user["id"],
        email=user["email"],
        role=user["role"],
        employee_number=user["employee_number"]
    )

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "name": user["name"],
            "employee_number": user["employee_number"],
            "department": user["department"],
            "job_role": user["job_role"]
        }
    }

@router.get("/me")
def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {"user": current_user}

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}

@router.get("/demo-accounts")
def get_demo_accounts():
    """Provides convenient demo login shortcuts for evaluators."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT email, role, name, employee_number, department, job_role FROM users LIMIT 6")
    users = [dict(row) for row in cur.fetchall()]
    conn.close()

    return {
        "hr_default": {
            "email": "hr@acme-corp.internal",
            "password": "admin123",
            "role": "hr",
            "name": "Elena Rostova (VP People & Talent)"
        },
        "employee_default": {
            "email": "employee1@acme-corp.internal",
            "password": "password123",
            "role": "employee",
            "name": "Mary Davis (Sales Executive - High Risk Cohort)"
        },
        "other_demos": [
            {"email": "employee2@acme-corp.internal", "password": "password123", "role": "employee", "name": "Sarah Chen (Research Scientist)"},
            {"email": "employee3@acme-corp.internal", "password": "password123", "role": "employee", "name": "Marcus Vance (Software Engineer)"}
        ]
    }
