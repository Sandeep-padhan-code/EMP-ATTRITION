from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from server.auth import require_hr
from server.ml_service import ml_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(current_user: Dict[str, Any] = Depends(require_hr)):
    """Returns high-level workforce KPIs, risk distributions, department summaries, and priority queue."""
    analytics = ml_service.get_workforce_analytics()
    return analytics

@router.get("/departments")
def get_department_analytics(current_user: Dict[str, Any] = Depends(require_hr)):
    """Returns department-level workforce breakdown, overtime exposure, and attrition probability."""
    analytics = ml_service.get_workforce_analytics()
    return {"departments": analytics["departments"]}

@router.get("/model-factors")
def get_global_model_factors(current_user: Dict[str, Any] = Depends(require_hr)):
    """Returns the top feature importances directly from the trained Random Forest model."""
    factors = ml_service.get_global_feature_importances()
    return {"factors": factors, "model_accuracy": "88.10%", "algorithm": "Random Forest (200 Trees)"}
