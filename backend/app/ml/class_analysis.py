"""Phase 9 — whole-class analysis.

Wraps the hybrid engine and aggregates it into the summary a teacher sees before
publishing an assignment: how many students are safe, how many are tight, and
who specifically is in trouble.
"""

from __future__ import annotations

from typing import Any

from .academic_intelligence_engine import analyze_students
from .config import RISK_HIGH, RISK_MODERATE, RISK_SAFE
from .recommendation_engine import summarise_class_recommendation


def analyze_class(
    students: list[dict[str, Any]],
    assignment: dict[str, Any],
    **kwargs: Any,
) -> dict[str, Any]:
    """Analyse an entire class against one proposed assignment.

    Args:
        students: The roster to analyse.
        assignment: The assignment under consideration.
        **kwargs: Passed through to the hybrid engine (thresholds, ``use_ml``).

    Returns:
        A dict with per-band counts, the sorted per-student analyses, a
        class-level recommendation and aggregate statistics.
    """
    analyses = analyze_students(students, assignment, **kwargs)
    total = len(analyses)

    safe = sum(a["overall_status"] == RISK_SAFE for a in analyses)
    moderate = sum(a["overall_status"] == RISK_MODERATE for a in analyses)
    high_risk = sum(a["overall_status"] == RISK_HIGH for a in analyses)

    return {
        "total_students": total,
        "safe_students": safe,
        "moderate_students": moderate,
        "high_risk_students": high_risk,
        "class_recommendation": summarise_class_recommendation(total, safe, moderate, high_risk),
        "statistics": _statistics(analyses, assignment),
        "students": analyses,
    }


def _statistics(analyses: list[dict[str, Any]], assignment: dict[str, Any]) -> dict[str, Any]:
    """Aggregate figures that give the counts context."""
    if not analyses:
        return {}

    predicted = [a["predicted_completion_hours"] for a in analyses]
    probabilities = [a["deadline_risk_probability"] for a in analyses]
    teacher_hours = float(assignment.get("teacher_estimated_hours", 0) or 0)
    mean_predicted = sum(predicted) / len(predicted)

    return {
        "teacher_estimated_hours": round(teacher_hours, 2),
        "mean_predicted_completion_hours": round(mean_predicted, 2),
        "max_predicted_completion_hours": round(max(predicted), 2),
        "min_predicted_completion_hours": round(min(predicted), 2),
        # How far the class as a whole is expected to run past the estimate.
        "mean_overrun_vs_estimate_hours": round(mean_predicted - teacher_hours, 2) if teacher_hours else None,
        "mean_late_probability": round(sum(probabilities) / len(probabilities), 4),
        "students_over_capacity": sum(a["capacity_after_assignment"] < 0 for a in analyses),
        "ml_applied": analyses[0]["ml_applied"],
    }


def top_at_risk(class_result: dict[str, Any], limit: int = 10) -> list[dict[str, Any]]:
    """Return the most at-risk students, already sorted by the engine.

    A compact projection for the table the teacher reads first.
    """
    return [
        {
            "student_id": a["student_id"],
            "student_name": a["student_name"],
            "available_hours": a["available_hours"],
            "existing_workload": a["existing_workload"],
            "predicted_completion_hours": a["predicted_completion_hours"],
            "capacity_after_assignment": a["capacity_after_assignment"],
            "deadline_risk_probability": a["deadline_risk_probability"],
            "deadline_risk": a["deadline_risk"],
            "capacity_status": a["capacity_status"],
            "overall_status": a["overall_status"],
            "recommendation": a["recommendation"],
        }
        for a in class_result.get("students", [])[:limit]
    ]
