"""Phase 11 — analysis and prediction endpoints."""

from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException, status

from ..ml.academic_intelligence_engine import analyze_single_student
from ..ml.capacity_engine import CapacityInputError, calculate_student_capacity
from ..ml.class_analysis import analyze_class
from ..ml.config import METRICS_PATH
from ..ml.prediction.predictor import (
    ModelNotAvailable,
    models_available,
    predict_completion_time,
    predict_deadline_risk,
)
from ..schemas.analysis import (
    CapacityRequest,
    CapacityResult,
    ClassAnalysisRequest,
    ClassAnalysisResult,
    CompletionPrediction,
    ModelInfo,
    RiskPrediction,
    SingleAnalysisRequest,
    StudentAnalysis,
)

router = APIRouter(prefix="/api", tags=["analysis"])

DISCLAIMER = (
    "Models are trained on synthetic data generated from realistic academic workload "
    "relationships. They demonstrate the architecture and prediction pipeline. Real-world "
    "deployment requires historical student assignment and submission data for validation "
    "and retraining. Outputs are decision support for teachers, not automated decisions."
)


def _features(student, assignment) -> dict:
    """Flatten the request models into the feature record the models expect."""
    return {
        "subject": assignment.subject,
        "assignment_type": assignment.assignment_type,
        "difficulty": assignment.difficulty,
        "teacher_estimated_hours": assignment.teacher_estimated_hours,
        "hours_until_deadline": assignment.hours_until_deadline,
        "available_hours": student.available_hours,
        "existing_pending_hours": student.existing_pending_hours,
        "number_of_pending_assignments": student.number_of_pending_assignments,
        "previous_completion_rate": student.previous_completion_rate,
        "previous_late_submissions": student.previous_late_submissions,
        "average_previous_completion_hours": student.average_previous_completion_hours,
    }


@router.post("/analyze/student", response_model=StudentAnalysis, summary="Analyse one student")
def analyze_student_endpoint(payload: SingleAnalysisRequest) -> StudentAnalysis:
    """Run the full hybrid analysis for a single student.

    Used by the student dashboard to show predicted completion time, capacity
    status, deadline risk and the resulting recommendation.
    """
    try:
        result = analyze_single_student(
            student=payload.student.model_dump(),
            assignment=payload.assignment.model_dump(),
        )
    except CapacityInputError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return StudentAnalysis(**result)


@router.post("/analyze/class", response_model=ClassAnalysisResult, summary="Analyse a whole class")
def analyze_class_endpoint(payload: ClassAnalysisRequest) -> ClassAnalysisResult:
    """Analyse every student against a proposed assignment.

    This backs the teacher's 'Analyze Student Capacity' step: the counts, the
    per-student table sorted worst-first, and the class-level recommendation.
    """
    try:
        result = analyze_class(
            students=[s.model_dump() for s in payload.students],
            assignment=payload.assignment.model_dump(),
        )
    except CapacityInputError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return ClassAnalysisResult(**result)


@router.post("/predict/completion-time", response_model=CompletionPrediction)
def predict_completion_endpoint(payload: SingleAnalysisRequest) -> CompletionPrediction:
    """Predict how long this student will need for this assignment."""
    try:
        hours = predict_completion_time(_features(payload.student, payload.assignment))
    except ModelNotAvailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc

    estimated = payload.assignment.teacher_estimated_hours
    return CompletionPrediction(
        predicted_completion_hours=hours,
        teacher_estimated_hours=estimated,
        difference_hours=round(hours - estimated, 2),
    )


@router.post("/predict/deadline-risk", response_model=RiskPrediction)
def predict_risk_endpoint(payload: SingleAnalysisRequest) -> RiskPrediction:
    """Predict the probability that this student submits late."""
    try:
        result = predict_deadline_risk(_features(payload.student, payload.assignment))
    except ModelNotAvailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    return RiskPrediction(**result)


@router.post("/capacity", response_model=CapacityResult, summary="Rule-based capacity only")
def capacity_endpoint(payload: CapacityRequest) -> CapacityResult:
    """Run the capacity arithmetic with no ML involved.

    Kept as its own endpoint because it works with zero trained artefacts and is
    the transparent fallback the product can always explain.
    """
    try:
        result = calculate_student_capacity(
            student_id=payload.student_id,
            available_hours=payload.available_hours,
            existing_pending_hours=payload.existing_pending_hours,
            new_assignment_hours=payload.new_assignment_hours,
        )
    except CapacityInputError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return CapacityResult(**result.to_dict())


@router.get("/models/info", response_model=ModelInfo, summary="Reported model performance")
def model_info_endpoint() -> ModelInfo:
    """Phase 13 — the real, measured metrics from the last training run.

    Values are read from the artefact written by the training scripts. Nothing
    here is hand-written, so the number shown in the UI is the number measured.
    """
    if not METRICS_PATH.exists():
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "No metrics recorded yet. Run the training modules first.",
        )
    metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    return ModelInfo(
        completion_model=metrics.get("completion_model"),
        deadline_model=metrics.get("deadline_model"),
        data_source=metrics.get("data_source", "synthetic"),
        disclaimer=DISCLAIMER,
    )


@router.get("/health", summary="Service and artefact health")
def health_endpoint() -> dict:
    """Report whether the ML artefacts are loadable, for the frontend to branch on."""
    available = models_available()
    return {
        "status": "ok",
        "models": available,
        "ml_enabled": all(available.values()),
        "note": None if all(available.values()) else "Running in rule-only mode.",
    }
