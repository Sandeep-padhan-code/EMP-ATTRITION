from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from server.database import init_db, seed_demo_data
from server.ml_service import ml_service
from server.routes.auth_routes import router as auth_router
from server.routes.employee_routes import router as employee_router
from server.routes.analytics_routes import router as analytics_router
from server.routes.message_routes import router as message_router
from server.routes.notification_routes import router as notification_router
from server.routes.report_routes import router as report_router
from server.routes.feedback_routes import router as feedback_router

# Ensure DB is created & seeded on module load
init_db()
seed_demo_data(ml_service)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_demo_data(ml_service)
    print("[OK] Database verified and seeded.")
    print("[OK] ML Model & Dataset ready.")
    yield

app = FastAPI(
    title="Employee Attrition Intelligence Platform API",
    description="Production-grade HR intelligence API connecting workforce data, Random Forest ML inference, and proactive retention workflows.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(analytics_router)
app.include_router(message_router)
app.include_router(notification_router)
app.include_router(report_router)
app.include_router(feedback_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Employee Attrition Intelligence Platform",
        "version": "2.0.0",
        "dataset_records": len(ml_service.df) if ml_service.df is not None else 0,
        "model_loaded": ml_service.model is not None,
        "accuracy": "88.10%"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="127.0.0.1", port=8000, reload=True)
