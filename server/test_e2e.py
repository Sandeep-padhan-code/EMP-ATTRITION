import sys
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def run_e2e_tests():
    print("=== 1. HEALTH CHECK ===")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("Health OK:", res.json())

    print("\n=== 2. HR AUTHENTICATION ===")
    hr_login = client.post("/api/auth/login", json={"email": "hr@acme-corp.internal", "password": "admin123"})
    assert hr_login.status_code == 200, hr_login.text
    hr_token = hr_login.json()["token"]
    hr_user = hr_login.json()["user"]
    print("HR Logged in as:", hr_user["name"], "| Role:", hr_user["role"])

    hr_headers = {"Authorization": f"Bearer {hr_token}"}

    print("\n=== 3. WORKFORCE OVERVIEW KPIS ===")
    overview = client.get("/api/analytics/overview", headers=hr_headers)
    assert overview.status_code == 200
    data = overview.json()
    kpis = data["workforce_kpis"]
    print("Total Employees:", kpis["total_employees"])
    print("At-Risk Count:", kpis["at_risk_count"], f"({kpis['at_risk_rate']}%)")
    print("High-Risk Count:", kpis["high_risk_count"], f"({kpis['high_risk_rate']}%)")
    print("Retention Rate:", kpis["average_retention_rate"], "%")
    print("Overtime Risk Multiplier:", kpis["overtime_risk_multiplier"], "x")
    print("Top Factor 1:", data["top_model_factors"][0]["feature"], f"({data['top_model_factors'][0]['importance']}%)")

    print("\n=== 4. EMPLOYEE DIRECTORY & PAGINATION ===")
    paged = client.get("/api/employees?page=1&page_size=5&sort_by=riskProbability&sort_order=desc", headers=hr_headers)
    assert paged.status_code == 200
    paged_data = paged.json()
    print("Total in Dataset:", paged_data["pagination"]["total"])
    print("Top High-Risk Employee 1:", paged_data["employees"][0]["name"], "| Risk:", paged_data["employees"][0]["riskProbability"], "%")

    print("\n=== 5. EMPLOYEE DETAIL & ML FACTORS ===")
    emp_id = paged_data["employees"][0]["id"]
    detail = client.get(f"/api/employees/{emp_id}", headers=hr_headers)
    assert detail.status_code == 200
    emp_data = detail.json()["employee"]
    print("Employee Profile Loaded:", emp_data["name"], "| Role:", emp_data["jobRole"])
    print("Prediction Tier:", emp_data["prediction"]["risk_tier"])
    print("Contributing Factors Count:", len(emp_data["prediction"]["contributing_factors"]))
    for f in emp_data["prediction"]["contributing_factors"][:2]:
        print("  - Factor:", f["factor"], "| Signal:", f["signal_strength"], "| Benchmark:", f["benchmark"])

    print("\n=== 6. HR -> EMPLOYEE OUTREACH MESSAGING ===")
    msg_res = client.post("/api/messages", json={
        "recipient_employee_number": emp_id,
        "content": "Hi, I would like to schedule a 15-minute touchpoint this Thursday regarding your workload.",
        "category": "Workload Balancing",
        "title": f"Retention Outreach with {emp_data['name']}"
    }, headers=hr_headers)
    assert msg_res.status_code == 200, msg_res.text
    conv_id = msg_res.json()["conversation_id"]
    print("Message dispatched. Conversation ID:", conv_id)

    print("\n=== 7. EMPLOYEE AUTHENTICATION & PROFILE ===")
    emp_login = client.post("/api/auth/login", json={"email": "employee1@acme-corp.internal", "password": "password123"})
    assert emp_login.status_code == 200, emp_login.text
    emp_token = emp_login.json()["token"]
    emp_user = emp_login.json()["user"]
    print("Employee Logged in as:", emp_user["name"], "| Role:", emp_user["role"])
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    emp_profile = client.get("/api/employees/me", headers=emp_headers)
    assert emp_profile.status_code == 200
    print("Employee personal profile safe view:", emp_profile.json()["profile"]["name"], "| Dept:", emp_profile.json()["profile"]["department"])

    print("\n=== 8. RBAC AUTHORIZATION ENFORCEMENT ===")
    forbidden1 = client.get("/api/employees", headers=emp_headers)
    print("Employee accessing /api/employees -> HTTP Status:", forbidden1.status_code, "(Expected 403)")
    assert forbidden1.status_code == 403

    forbidden2 = client.get("/api/analytics/overview", headers=emp_headers)
    print("Employee accessing /api/analytics/overview -> HTTP Status:", forbidden2.status_code, "(Expected 403)")
    assert forbidden2.status_code == 403

    forbidden3 = client.get("/api/reports/summary", headers=emp_headers)
    print("Employee accessing /api/reports/summary -> HTTP Status:", forbidden3.status_code, "(Expected 403)")
    assert forbidden3.status_code == 403

    print("\n=== 9. EMPLOYEE NOTIFICATIONS & REPLY ===")
    notifs = client.get("/api/notifications", headers=emp_headers)
    assert notifs.status_code == 200
    print("Employee unread notifications:", notifs.json()["unread_count"])

    emp_reply = client.post("/api/messages", json={
        "conversation_id": conv_id,
        "content": "Thursday at 2 PM works great for me. Thanks for checking in.",
        "category": "Employee Reply"
    }, headers=emp_headers)
    assert emp_reply.status_code == 200
    print("Employee reply sent successfully.")

    print("\n=== 10. EMPLOYEE CONFIDENTIAL FEEDBACK ===")
    fb_res = client.post("/api/feedback", json={
        "category": "Workload & Cadence",
        "sentiment": "Neutral",
        "message": "Sprint velocity has been high recently, looking forward to resource balancing.",
        "is_anonymous": True
    }, headers=emp_headers)
    assert fb_res.status_code == 200
    print("Confidential feedback submitted:", fb_res.json()["message"])

    print("\n=== 11. HR REPORTS & CSV EXPORT ===")
    rep_res = client.get("/api/reports/summary", headers=hr_headers)
    assert rep_res.status_code == 200
    print("Report Summary Generated. Executive takeaways count:", len(rep_res.json()["executive_takeaways"]))

    csv_res = client.get("/api/reports/export-csv", headers=hr_headers)
    assert csv_res.status_code == 200
    csv_lines = csv_res.text.strip().split("\n")
    print("CSV Export generated. Total rows exported:", len(csv_lines))

    print("\n>>> ALL 11 END-TO-END INTEGRATION TEST SUITES PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    run_e2e_tests()
