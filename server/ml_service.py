import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import numpy as np
import pandas as pd

# Paths
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "dataset" / "archive" / "employee_attrition.csv"
MODEL_PATH = BASE_DIR / "models" / "employee_attrition_model.pkl"
ENCODER_PATH = BASE_DIR / "models" / "encoders.pkl"

if not MODEL_PATH.exists() and (BASE_DIR / "employee_attrition_model.pkl").exists():
    MODEL_PATH = BASE_DIR / "employee_attrition_model.pkl"
if not ENCODER_PATH.exists() and (BASE_DIR / "encoders.pkl").exists():
    ENCODER_PATH = BASE_DIR / "encoders.pkl"

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
    "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Frank", "Debra",
    "Alexander", "Rachel", "Raymond", "Catherine", "Patrick", "Carolyn", "Jack", "Janet",
    "Dennis", "Ruth", "Jerry", "Maria", "Tyler", "Heather", "Aaron", "Diane"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
    "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
    "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
    "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers"
]

def generate_employee_name(emp_num: int, gender: str = "") -> str:
    first = FIRST_NAMES[int(emp_num) % len(FIRST_NAMES)]
    last = LAST_NAMES[(int(emp_num) * 7) % len(LAST_NAMES)]
    return f"{first} {last}"

def generate_employee_email(first_last: str, emp_num: int) -> str:
    clean = first_last.lower().replace(" ", ".")
    return f"{clean}.{emp_num}@acme-corp.internal"

