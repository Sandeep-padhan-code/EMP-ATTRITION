from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import streamlit as st


st.set_page_config(
    page_title="Prediction | Employee Attrition Intelligence",
    page_icon="HR",
    layout="wide",
)


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "dataset" / "archive" / "employee_attrition.csv"
MODEL_PATH = ROOT / "models" / "employee_attrition_model.pkl"
ENCODER_PATH = ROOT / "models" / "encoders.pkl"


@st.cache_resource
def load_artifacts():
    return joblib.load(MODEL_PATH), joblib.load(ENCODER_PATH)


@st.cache_data
def load_data() -> pd.DataFrame:
    frame = pd.read_csv(DATA_PATH)
    frame["EmployeeName"] = "Employee " + frame["EmployeeNumber"].astype(str)
    return frame


model, encoders = load_artifacts()
df = load_data()
feature_names = list(model.feature_names_in_)


def encode_value(column: str, value) -> int:
    return int(encoders[column].transform([str(value)])[0])


def build_model_input(employee: pd.Series) -> pd.DataFrame:
    values = {}
    for column in feature_names:
        if column in encoders:
            values[column] = encode_value(column, employee[column])
        else:
            values[column] = employee[column]
    return pd.DataFrame([[values[column] for column in feature_names]], columns=feature_names)


def rate(value: float) -> str:
    return f"{value:.1f}%"


def satisfaction_status(employee: pd.Series) -> tuple[str, str, str, float]:
    satisfaction_score = float(
        np.mean(
            [
                employee["EnvironmentSatisfaction"],
                employee["JobSatisfaction"],
                employee["RelationshipSatisfaction"],
                employee["WorkLifeBalance"],
            ]
        )
    )

    if satisfaction_score >= 3.25:
        return "🟢", "Happy", "#24a148", satisfaction_score
    if satisfaction_score >= 2.4:
        return "🟡", "Neutral", "#f1c21b", satisfaction_score
    return "🔴", "Unhappy", "#da1e28", satisfaction_score


def unique_suggestions(employee: pd.Series, attrition_probability: float) -> list[str]:
    suggestions = []

    if employee["OverTime"] == "Yes":
        suggestions.append("Reduce overtime pressure with workload balancing or short-term staffing support.")
    if employee["JobSatisfaction"] <= 2:
        suggestions.append("Schedule a manager check-in focused on role fit, blockers, and day-to-day work quality.")
    if employee["EnvironmentSatisfaction"] <= 2:
        suggestions.append("Review team environment signals and resolve workspace, process, or collaboration friction.")
    if employee["WorkLifeBalance"] <= 2:
        suggestions.append("Offer flexible scheduling or workload redesign to improve work-life balance.")
    if employee["YearsSinceLastPromotion"] >= 3:
        suggestions.append("Discuss promotion readiness, role expansion, or a visible growth path.")
    if employee["PercentSalaryHike"] <= 12:
        suggestions.append("Review compensation movement against performance, market range, and peer benchmarks.")
    if employee["DistanceFromHome"] >= 15:
        suggestions.append("Consider hybrid flexibility or commute support because distance from home is high.")
    if employee["YearsWithCurrManager"] <= 1 and employee["YearsAtCompany"] > 2:
        suggestions.append("Strengthen manager connection with a structured 30-60-90 day engagement plan.")
    if employee["TrainingTimesLastYear"] <= 1:
        suggestions.append("Assign targeted learning opportunities to improve growth visibility and engagement.")
    if attrition_probability >= 65:
        suggestions.append("Create a retention action plan within the next 7 days and track progress monthly.")
    elif attrition_probability >= 35:
        suggestions.append("Monitor this employee quarterly and address the top two pressure signals first.")
    else:
        suggestions.append("Maintain the current engagement rhythm and reinforce career-growth conversations.")

    unique = []
    for suggestion in suggestions:
        if suggestion not in unique:
            unique.append(suggestion)
    return unique[:5]


