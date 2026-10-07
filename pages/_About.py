import streamlit as st


st.set_page_config(
    page_title="About | Employee Attrition Intelligence",
    page_icon="HR",
    layout="wide",
)


st.markdown("""
    <style>
        :root {
            --blue: #0f62fe;
            --ink: #161616;
            --muted: #6f6f6f;
            --surface: #ffffff;
            --soft: #f4f4f4;
            --line: #e0e0e0;
        }

        .block-container {
            padding-top: 2rem;
            padding-bottom: 3rem;
            max-width: 1380px;
        }

        .hero {
            background: linear-gradient(110deg, #161616 0%, #262626 56%, #0f62fe 100%);
            color: #ffffff;
            padding: 2.2rem;
            margin-bottom: 1.5rem;
            border-bottom: 4px solid #78a9ff;
        }

        .hero h1 {
            margin: 0;
            font-size: clamp(2rem, 4vw, 4.4rem);
            font-weight: 400;
            letter-spacing: 0;
        }

        .hero p {
            max-width: 850px;
            margin: 0.85rem 0 0;
            color: #f4f4f4;
            font-size: 1.03rem;
            line-height: 1.6;
        }

        .section-title {
            color: var(--ink);
            font-size: 1.35rem;
            font-weight: 700;
            margin: 1.45rem 0 0.65rem;
        }

        .panel {
            background: var(--surface);
            border: 1px solid var(--line);
            border-top: 4px solid var(--blue);
            padding: 1.15rem;
            min-height: 175px;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
        }

        .panel strong {
            display: block;
            color: var(--ink);
            font-size: 1.05rem;
            margin-bottom: 0.45rem;
        }

        .panel span, .copy {
            color: #525252;
            font-size: 0.96rem;
            line-height: 1.55;
        }

        .stat {
            background: var(--soft);
            border-left: 4px solid var(--blue);
            padding: 1rem 1.1rem;
            min-height: 112px;
        }

        .stat small {
            display: block;
            color: var(--muted);
            font-size: 0.82rem;
            margin-bottom: 0.35rem;
        }

        .stat b {
            color: var(--ink);
            font-size: 1.75rem;
        }

        .pill {
            display: inline-block;
            background: #edf5ff;
            color: #0043ce;
            border: 1px solid #78a9ff;
            padding: 0.34rem 0.65rem;
            margin: 0.25rem 0.25rem 0 0;
            font-size: 0.86rem;
        }
    </style>
    """,
    unsafe_allow_html=True,
)


st.markdown(
    """
    <div class="hero">
        <h1>About The Attrition Intelligence Suite</h1>
        <p>
            A premium HR analytics experience for understanding workforce movement, identifying
            retention risk, and supporting better people decisions with machine learning.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)


st.markdown('<div class="section-title">Project Overview</div>', unsafe_allow_html=True)
left, right, third = st.columns(3)

with left:
    st.markdown(
        """
        <div class="panel">
            <strong>Predictive Workforce Risk</strong>
            <span>
                The application estimates whether an employee is likely to leave by evaluating
                personal, job, compensation, satisfaction, travel, and tenure signals.
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

with right:
    st.markdown(
        """
        <div class="panel">
            <strong>Executive Dashboard</strong>
            <span>
                Leaders can inspect attrition rate, employee distribution, role pressure,
                overtime exposure, compensation spread, and department-level risk.
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

with third:
    st.markdown(
        """
        <div class="panel">
            <strong>Action-Oriented Insights</strong>
            <span>
                The product is designed to convert raw HR data into retention conversations,
                focused interventions, and clearer workforce planning.
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )


st.markdown('<div class="section-title">Model Snapshot</div>', unsafe_allow_html=True)
metric1, metric2, metric4 = st.columns(3)

with metric1:
    st.markdown('<div class="stat"><small>Dataset Size</small><b>1,470</b></div>', unsafe_allow_html=True)
with metric2:
    st.markdown('<div class="stat"><small>Input Features</small><b>30</b></div>', unsafe_allow_html=True)
#with metric3:
 #   st.markdown('<div class="stat"><small>Algorithm</small><b>Random Forest</b></div>', unsafe_allow_html=True)
with metric4:
    st.markdown('<div class="stat"><small>Model Accuracy</small><b>88.10%</b></div>', unsafe_allow_html=True)


st.markdown('<div class="section-title">What The System Uses</div>', unsafe_allow_html=True)
st.markdown(
    """
    <div class="copy">
        The prediction engine evaluates a complete employee profile across role, department,
        income, travel frequency, overtime, satisfaction scores, performance, work history,
        salary growth, stock options, and manager tenure.
    </div>
    <div style="margin-top: .75rem;">
        <span class="pill">Demographics</span>
        <span class="pill">Compensation</span>
        <span class="pill">Role and Department</span>
        <span class="pill">Workload</span>
        <span class="pill">Satisfaction</span>
        <span class="pill">Career Growth</span>
        <span class="pill">Tenure</span>
        <span class="pill">Performance</span>
    </div>
    """,
    unsafe_allow_html=True,
)


st.markdown('<div class="section-title">Developed By</div>', unsafe_allow_html=True)
dev1, dev2, dev3 = st.columns(3)

# 1. Added a 3rd list for your unique descriptions/strings
for column, name, role in zip(
    [dev1, dev2, dev3],
    ["Sandeep Padhan", "Smruti Ranjan Sahoo", "Rama Chandra Pradhan"],
    ["Backend Designer", "Frontend Designer", "Database Designer"] # 👈 Change these to your actual strings
):
    with column:
        st.markdown(
            f"""
            <div class="panel" style="min-height: 120px;">
                <strong>{name}</strong>
                <span>{role}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

