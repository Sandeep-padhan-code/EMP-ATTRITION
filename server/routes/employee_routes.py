from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Optional, Dict, Any, List
from server.auth import get_current_user, require_hr
from server.ml_service import ml_service

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("")
def list_employees(
    department: Optional[str] = Query(None),
    job_role: Optional[str] = Query(None),
    risk_tier: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("riskProbability"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_hr)
):
    """HR only: Paginated list of real dataset employees with ML risk scores and filtering."""
    result = ml_service.get_all_employees(
        department=department,
        job_role=job_role,
        risk_tier=risk_tier,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    return result

@router.get("/me")
def get_my_employee_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns the authenticated employee's own profile without sensitive organization-wide risk scoring."""
    if current_user["role"] == "hr":
        return {"profile": current_user, "is_hr": True}
    
    emp_num = current_user.get("employee_number")
    if not emp_num:
        raise HTTPException(status_code=404, detail="Employee record not linked to this user")

    emp = ml_service.get_employee_by_id(emp_num)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee record not found in workforce dataset")

    # Filter out sensitive internal risk scoring from employee's personal view
    employee_safe_profile = {
        "id": emp["id"],
        "employeeNumber": emp["employeeNumber"],
        "name": emp["name"],
        "email": emp["email"],
        "department": emp["department"],
        "jobRole": emp["jobRole"],
        "gender": emp["gender"],
        "age": emp["age"],
        "educationField": emp["educationField"],
        "yearsAtCompany": emp["yearsAtCompany"],
        "totalWorkingYears": emp["totalWorkingYears"],
        "yearsInCurrentRole": emp["yearsInCurrentRole"],
        "yearsWithCurrManager": emp["yearsWithCurrManager"],
        "workLifeBalance": emp["workLifeBalance"],
        "jobSatisfaction": emp["jobSatisfaction"],
        "environmentSatisfaction": emp["environmentSatisfaction"],
        "relationshipSatisfaction": emp["relationshipSatisfaction"],
        "businessTravel": emp["businessTravel"],
        "overTime": emp["overTime"]
    }
    return {"profile": employee_safe_profile}

@router.get("/{employee_id}")
def get_employee_details(
    employee_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Fetches employee record. HR has unrestricted access. Employees can only access their own record."""
    if current_user["role"] != "hr":
        if current_user.get("employee_number") != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You do not have permission to view other employee records."
            )

    emp = ml_service.get_employee_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee #{employee_id} not found")

    # If accessed by employee, strip the ML prediction block
    if current_user["role"] == "employee":
        emp_safe = emp.copy()
        emp_safe.pop("prediction", None)
        emp_safe.pop("historicalAttrition", None)
        return {"employee": emp_safe}

    return {"employee": emp}

@router.get("/{employee_id}/prediction")
def get_employee_prediction(
    employee_id: int,
    current_user: Dict[str, Any] = Depends(require_hr)
):
    """HR only: Real-time ML inference prediction and contributing factors."""
    emp = ml_service.get_employee_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee #{employee_id} not found")

    return {
        "employee_id": employee_id,
        "name": emp["name"],
        "department": emp["department"],
        "job_role": emp["jobRole"],
        "prediction": emp["prediction"]
    }