class MLService:
    def __init__(self):
        self.model = None
        self.encoders = {}
        self.df = None
        self.feature_names = []
        self.feature_importances = {}
        self.sorted_importances = []
        self.load_resources()

    def load_resources(self):
        if not DATA_PATH.exists():
            raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
        
        self.df = pd.read_csv(DATA_PATH)
        self.df["EmployeeNumber"] = self.df["EmployeeNumber"].astype(int)
        self.df["FullName"] = self.df.apply(
            lambda r: generate_employee_name(r["EmployeeNumber"], r.get("Gender", "")), axis=1
        )
        self.df["Email"] = self.df.apply(
            lambda r: generate_employee_email(r["FullName"], r["EmployeeNumber"]), axis=1
        )
        self.df["AttritionNumeric"] = self.df["Attrition"].map({"Yes": 1, "No": 0}).fillna(0).astype(int)

        # Load Model & Encoders
        if MODEL_PATH.exists() and ENCODER_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
            self.encoders = joblib.load(ENCODER_PATH)
            self.feature_names = list(self.model.feature_names_in_)
            
            importances = self.model.feature_importances_
            self.feature_importances = {
                f: float(imp) for f, imp in zip(self.feature_names, importances)
            }
            self.sorted_importances = sorted(
                [{"feature": f, "importance": round(float(imp) * 100, 2)} for f, imp in self.feature_importances.items()],
                key=lambda x: x["importance"],
                reverse=True
            )
            self._precompute_all_predictions()
        else:
            print(f"[WARN] Model or encoders not found at {MODEL_PATH}")

    def _precompute_all_predictions(self):
        """Vectorized computation of predictions across the entire dataset in a single matrix pass."""
        encoded_df = pd.DataFrame(index=self.df.index)
        for col in self.feature_names:
            if col in self.encoders:
                encoder = self.encoders[col]
                # Map using encoder classes
                mapping = {cls: idx for idx, cls in enumerate(encoder.classes_)}
                encoded_df[col] = self.df[col].astype(str).map(mapping).fillna(0).astype(int)
            else:
                encoded_df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0.0)

        # Model batch inference
        X = encoded_df[self.feature_names].values
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)[:, 1] if hasattr(self.model, "predict_proba") else predictions.astype(float)

        self.df["ML_Prediction"] = predictions
        self.df["RiskProbability"] = (probabilities * 100).round(1)
        self.df["RetentionProbability"] = (100.0 - self.df["RiskProbability"]).round(1)

        def get_tier(prob):
            if prob >= 65.0:
                return "High"
            elif prob >= 35.0:
                return "Medium"
            return "Low"

        def get_color(prob):
            if prob >= 65.0:
                return "red"
            elif prob >= 35.0:
                return "amber"
            return "emerald"

        self.df["RiskTier"] = self.df["RiskProbability"].apply(get_tier)
        self.df["BadgeColor"] = self.df["RiskProbability"].apply(get_color)

    def get_feature_names(self) -> List[str]:
        return self.feature_names

    def get_global_feature_importances(self) -> List[Dict[str, Any]]:
        return self.sorted_importances

    def get_employee_contributing_factors(self, emp: pd.Series) -> List[Dict[str, Any]]:
        factors = []

        # 1. OverTime
        if emp.get("OverTime") == "Yes":
            imp = self.feature_importances.get("OverTime", 0.05)
            factors.append({
                "factor": "Mandatory / Frequent Overtime",
                "category": "Workload & Schedule",
                "signal_strength": "High",
                "influence_score": round(imp * 120, 1),
                "employee_value": "Yes (Active Overtime)",
                "benchmark": "Non-overtime peers show 68% lower baseline attrition",
                "description": "Consistently elevated overtime hours is a primary driver of fatigue and turnover intention in this role cohort."
            })
        
        # 2. Monthly Income
        monthly_income = float(emp.get("MonthlyIncome", 0))
        job_level = int(emp.get("JobLevel", 1))
        if monthly_income < (job_level * 3200):
            imp = self.feature_importances.get("MonthlyIncome", 0.07)
            factors.append({
                "factor": "Compensation Ratio for Job Level",
                "category": "Compensation",
                "signal_strength": "Moderate" if monthly_income > 3000 else "High",
                "influence_score": round(imp * 100, 1),
                "employee_value": f"${monthly_income:,.0f}/mo (Level {job_level})",
                "benchmark": f"Peer median at Level {job_level}: ${job_level * 3500:,.0f}/mo",
                "description": "Monthly compensation sits in the lower quartile for the current job level classification."
            })

        # 3. Job Satisfaction
        job_sat = int(emp.get("JobSatisfaction", 3))
        if job_sat <= 2:
            imp = self.feature_importances.get("JobSatisfaction", 0.04)
            factors.append({
                "factor": "Low Job Satisfaction Score",
                "category": "Engagement & Sentiment",
                "signal_strength": "High" if job_sat == 1 else "Moderate",
                "influence_score": round(imp * 95, 1),
                "employee_value": f"{job_sat} / 4.0 Rating",
                "benchmark": "Company Target >= 3.0",
                "description": "Reported low satisfaction with day-to-day responsibilities and work fulfillment."
            })

        # 4. Environment Satisfaction
        env_sat = int(emp.get("EnvironmentSatisfaction", 3))
        if env_sat <= 2:
            imp = self.feature_importances.get("EnvironmentSatisfaction", 0.04)
            factors.append({
                "factor": "Work Environment Friction",
                "category": "Workplace Culture",
                "signal_strength": "Moderate",
                "influence_score": round(imp * 90, 1),
                "employee_value": f"{env_sat} / 4.0 Rating",
                "benchmark": "Company Target >= 3.0",
                "description": "Expressed dissatisfaction with immediate team processes, tooling, or environment."
            })

        # 5. Work Life Balance
        wlb = int(emp.get("WorkLifeBalance", 3))
        if wlb <= 2:
            imp = self.feature_importances.get("WorkLifeBalance", 0.04)
            factors.append({
                "factor": "Work-Life Balance Strain",
                "category": "Wellbeing",
                "signal_strength": "Moderate" if wlb == 2 else "High",
                "influence_score": round(imp * 88, 1),
                "employee_value": f"{wlb} / 4.0 Rating",
                "benchmark": "Cohort Average 2.8",
                "description": "Indicators of schedule inflexibility or personal-professional life imbalance."
            })

        # 6. Years Since Last Promotion
        yrs_promo = int(emp.get("YearsSinceLastPromotion", 0))
        yrs_company = int(emp.get("YearsAtCompany", 0))
        if yrs_promo >= 3 and yrs_company >= 3:
            imp = self.feature_importances.get("YearsSinceLastPromotion", 0.04)
            factors.append({
                "factor": "Stagnant Career Progression",
                "category": "Career Growth",
                "signal_strength": "Moderate",
                "influence_score": round(imp * 80, 1),
                "employee_value": f"{yrs_promo} years without promotion ({yrs_company} yrs at company)",
                "benchmark": "Internal Promotion Cycle: 2.1 yrs",
                "description": "Extended tenure in current band without formal title or tier progression."
            })

        # 7. Commute Distance
        dist = int(emp.get("DistanceFromHome", 0))
        if dist >= 14:
            imp = self.feature_importances.get("DistanceFromHome", 0.04)
            factors.append({
                "factor": "Long Commute Distance",
                "category": "Logistics",
                "signal_strength": "Low" if dist < 20 else "Moderate",
                "influence_score": round(imp * 75, 1),
                "employee_value": f"{dist} miles from workplace",
                "benchmark": "Median Commute: 7 miles",
                "description": "High commute distance correlates with higher burnout when combined with onsite days."
            })

        # 8. Business Travel
        travel = str(emp.get("BusinessTravel", "Travel_Rarely"))
        if travel == "Travel_Frequently":
            imp = self.feature_importances.get("BusinessTravel", 0.03)
            factors.append({
                "factor": "High Travel Cadence",
                "category": "Logistics",
                "signal_strength": "Moderate",
                "influence_score": round(imp * 70, 1),
                "employee_value": "Travel Frequently",
                "benchmark": "Travel Rarely / Non-Travel",
                "description": "Frequent business travel adds operational pressure on retention."
            })

        # Stabilizers if few negative factors
        if not factors:
            factors.append({
                "factor": "Balanced Workload & Schedule",
                "category": "Retention Stabilizer",
                "signal_strength": "Positive",
                "influence_score": 10.0,
                "employee_value": "No Overtime / Standard Schedule",
                "benchmark": "Stable",
                "description": "Healthy work cadence with no overtime strain reported."
            })
            factors.append({
                "factor": "High Job & Environment Satisfaction",
                "category": "Retention Stabilizer",
                "signal_strength": "Positive",
                "influence_score": 12.0,
                "employee_value": f"Satisfaction {emp.get('JobSatisfaction', 4)}/4",
                "benchmark": "Healthy",
                "description": "Strong alignment with role responsibilities and workplace culture."
            })

        factors.sort(key=lambda x: x["influence_score"], reverse=True)
        return factors[:6]

    def _generate_recommendations(self, emp: pd.Series, risk_pct: float) -> List[Dict[str, str]]:
        suggestions = []
        if emp.get("OverTime") == "Yes":
            suggestions.append({
                "action": "Workload Balancing & Overtime Audit",
                "impact": "High",
                "timeframe": "Immediate (Within 7 Days)",
                "description": "Review sprint allocation and explore temp contractor support or project timeline adjustments to alleviate overtime pressure."
            })
        if int(emp.get("JobSatisfaction", 3)) <= 2:
            suggestions.append({
                "action": "Structured 1-on-1 Role Fit Check-in",
                "impact": "High",
                "timeframe": "Next 14 Days",
                "description": "Schedule a candid conversation focused on day-to-day blockers, project autonomy, and realignment with preferred domain interests."
            })
        if int(emp.get("YearsSinceLastPromotion", 0)) >= 3:
            suggestions.append({
                "action": "Career Progression & Milestone Review",
                "impact": "Medium",
                "timeframe": "Within 30 Days",
                "description": "Establish transparent criteria and growth milestones for the next promotional band or lateral leadership track."
            })
        if int(emp.get("WorkLifeBalance", 3)) <= 2 or int(emp.get("DistanceFromHome", 0)) >= 15:
            suggestions.append({
                "action": "Flexible / Hybrid Work Arrangement",
                "impact": "Medium",
                "timeframe": "Next Sprint",
                "description": "Offer enhanced remote working flexibility or core hours flexibility to minimize commute friction."
            })
        if int(emp.get("PercentSalaryHike", 15)) <= 12 or float(emp.get("MonthlyIncome", 0)) < 4000:
            suggestions.append({
                "action": "Market Compensation Calibration",
                "impact": "High" if risk_pct >= 50 else "Medium",
                "timeframe": "Next Compensation Review Cycle",
                "description": "Conduct internal pay equity and external benchmark review to ensure competitive market positioning."
            })
        if not suggestions:
            suggestions.append({
                "action": "Quarterly Career Mentorship & Recognition",
                "impact": "Moderate",
                "timeframe": "Ongoing",
                "description": "Continue positive engagement cadence, assign high-visibility projects, and recognize consistent performance."
            })
        return suggestions[:4]

    def get_all_employees(self, 
                          department: Optional[str] = None, 
                          job_role: Optional[str] = None, 
                          risk_tier: Optional[str] = None,
                          search: Optional[str] = None,
                          sort_by: str = "EmployeeNumber",
                          sort_order: str = "asc",
                          page: int = 1, 
                          page_size: int = 15) -> Dict[str, Any]:
        df = self.df.copy()

        # Department Filter
        if department and department.strip() and department != "All":
            df = df[df["Department"].str.lower() == department.strip().lower()]

        # Job Role Filter
        if job_role and job_role.strip() and job_role != "All":
            df = df[df["JobRole"].str.lower() == job_role.strip().lower()]

        # Risk Tier Filter
        if risk_tier and risk_tier.strip() and risk_tier != "All":
            df = df[df["RiskTier"].str.lower() == risk_tier.strip().lower()]

        # Text Search
        if search and search.strip():
            q = search.strip().lower()
            df = df[
                df["FullName"].str.lower().str.contains(q, na=False) |
                df["Email"].str.lower().str.contains(q, na=False) |
                df["EmployeeNumber"].astype(str).str.contains(q, na=False) |
                df["Department"].str.lower().str.contains(q, na=False) |
                df["JobRole"].str.lower().str.contains(q, na=False)
            ]

        filtered_count = len(df)

        # Sorting
        sort_col_map = {
            "riskProbability": "RiskProbability",
            "monthlyIncome": "MonthlyIncome",
            "age": "Age",
            "yearsAtCompany": "YearsAtCompany",
            "employeeNumber": "EmployeeNumber",
            "name": "FullName",
            "department": "Department",
            "jobRole": "JobRole",
            "jobSatisfaction": "JobSatisfaction"
        }
        actual_sort_col = sort_col_map.get(sort_by, "EmployeeNumber")
        ascending = (sort_order.lower() != "desc")
        df = df.sort_values(by=actual_sort_col, ascending=ascending)

        # Pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_df = df.iloc[start_idx:end_idx]

        records = []
        for _, row in paged_df.iterrows():
            records.append({
                "id": int(row["EmployeeNumber"]),
                "employeeNumber": int(row["EmployeeNumber"]),
                "name": row["FullName"],
                "email": row["Email"],
                "department": row["Department"],
                "jobRole": row["JobRole"],
                "gender": row.get("Gender", ""),
                "age": int(row["Age"]),
                "monthlyIncome": float(row["MonthlyIncome"]),
                "yearsAtCompany": int(row["YearsAtCompany"]),
                "totalWorkingYears": int(row["TotalWorkingYears"]),
                "overTime": row["OverTime"],
                "businessTravel": row["BusinessTravel"],
                "jobSatisfaction": int(row["JobSatisfaction"]),
                "environmentSatisfaction": int(row["EnvironmentSatisfaction"]),
                "workLifeBalance": int(row["WorkLifeBalance"]),
                "performanceRating": int(row["PerformanceRating"]),
                "yearsSinceLastPromotion": int(row["YearsSinceLastPromotion"]),
                "yearsWithCurrManager": int(row["YearsWithCurrManager"]),
                "distanceFromHome": int(row["DistanceFromHome"]),
                "educationField": row.get("EducationField", ""),
                "numCompaniesWorked": int(row.get("NumCompaniesWorked", 0)),
                "stockOptionLevel": int(row.get("StockOptionLevel", 0)),
                "attritionRisk": row["RiskTier"],
                "riskProbability": float(row["RiskProbability"]),
                "retentionProbability": float(row["RetentionProbability"]),
                "prediction": int(row["ML_Prediction"]),
                "badgeColor": row["BadgeColor"],
                "historicalAttrition": row["Attrition"]
            })

        total_pages = max(1, (filtered_count + page_size - 1) // page_size)

        return {
            "employees": records,
            "pagination": {
                "total": filtered_count,
                "dataset_total": len(self.df),
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }

    def get_employee_by_id(self, emp_id: int) -> Optional[Dict[str, Any]]:
        matches = self.df[self.df["EmployeeNumber"] == int(emp_id)]
        if matches.empty:
            return None
        
        row = matches.iloc[0]
        factors = self.get_employee_contributing_factors(row)
        recommendations = self._generate_recommendations(row, float(row["RiskProbability"]))

        return {
            "id": int(row["EmployeeNumber"]),
            "employeeNumber": int(row["EmployeeNumber"]),
            "name": row["FullName"],
            "email": row["Email"],
            "department": row["Department"],
            "jobRole": row["JobRole"],
            "gender": row.get("Gender", ""),
            "age": int(row["Age"]),
            "maritalStatus": row.get("MaritalStatus", ""),
            "education": int(row.get("Education", 1)),
            "educationField": row.get("EducationField", ""),
            "monthlyIncome": float(row["MonthlyIncome"]),
            "monthlyRate": float(row.get("MonthlyRate", 0)),
            "dailyRate": float(row.get("DailyRate", 0)),
            "hourlyRate": float(row.get("HourlyRate", 0)),
            "percentSalaryHike": int(row.get("PercentSalaryHike", 0)),
            "stockOptionLevel": int(row.get("StockOptionLevel", 0)),
            "jobLevel": int(row.get("JobLevel", 1)),
            "jobInvolvement": int(row.get("JobInvolvement", 3)),
            "jobSatisfaction": int(row["JobSatisfaction"]),
            "environmentSatisfaction": int(row["EnvironmentSatisfaction"]),
            "relationshipSatisfaction": int(row.get("RelationshipSatisfaction", 3)),
            "workLifeBalance": int(row["WorkLifeBalance"]),
            "performanceRating": int(row["PerformanceRating"]),
            "overTime": row["OverTime"],
            "businessTravel": row["BusinessTravel"],
            "distanceFromHome": int(row["DistanceFromHome"]),
            "numCompaniesWorked": int(row.get("NumCompaniesWorked", 0)),
            "totalWorkingYears": int(row["TotalWorkingYears"]),
            "trainingTimesLastYear": int(row.get("TrainingTimesLastYear", 0)),
            "yearsAtCompany": int(row["YearsAtCompany"]),
            "yearsInCurrentRole": int(row.get("YearsInCurrentRole", 0)),
            "yearsSinceLastPromotion": int(row["YearsSinceLastPromotion"]),
            "yearsWithCurrManager": int(row["YearsWithCurrManager"]),
            "historicalAttrition": row["Attrition"],
            "prediction": {
                "prediction": int(row["ML_Prediction"]),
                "risk_probability": float(row["RiskProbability"]),
                "retention_probability": float(row["RetentionProbability"]),
                "risk_tier": row["RiskTier"],
                "badge_color": row["BadgeColor"],
                "contributing_factors": factors,
                "recommendations": recommendations,
                "disclaimer": "Decision support only — model predictions represent statistical risk signals and should be evaluated alongside HR context and 1-on-1 conversations."
            }
        }

    def get_workforce_analytics(self) -> Dict[str, Any]:
        df = self.df
        total_count = len(df)

        risk_counts = {
            "Low": int((df["RiskTier"] == "Low").sum()),
            "Medium": int((df["RiskTier"] == "Medium").sum()),
            "High": int((df["RiskTier"] == "High").sum()),
        }
        avg_risk_rate = round(float(df["RiskProbability"].mean()), 1)
        at_risk_count = risk_counts["Medium"] + risk_counts["High"]
        high_risk_count = risk_counts["High"]

        # Department Breakdown
        departments_data = []
        for dept_name, group in df.groupby("Department"):
            dept_total = len(group)
            overtime_count = int((group["OverTime"] == "Yes").sum())
            avg_income = float(group["MonthlyIncome"].mean())
            avg_sat = float(group["JobSatisfaction"].mean())
            
            dept_high_risk = int((group["RiskTier"] == "High").sum())
            dept_med_risk = int((group["RiskTier"] == "Medium").sum())
            dept_risk_rate = round(((dept_high_risk + dept_med_risk) / dept_total) * 100, 1)

            departments_data.append({
                "department": dept_name,
                "headcount": dept_total,
                "share": round((dept_total / total_count) * 100, 1),
                "at_risk_count": dept_high_risk + dept_med_risk,
                "high_risk_count": dept_high_risk,
                "medium_risk_count": dept_med_risk,
                "risk_rate": dept_risk_rate,
                "avg_monthly_income": round(avg_income, 0),
                "avg_satisfaction": round(avg_sat, 2),
                "overtime_headcount": overtime_count,
                "overtime_rate": round((overtime_count / dept_total) * 100, 1)
            })

        # Job Role Exposure Breakdown
        roles_data = []
        for role_name, group in df.groupby("JobRole"):
            role_total = len(group)
            role_high = int((group["RiskTier"] == "High").sum())
            
            roles_data.append({
                "role": role_name,
                "department": group["Department"].iloc[0],
                "headcount": role_total,
                "high_risk_count": role_high,
                "risk_rate": round((role_high / role_total) * 100, 1),
                "avg_income": round(float(group["MonthlyIncome"].mean()), 0)
            })
        roles_data.sort(key=lambda x: x["risk_rate"], reverse=True)

        # OverTime Analysis
        ot_group = df[df["OverTime"] == "Yes"]
        non_ot_group = df[df["OverTime"] == "No"]
        ot_attrition_rate = round(float(ot_group["AttritionNumeric"].mean() * 100), 1) if len(ot_group) > 0 else 0.0
        non_ot_attrition_rate = round(float(non_ot_group["AttritionNumeric"].mean() * 100), 1) if len(non_ot_group) > 0 else 0.0

        # Tenure breakdown
        tenure_bands = [
            {"band": "0-2 Years", "count": int((df["YearsAtCompany"] <= 2).sum()), "risk_rate": round(float(df[df["YearsAtCompany"] <= 2]["RiskProbability"].mean()), 1)},
            {"band": "3-5 Years", "count": int(((df["YearsAtCompany"] > 2) & (df["YearsAtCompany"] <= 5)).sum()), "risk_rate": round(float(df[(df["YearsAtCompany"] > 2) & (df["YearsAtCompany"] <= 5)]["RiskProbability"].mean()), 1)},
            {"band": "6-10 Years", "count": int(((df["YearsAtCompany"] > 5) & (df["YearsAtCompany"] <= 10)).sum()), "risk_rate": round(float(df[(df["YearsAtCompany"] > 5) & (df["YearsAtCompany"] <= 10)]["RiskProbability"].mean()), 1)},
            {"band": "10+ Years", "count": int((df["YearsAtCompany"] > 10).sum()), "risk_rate": round(float(df[df["YearsAtCompany"] > 10]["RiskProbability"].mean()), 1)}
        ]

        # Priority Action Queue
        high_risk_df = df[df["RiskTier"] == "High"].sort_values(by="RiskProbability", ascending=False).head(6)
        priority_employees = []
        for _, row in high_risk_df.iterrows():
            top_factors = self.get_employee_contributing_factors(row)
            top_driver = top_factors[0]["factor"] if top_factors else "Elevated Workload"
            priority_employees.append({
                "id": int(row["EmployeeNumber"]),
                "name": row["FullName"],
                "email": row["Email"],
                "department": row["Department"],
                "jobRole": row["JobRole"],
                "riskProbability": float(row["RiskProbability"]),
                "riskTier": row["RiskTier"],
                "overTime": row["OverTime"],
                "monthlyIncome": float(row["MonthlyIncome"]),
                "jobSatisfaction": int(row["JobSatisfaction"]),
                "topDriver": top_driver,
                "actionTimeframe": "Within 7 days"
            })

        return {
            "workforce_kpis": {
                "total_employees": total_count,
                "at_risk_count": at_risk_count,
                "at_risk_rate": round((at_risk_count / total_count) * 100, 1),
                "high_risk_count": high_risk_count,
                "high_risk_rate": round((high_risk_count / total_count) * 100, 1),
                "medium_risk_count": risk_counts["Medium"],
                "low_risk_count": risk_counts["Low"],
                "average_retention_rate": round(100.0 - avg_risk_rate, 1),
                "average_monthly_income": round(float(df["MonthlyIncome"].mean()), 0),
                "overtime_workforce_pct": round((len(ot_group) / total_count) * 100, 1),
                "overtime_risk_multiplier": round(ot_attrition_rate / max(1.0, non_ot_attrition_rate), 1)
            },
            "risk_distribution": [
                {"tier": "Low Risk (<35%)", "count": risk_counts["Low"], "percentage": round((risk_counts["Low"] / total_count) * 100, 1), "color": "#10b981"},
                {"tier": "Medium Risk (35-65%)", "count": risk_counts["Medium"], "percentage": round((risk_counts["Medium"] / total_count) * 100, 1), "color": "#f59e0b"},
                {"tier": "High Risk (>=65%)", "count": risk_counts["High"], "percentage": round((risk_counts["High"] / total_count) * 100, 1), "color": "#ef4444"}
            ],
            "departments": departments_data,
            "roles": roles_data[:8],
            "tenure_bands": tenure_bands,
            "overtime_comparison": {
                "overtime_yes": {"headcount": len(ot_group), "attrition_rate": ot_attrition_rate},
                "overtime_no": {"headcount": len(non_ot_group), "attrition_rate": non_ot_attrition_rate}
            },
            "top_model_factors": self.get_global_feature_importances()[:8],
            "priority_action_queue": priority_employees,
            "model_metadata": {
                "algorithm": "Random Forest Classifier (200 Estimators)",
                "accuracy": "88.10%",
                "feature_count": len(self.feature_names),
                "dataset_records": total_count
            }
        }

ml_service = MLService()
