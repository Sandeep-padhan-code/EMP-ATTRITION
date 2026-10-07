from pathlib import Path

import matplotlib
import pandas as pd
import streamlit as st


matplotlib.use("Agg")
import matplotlib.pyplot as plt

st.set_page_config(page_title="Dashboard", page_icon="📊", layout="wide")


DATA_PATH = Path(__file__).resolve().parents[1] / "dataset" / "archive" / "employee_attrition.csv"


@st.cache_data
def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["AttritionLabel"] = df["Attrition"].astype(str).str.strip()
    df["Attrition"] = df["AttritionLabel"].map({"Yes": 1, "No": 0}).fillna(df["AttritionLabel"])
    df["Attrition"] = pd.to_numeric(df["Attrition"], errors="coerce").fillna(0).astype(int)
    return df


def money(value: float) -> str:
    return f"${value:,.0f}"


def rate(value: float) -> str:
    return f"{value:.1f}%"


def attrition_rate(frame: pd.DataFrame) -> float:
    if frame.empty:
        return 0.0
    return frame["Attrition"].mean() * 100


def carbon_bar(data: pd.Series, title: str, xlabel: str, color: str = "#0f62fe"):
    fig, ax = plt.subplots(figsize=(7, 4), facecolor="#ffffff")
    data.sort_values().plot(kind="barh", ax=ax, color=color, width=0.72)
    ax.set_title(title, loc="left", fontsize=13, fontweight="bold", pad=14)
    ax.set_xlabel(xlabel)
    ax.set_ylabel("")
    ax.grid(axis="x", color="#e0e0e0", linewidth=0.8)
    ax.set_axisbelow(True)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.tick_params(colors="#393939", labelsize=10)
    fig.tight_layout()
    return fig


def donut(labels, values, colors, title: str):
    fig, ax = plt.subplots(figsize=(5, 4), facecolor="#ffffff")
    wedges, _ = ax.pie(
        values,
        colors=colors,
        startangle=90,
        counterclock=False,
        wedgeprops={"width": 0.42, "edgecolor": "white", "linewidth": 3},
    )
    ax.legend(wedges, labels, loc="center left", bbox_to_anchor=(0.88, 0.5), frameon=False)
    ax.set_title(title, loc="left", fontsize=13, fontweight="bold", pad=14)
    ax.set(aspect="equal")
    fig.tight_layout()
    return fig


df = load_data()


st.markdown(
    """
    <style>
        :root {
            --ibm-blue: #0f62fe;
            --ink: #161616;
            --muted: #6f6f6f;
            --surface: #ffffff;
            --line: #e0e0e0;
        }

        .block-container {
            padding-top: 2rem;
            padding-bottom: 3rem;
            max-width: 1400px;
        }

        div[data-testid="stMetric"] {
            background: var(--surface);
            border: 1px solid var(--line);
            border-top: 4px solid var(--ibm-blue);
            padding: 1.05rem 1.1rem;
            min-height: 132px;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
        }

        div[data-testid="stMetric"] label {
            color: var(--muted);
            font-size: 0.86rem;
            letter-spacing: 0;
        }

        div[data-testid="stMetricValue"] {
            color: var(--ink);
            font-size: 2rem;
            font-weight: 700;
        }

        .hero {
            background: linear-gradient(110deg, #161616 0%, #262626 55%, #0f62fe 100%);
            color: white;
            padding: 2rem;
            margin-bottom: 1.4rem;
            border-bottom: 4px solid #78a9ff;
        }

        .hero h1 {
            margin: 0;
            font-size: clamp(2rem, 4vw, 4.6rem);
            font-weight: 400;
            letter-spacing: 0;
        }

        .hero p {
            max-width: 780px;
            margin: 0.85rem 0 0;
            color: #f4f4f4;
            font-size: 1.03rem;
            line-height: 1.55;
        }

        .section-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--ink);
            margin: 1.35rem 0 0.5rem;
        }

        .insight {
            background: #f4f4f4;
            border-left: 4px solid var(--ibm-blue);
            padding: 1rem 1.15rem;
            min-height: 122px;
        }

        .insight strong {
            display: block;
            color: var(--ink);
            font-size: 1rem;
            margin-bottom: 0.35rem;
        }

        .insight span {
            color: #525252;
            font-size: 0.94rem;
            line-height: 1.5;
        }

        .stDataFrame {
            border: 1px solid var(--line);
        }
    </style>
    """,
    unsafe_allow_html=True,
)


