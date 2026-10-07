import streamlit as st

st.set_page_config(
    page_title="Employee Attrition & HR Analytics Dashboard",
    #page_icon="👨‍💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("👨‍💼 Employee Attrition & HR Analytics Dashboard")

st.markdown("""
 Hello User, Welcome to our site. 👋

This project predicts whether an employee is likely to leave the company using Machine Learning.

 Features

- 🤖 Employee Attrition Prediction
- 📊 HR Analytics Dashboard
- 📈 Interactive Charts
- 🔍 Feature Importance
- 💾 Interactive UI

---
Navigation

Use the sidebar to navigate between pages.

⬅️ Dashboard

⬅️ Prediction

⬅️ About

---
""")

col1, col2, col3, col4 = st.columns(4)

col1.metric("Employees", "1472")
#col2.metric("Features", "30")
#col3.metric("Algorithm", "Random Forest")
col4.metric("Accuracy", "88.10%")

#st.success("Project Loaded Successfully ✅")