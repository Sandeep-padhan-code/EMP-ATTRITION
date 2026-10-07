import io
import csv
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from server.auth import require_hr
from server.database import get_db
from server.ml_service import ml_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])

class CreateActionPlanRequest(BaseModel):
    employee_number: int
    employee_name: str
    action_type: str
    priority: str = "Medium"
    notes: str
    target_date: Optional[str] = None

class UpdateActionPlanRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@router.get("/summary")
def get_report_summary(current_user: Dict[str, Any] = Depends(require_hr)):
    """Generates an executive-ready workforce attrition and retention analysis report."""
    analytics = ml_service.get_workforce_analytics()
    
    # Calculate executive takeaways
    kpis = analytics["workforce_kpis"]
    top_risk_dept = max(analytics["departments"], key=lambda d: d["risk_rate"])
    top_factors = analytics["top_model_factors"]

    executive_takeaways = [
        f"Workforce Risk Index: {kpis['at_risk_count']} employees ({kpis['at_risk_rate']}%) currently exhibit elevated attrition risk signals.",
        f"Department Focus: {top_risk_dept['department']} shows the highest vulnerability with a {top_risk_dept['risk_rate']}% estimated attrition rate.",
        f"Workload Impact: Employees with active Overtime demonstrate a {kpis['overtime_risk_multiplier']}x risk multiplier compared to standard-cadence peers.",
        f"Primary Model Driver: '{top_factors[0]['feature']}' ({top_factors[0]['importance']}%) is the strongest structural feature influencing predictions."
    ]

    return {
        "generated_at": datetime.now(timezone.utc).strftime("%B %d, %Y - %H:%M UTC"),
        "generated_by": current_user["name"],
        "executive_takeaways": executive_takeaways,
        "kpis": kpis,
        "departments": analytics["departments"],
        "top_model_factors": top_factors,
        "priority_action_roster": analytics["priority_action_queue"],
        "model_metadata": analytics["model_metadata"]
    }

@router.get("/export-csv")
def export_workforce_csv(current_user: Dict[str, Any] = Depends(require_hr)):
    """Exports full workforce records with real ML risk assessments into a clean CSV stream."""
    all_data = ml_service.get_all_employees(page=1, page_size=2000)
    employees = all_data["employees"]

    output = io.StringIO()
    fieldnames = [
        "EmployeeNumber", "FullName", "Email", "Department", "JobRole",
        "RiskTier", "RiskProbabilityPct", "RetentionProbabilityPct", "ML_Prediction",
        "MonthlyIncome", "JobSatisfaction", "EnvironmentSatisfaction", "WorkLifeBalance",
        "OverTime", "YearsAtCompany", "YearsSinceLastPromotion", "YearsWithCurrManager", "HistoricalAttrition"
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for emp in employees:
        writer.writerow({
            "EmployeeNumber": emp["employeeNumber"],
            "FullName": emp["name"],
            "Email": emp["email"],
            "Department": emp["department"],
            "JobRole": emp["jobRole"],
            "RiskTier": emp["attritionRisk"],
            "RiskProbabilityPct": emp["riskProbability"],
            "RetentionProbabilityPct": emp["retentionProbability"],
            "ML_Prediction": emp["prediction"],
            "MonthlyIncome": emp["monthlyIncome"],
            "JobSatisfaction": emp["jobSatisfaction"],
            "EnvironmentSatisfaction": emp["environmentSatisfaction"],
            "WorkLifeBalance": emp["workLifeBalance"],
            "OverTime": emp["overTime"],
            "YearsAtCompany": emp["yearsAtCompany"],
            "YearsSinceLastPromotion": emp["yearsSinceLastPromotion"],
            "YearsWithCurrManager": emp["yearsWithCurrManager"],
            "HistoricalAttrition": emp["historicalAttrition"]
        })

    csv_content = output.getvalue()
    output.close()

    filename = f"workforce_attrition_report_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/action-plans")
def list_action_plans(
    employee_number: Optional[int] = None,
    current_user: Dict[str, Any] = Depends(require_hr)
):
    conn = get_db()
    cur = conn.cursor()
    if employee_number:
        cur.execute("SELECT * FROM action_plans WHERE employee_number = ? ORDER BY created_at DESC", (employee_number,))
    else:
        cur.execute("SELECT * FROM action_plans ORDER BY created_at DESC")
    plans = [dict(row) for row in cur.fetchall()]
    conn.close()
    return {"action_plans": plans}

@router.post("/action-plans")
def create_action_plan(
    payload: CreateActionPlanRequest,
    current_user: Dict[str, Any] = Depends(require_hr)
):
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO action_plans (employee_number, employee_name, created_by_hr_id, created_by_name, action_type, priority, status, notes, target_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?)
    """, (
        payload.employee_number,
        payload.employee_name,
        current_user["id"],
        current_user["name"],
        payload.action_type,
        payload.priority,
        payload.notes,
        payload.target_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        now
    ))
    plan_id = cur.lastrowid
    conn.commit()
    cur.execute("SELECT * FROM action_plans WHERE id = ?", (plan_id,))
    created_plan = dict(cur.fetchone())
    conn.close()
    return {"action_plan": created_plan}