st.markdown(
    """
    <div class="hero">
        <h1>HR Attrition Command Center</h1>
        <p>
            Executive view of workforce retention, compensation patterns, employee risk segments,
            and department-level attrition signals.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)


st.sidebar.header("Dashboard Controls")
departments = sorted(df["Department"].dropna().unique())
genders = sorted(df["Gender"].dropna().unique())
travel_types = sorted(df["BusinessTravel"].dropna().unique())

selected_departments = st.sidebar.multiselect("Department", departments, default=departments)
selected_genders = st.sidebar.multiselect("Gender", genders, default=genders)
selected_travel = st.sidebar.multiselect("Business Travel", travel_types, default=travel_types)
income_min, income_max = int(df["MonthlyIncome"].min()), int(df["MonthlyIncome"].max())
selected_income = st.sidebar.slider("Monthly Income", income_min, income_max, (income_min, income_max))

filtered = df[
    df["Department"].isin(selected_departments)
    & df["Gender"].isin(selected_genders)
    & df["BusinessTravel"].isin(selected_travel)
    & df["MonthlyIncome"].between(selected_income[0], selected_income[1])
].copy()

if filtered.empty:
    st.warning("No employees match the current filters. Adjust the dashboard controls to restore results.")
    st.stop()

total_employees = len(filtered)
employees_left = int(filtered["Attrition"].sum())
employees_stayed = total_employees - employees_left
filtered_attrition = attrition_rate(filtered)
overall_attrition = attrition_rate(df)
retention_rate = 100 - filtered_attrition
avg_income = filtered["MonthlyIncome"].mean()
avg_age = filtered["Age"].mean()
overtime_attrition = attrition_rate(filtered[filtered["OverTime"] == "Yes"]) if "OverTime" in filtered else 0


kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
kpi1.metric("Employees", f"{total_employees:,}", f"{total_employees - len(df):+,} vs full data")
kpi2.metric("Attrition Rate", rate(filtered_attrition), f"{filtered_attrition - overall_attrition:+.1f} pts")
kpi3.metric("Retention Rate", rate(retention_rate), f"{employees_stayed:,} retained")
kpi4.metric("Avg Monthly Income", money(avg_income), f"Age {avg_age:.1f} avg")
kpi5.metric("Overtime Attrition", rate(overtime_attrition), "OverTime = Yes")


st.markdown('<div class="section-title">Executive Signals</div>', unsafe_allow_html=True)

dept_rates = filtered.groupby("Department").apply(attrition_rate).sort_values(ascending=False)
role_rates = filtered.groupby("JobRole").apply(attrition_rate).sort_values(ascending=False)
travel_rates = filtered.groupby("BusinessTravel").apply(attrition_rate).sort_values(ascending=False)

signal1, signal2, signal3 = st.columns(3)
with signal1:
    st.markdown(
        f"""
        <div class="insight">
            <strong>Highest department risk</strong>
            <span>{dept_rates.index[0]} leads the current view at {rate(dept_rates.iloc[0])} attrition.</span>
        </div>
        """,
        unsafe_allow_html=True,
    )
with signal2:
    st.markdown(
        f"""
        <div class="insight">
            <strong>Most exposed job role</strong>
            <span>{role_rates.index[0]} shows the strongest attrition signal at {rate(role_rates.iloc[0])}.</span>
        </div>
        """,
        unsafe_allow_html=True,
    )
with signal3:
    st.markdown(
        f"""
        <div class="insight">
            <strong>Travel pattern pressure</strong>
            <span>{travel_rates.index[0]} employees are tracking at {rate(travel_rates.iloc[0])} attrition.</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


st.markdown('<div class="section-title">Workforce Overview</div>', unsafe_allow_html=True)
left, right = st.columns([1, 1])

with left:
    st.pyplot(
        donut(
            ["Stayed", "Left"],
            [employees_stayed, employees_left],
            ["#24a148", "#da1e28"],
            "Attrition Mix",
        )
    )

with right:
    dept_counts = filtered["Department"].value_counts()
    st.pyplot(carbon_bar(dept_counts, "Employee Distribution by Department", "Employees", "#0f62fe"))


st.markdown('<div class="section-title">Risk Analytics</div>', unsafe_allow_html=True)
risk_left, risk_right = st.columns(2)

with risk_left:
    st.pyplot(carbon_bar(dept_rates, "Attrition Rate by Department", "Attrition Rate (%)", "#da1e28"))

with risk_right:
    role_top = role_rates.head(8)
    st.pyplot(carbon_bar(role_top, "Top Role Attrition Signals", "Attrition Rate (%)", "#8a3ffc"))


st.markdown('<div class="section-title">People Drivers</div>', unsafe_allow_html=True)
driver1, driver2, driver3 = st.columns(3)

with driver1:
    income_by_attrition = filtered.groupby("AttritionLabel")["MonthlyIncome"].mean().reindex(["No", "Yes"]).dropna()
    st.pyplot(carbon_bar(income_by_attrition, "Average Income by Outcome", "Monthly Income", "#1192e8"))

with driver2:
    overtime_counts = pd.crosstab(filtered["OverTime"], filtered["AttritionLabel"])
    overtime_counts = overtime_counts.reindex(columns=["No", "Yes"], fill_value=0)
    st.bar_chart(overtime_counts, width="stretch")

with driver3:
    age_bins = pd.cut(filtered["Age"], bins=[17, 25, 35, 45, 55, 65], labels=["18-25", "26-35", "36-45", "46-55", "56+"])
    age_rates = filtered.assign(AgeBand=age_bins).groupby("AgeBand", observed=False).apply(attrition_rate)
    st.pyplot(carbon_bar(age_rates, "Attrition by Age Band", "Attrition Rate (%)", "#fa4d56"))


st.markdown('<div class="section-title">Compensation Distribution</div>', unsafe_allow_html=True)
fig, ax = plt.subplots(figsize=(12, 4.2), facecolor="#ffffff")
ax.hist(filtered["MonthlyIncome"], bins=24, color="#0f62fe", edgecolor="white")
ax.axvline(avg_income, color="#da1e28", linewidth=2, label=f"Average {money(avg_income)}")
ax.set_title("Monthly Income Distribution", loc="left", fontsize=13, fontweight="bold", pad=14)
ax.set_xlabel("Monthly Income")
ax.set_ylabel("Employees")
ax.grid(axis="y", color="#e0e0e0", linewidth=0.8)
ax.legend(frameon=False)
for spine in ax.spines.values():
    spine.set_visible(False)
fig.tight_layout()
st.pyplot(fig)


st.markdown('<div class="section-title">Employee Explorer</div>', unsafe_allow_html=True)
display_columns = [
    "Age",
    "Gender",
    "Department",
    "JobRole",
    "BusinessTravel",
    "OverTime",
    "MonthlyIncome",
    "DistanceFromHome",
    "AttritionLabel",
]
st.dataframe(
    filtered[display_columns].rename(columns={"AttritionLabel": "Attrition"}),
    width="stretch",
    hide_index=True,
)
