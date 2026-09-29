"""AcadSync AI — FastAPI application entry point.

Serves the hybrid academic intelligence layer to the existing React frontend.

Run:
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import analysis

app = FastAPI(
    title="AcadSync AI",
    description=(
        "Intelligent academic workload management. Combines a transparent rule-based "
        "capacity engine with two ML models (completion time, deadline risk) to give "
        "teachers decision support before they publish an assignment."
    ),
    version="1.0.0",
)

# The Vite dev server runs on 5173; 4173 is `vite preview`.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:4173", "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router)


@app.get("/", tags=["meta"])
def root() -> dict:
    """Point a browser hitting the bare host at the interactive docs."""
    return {
        "service": "AcadSync AI",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "POST /api/analyze/student",
            "POST /api/analyze/class",
            "POST /api/predict/completion-time",
            "POST /api/predict/deadline-risk",
            "POST /api/capacity",
            "GET  /api/models/info",
            "GET  /api/health",
        ],
    }