st.markdown(
    """
    <style>
        :root {
            --blue: #0f62fe;
            --ink: #161616;
            --muted: #6f6f6f;
            --surface: #ffffff;
            --soft: #f4f4f4;
            --line: #e0e0e0;
            --green: #24a148;
            --red: #da1e28;
        }

        .block-container {
            padding-top: 2rem;
            padding-bottom: 3rem;
            max-width: 1320px;
        }

        .hero {
            background: linear-gradient(110deg, #161616 0%, #262626 58%, #0f62fe 100%);
            color: #ffffff;
            padding: 2rem;
            margin-bottom: 1.25rem;
            border-bottom: 4px solid #78a9ff;
        }

        .hero h1 {
            margin: 0;
            font-size: clamp(2rem, 4vw, 4.3rem);
            font-weight: 400;
            letter-spacing: 0;
        }

        .hero p {
            max-width: 780px;
            margin: 0.8rem 0 0;
            color: #f4f4f4;
            font-size: 1rem;
            line-height: 1.55;
        }

        .section-title {
            color: var(--ink);
            font-size: 1.25rem;
            font-weight: 700;
            margin: 1.15rem 0 0.55rem;
        }

        .lookup-panel, .profile-panel, .result-panel {
            background: var(--surface);
            border: 1px solid var(--line);
            border-top: 4px solid var(--blue);
            padding: 1.15rem;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
        }

        .profile-panel {
            min-height: 118px;
        }

        .profile-panel small, .result-panel small {
            display: block;
            color: var(--muted);
            font-size: 0.82rem;
            margin-bottom: 0.3rem;
        }

        .profile-panel b {
            color: var(--ink);
            font-size: 1.2rem;
        }

        .face-panel {
            background: var(--surface);
            border: 1px solid var(--line);
            border-top: 4px solid #f1c21b;
            padding: 1.15rem;
            min-height: 170px;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
        }

        .face-panel .face {
            font-size: 2.45rem;
            line-height: 1;
            margin-bottom: 0.55rem;
        }

        .face-panel b {
            display: block;
            color: var(--ink);
            font-size: 1.55rem;
        }

        .face-panel span {
            display: block;
            color: #525252;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-top: 0.35rem;
        }

        .result-panel b {
            color: var(--ink);
            font-size: 2rem;
        }

        .result-panel span {
            display: block;
            color: #525252;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-top: 0.45rem;
        }

        div[data-testid="stMetric"] {
            background: var(--surface);
            border: 1px solid var(--line);
            border-top: 4px solid var(--blue);
            padding: 1rem 1.05rem;
            min-height: 118px;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
        }

        div[data-testid="stMetricValue"] {
            color: var(--ink);
            font-size: 1.85rem;
            font-weight: 700;
        }

        div[data-testid="stMetric"] label {
            color: var(--muted);
            font-size: 0.86rem;
            letter-spacing: 0;
        }

        .stButton > button {
            background: var(--blue);
            color: #ffffff;
            border: none;
            border-radius: 0;
            min-height: 3rem;
            font-weight: 700;
        }

        .suggestion {
            background: #f4f4f4;
            border-left: 4px solid var(--blue);
            color: #393939;
            padding: 0.85rem 1rem;
            margin-bottom: 0.65rem;
            line-height: 1.5;
            font-size: 0.96rem;
        }
    </style>
    """,
    unsafe_allow_html=True,
)


