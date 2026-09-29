"""Phase 7 — the hybrid academic intelligence engine.

This is where the three components meet. The sequence matters:

    1. work out how much time the student really has before the deadline
    2. work out how much is already committed
    3. ask the regressor how long THIS student will need for THIS work
    4. feed that prediction — not the teacher's flat estimate — into
    5. the rule-based capacity engine
    6. ask the classifier how likely a late submission is
    7. combine both into one status plus a recommendation

Step 4 is the substance of the product. Two students given the same 2-hour task
do not face the same 2 hours, and treating them as if they did is exactly the
blindness the system exists to remove.

The engine degrades safely: if the ML artefacts are missing it falls back to the
teacher's estimate and reports that it did so, because a rule-based capacity
answer is far better than no answer.
"""

from __future__ import annotations

from typing import Any

from .capacity_engine import calculate_student_capacity
from .config import (
    CAPACITY_MODERATE_THRESHOLD,
    CAPACITY_SAFE_THRESHOLD,
    RISK_HIGH,
    RISK_LEVEL_HIGH,
    RISK_LEVEL_LOW,
    RISK_LEVEL_MODERATE,
    RISK_MODERATE,
    RISK_SAFE,
)
from .prediction.predictor import (
    ModelNotAvailable,
    predict_completion_time_batch,
    predict_deadline_risk_batch,
)
from .recommendation_engine import generate_recommendation


def _feature_record(student: dict[str, Any], assignment: dict[str, Any]) -> dict[str, Any]:
    """Assemble the model input row from a student record and the assignment.

    Defaults are chosen to be neutral rather than flattering: a student with no
    recorded history is treated as average, not as reliable.
    """
    return {
        "subject": assignment.get("subject", "Machine Learning"),
        "assignment_type": assignment.get("assignment_type", "Coding"),
        "difficulty": assignment.get("difficulty", "Medium"),
        "teacher_estimated_hours": float(assignment.get("teacher_estimated_hours", 2.0)),
        "available_hours": float(student.get("available_hours", 0.0)),
        "existing_pending_hours": float(student.get("existing_pending_hours", 0.0)),
        "number_of_pending_assignments": int(student.get("number_of_pending_assignments", 0)),
        "hours_until_deadline": float(assignment.get("hours_until_deadline", 24.0)),
        "previous_completion_rate": float(student.get("previous_completion_rate", 0.85)),
        "previous_late_submissions": int(student.get("previous_late_submissions", 0)),
        "average_previous_completion_hours": float(
            student.get("average_previous_completion_hours", 2.0)
        ),
    }


def _combined_status(capacity_status: str, deadline_risk_level: str) -> str:
    """Fuse the rule-based verdict with the modelled risk into one label.

    The two can disagree — a student with time to spare may still have a poor
    submission history. Where they disagree the more pessimistic signal wins,
    because the cost of an unflagged struggling student is higher than the cost
    of a teacher glancing at one extra name.
    """
    if capacity_status == RISK_HIGH or deadline_risk_level == RISK_LEVEL_HIGH:
        return RISK_HIGH
    if capacity_status == RISK_MODERATE or deadline_risk_level == RISK_LEVEL_MODERATE:
        return RISK_MODERATE
    return RISK_SAFE


def analyze_students(
    students: list[dict[str, Any]],
    assignment: dict[str, Any],
    safe_threshold: float = CAPACITY_SAFE_THRESHOLD,
    moderate_threshold: float = CAPACITY_MODERATE_THRESHOLD,
    use_ml: bool = True,
) -> list[dict[str, Any]]:
    """Run the full pipeline for a list of students against one assignment.

    Predictions are batched: one vectorised call per model for the whole class
    rather than one call per student.

    Args:
        students: Roster records with availability, pending work and history.
        assignment: The work being considered, including its estimated hours.
        safe_threshold: Spare-hours cutoff for the SAFE band.
        moderate_threshold: Spare-hours cutoff for the MODERATE band.
        use_ml: When False, skip the models and use the teacher's estimate. Used
            by tests and as the fallback path when artefacts are unavailable.

    Returns:
        One analysis dict per student, sorted worst-first.
    """
    if not students:
        return []

    teacher_hours = float(assignment.get("teacher_estimated_hours", 2.0))
    records = [_feature_record(s, assignment) for s in students]

    ml_used = False
    predicted_hours: list[float] = [teacher_hours] * len(students)
    risks: list[dict[str, Any]] = [{"late_probability": 0.0, "risk_level": RISK_LEVEL_LOW}] * len(students)

    if use_ml:
        try:
            predicted_hours = predict_completion_time_batch(records)
            risks = predict_deadline_risk_batch(records)
            ml_used = True
        except ModelNotAvailable:
            # Rule-based analysis is still worth returning; the caller is told
            # that the ML layer was not applied.
            ml_used = False

    analyses: list[dict[str, Any]] = []

    for student, record, predicted, risk in zip(students, records, predicted_hours, risks):
        capacity = calculate_student_capacity(
            student_id=student["student_id"],
            available_hours=record["available_hours"],
            existing_pending_hours=record["existing_pending_hours"],
            # STEP 4 — the model's estimate for THIS student, not the flat one.
            new_assignment_hours=predicted,
            safe_threshold=safe_threshold,
            moderate_threshold=moderate_threshold,
        )

        recommendation = generate_recommendation(
            capacity_status=capacity.risk_level,
            capacity_after_assignment=capacity.capacity_after_assignment,
            predicted_completion_hours=predicted,
            remaining_capacity=capacity.remaining_capacity,
            deadline_risk_probability=risk["late_probability"],
            deadline_risk_level=risk["risk_level"],
            teacher_estimated_hours=teacher_hours,
        )

        analyses.append(
            {
                "student_id": capacity.student_id,
                "student_name": student.get("student_name", student["student_id"]),
                "teacher_estimated_hours": round(teacher_hours, 2),
                "predicted_completion_hours": predicted,
                "available_hours": capacity.available_hours,
                "existing_workload": capacity.existing_workload,
                "remaining_capacity": capacity.remaining_capacity,
                "capacity_after_assignment": capacity.capacity_after_assignment,
                "capacity_status": capacity.risk_level,
                "deadline_risk_probability": risk["late_probability"],
                "deadline_risk": risk["risk_level"],
                "overall_status": _combined_status(capacity.risk_level, risk["risk_level"]),
                "recommendation": recommendation["recommendation"],
                "severity": recommendation["severity"],
                "reasons": recommendation["reasons"],
                "suggested_actions": recommendation["suggested_actions"],
                "ml_applied": ml_used,
            }
        )

    # Highest risk first: the teacher should meet the problems before the rest.
    analyses.sort(key=lambda a: (-a["deadline_risk_probability"], a["capacity_after_assignment"]))
    return analyses


def analyze_single_student(
    student: dict[str, Any],
    assignment: dict[str, Any],
    **kwargs: Any,
) -> dict[str, Any]:
    """Convenience wrapper for the one-student case used by the student app."""
    results = analyze_students([student], assignment, **kwargs)
    if not results:
        raise ValueError("analysis produced no result for the supplied student")
    return results[0]