st.markdown(
    """
    <div class="hero">
        <h1>Employee Attrition Prediction</h1>
        <p>
            Search an employee by ID, fetch the profile directly from the HR dataset,
            and generate a focused attrition-risk assessment.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)


st.sidebar.header("Prediction Console")
st.sidebar.metric("Accuracy", "88.10%")
st.sidebar.metric("Dataset Employees", f"{len(df):,}")
st.sidebar.metric("Model Features", f"{len(feature_names)}")
st.sidebar.caption("Lookup uses EmployeeNumber from the dataset.")


st.markdown('<div class="section-title">Employee Lookup</div>', unsafe_allow_html=True)
st.markdown('<div class="lookup-panel">', unsafe_allow_html=True)

with st.form("employee_lookup_form"):
    name_col, id_col, action_col = st.columns([1.3, 1, 1])
    with name_col:
        employee_name = st.text_input("Employee Name", placeholder="Enter employee name")
    with id_col:
        employee_id = st.number_input(
            "Employee ID",
            min_value=int(df["EmployeeNumber"].min()),
            max_value=int(df["EmployeeNumber"].max()),
            value=int(df["EmployeeNumber"].min()),
            step=1,
        )
    with action_col:
        st.write("")
        submitted = st.form_submit_button("Generate Attrition Assessment", width="stretch")

st.markdown("</div>", unsafe_allow_html=True)


if not submitted:
    st.info("Enter an employee name and employee ID, then generate the assessment.")
    st.dataframe(
        df[["EmployeeName", "EmployeeNumber", "Department", "JobRole", "Attrition"]]
        .head(8)
        .rename(columns={"EmployeeNumber": "Employee ID"}),
        width="stretch",
        hide_index=True,
    )
    st.stop()


matches = df[df["EmployeeNumber"].astype(int) == int(employee_id)]

if matches.empty:
    st.error("No employee found with that Employee ID. Please check the ID and try again.")
    st.stop()


employee = matches.iloc[0]
display_name = employee_name.strip() or employee["EmployeeName"]
model_input = build_model_input(employee)
prediction = int(model.predict(model_input)[0])
probability = model.predict_proba(model_input)[0] if hasattr(model, "predict_proba") else np.array([0.0, 0.0])
attrition_probability = float(probability[1]) * 100
retention_probability = 100 - attrition_probability
face_emoji, satisfaction_label, face_color, satisfaction_score = satisfaction_status(employee)
suggestions = unique_suggestions(employee, attrition_probability)

if prediction == 1:
    outcome = "High Attrition Risk"
    color = "#da1e28"
    guidance = "Prioritize a retention conversation and review workload, compensation, growth, and manager-tenure signals."
else:
    outcome = "Likely To Stay"
    color = "#24a148"
    guidance = "The current profile trends toward retention. Continue monitoring satisfaction, workload, and career-growth signals."


st.markdown('<div class="section-title">Assessment Result</div>', unsafe_allow_html=True)
result_col, face_col, prob_col, retain_col = st.columns([1.35, 1, 1, 1])

with result_col:
    st.markdown(
        f"""
        <div class="result-panel" style="border-top-color: {color};">
            <small>{display_name} | Employee ID {int(employee['EmployeeNumber'])}</small>
            <b>{outcome}</b>
            <span>{guidance}</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

with face_col:
    st.markdown(
        f"""
        <div class="face-panel" style="border-top-color: {face_color};">
            <div class="face">{face_emoji}</div>
            <b>{satisfaction_label}</b>
            <span>Satisfaction score {satisfaction_score:.1f} out of 4.0</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

with prob_col:
    st.metric("Attrition Probability", rate(attrition_probability))

with retain_col:
    st.metric("Retention Probability", rate(retention_probability))


st.markdown('<div class="section-title">Unique Suggestions</div>', unsafe_allow_html=True)
for suggestion in suggestions:
    st.markdown(f'<div class="suggestion">{suggestion}</div>', unsafe_allow_html=True)


st.markdown('<div class="section-title">Fetched Employee Profile</div>', unsafe_allow_html=True)
p1, p2, p3, p4 = st.columns(4)

profile_items = [
    (p1, "Department", employee["Department"]),
    (p2, "Job Role", employee["JobRole"]),
    (p3, "Monthly Income", f"${employee['MonthlyIncome']:,.0f}"),
    (p4, "OverTime", employee["OverTime"]),
]

for column, label, value in profile_items:
    with column:
        st.markdown(
            f"""
            <div class="profile-panel">
                <small>{label}</small>
                <b>{value}</b>
            </div>
            """,
            unsafe_allow_html=True,
        )


detail_left, detail_right = st.columns([1, 1])

with detail_left:
    st.markdown('<div class="section-title">Work And Tenure</div>', unsafe_allow_html=True)
    st.dataframe(
        pd.DataFrame(
            [
                ["Age", employee["Age"]],
                ["Business Travel", employee["BusinessTravel"]],
                ["Distance From Home", employee["DistanceFromHome"]],
                ["Total Working Years", employee["TotalWorkingYears"]],
                ["Years At Company", employee["YearsAtCompany"]],
                ["Years In Current Role", employee["YearsInCurrentRole"]],
                ["Years With Current Manager", employee["YearsWithCurrManager"]],
            ],
            columns=["Signal", "Value"],
        ),
        width="stretch",
        hide_index=True,
    )

with detail_right:
    st.markdown('<div class="section-title">Satisfaction And Growth</div>', unsafe_allow_html=True)
    st.dataframe(
        pd.DataFrame(
            [
                ["Environment Satisfaction", employee["EnvironmentSatisfaction"]],
                ["Job Satisfaction", employee["JobSatisfaction"]],
                ["Work Life Balance", employee["WorkLifeBalance"]],
                ["Relationship Satisfaction", employee["RelationshipSatisfaction"]],
                ["Percent Salary Hike", f"{employee['PercentSalaryHike']}%"],
                ["Performance Rating", employee["PerformanceRating"]],
                ["Historical Attrition", employee["Attrition"]],
            ],
            columns=["Signal", "Value"],
        ),
        width="stretch",
        hide_index=True,
    )
