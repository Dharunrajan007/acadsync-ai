"""Phase 8 — recommendation engine.

Deliberately rule-based. A second model here would add opacity without adding
information: the inputs are already a capacity number and a probability, and a
teacher needs to be able to see exactly why a recommendation appeared.

The hard product constraint lives here: this module returns advice and nothing
else. It never mutates a deadline, a scope, a mark or a student's workload. The
teacher decides.
"""

from __future__ import annotations

from typing import Any

from .config import (
    RISK_HIGH,
    RISK_LEVEL_HIGH,
    RISK_LEVEL_LOW,
    RISK_LEVEL_MODERATE,
    RISK_MODERATE,
    RISK_MODERATE_MAX,
    RISK_SAFE,
)

# Ordered most to least severe. The first matching rule sets the headline.
SEVERITY = {"critical": 3, "warning": 2, "caution": 1, "positive": 0}


def _rule(code: str, severity: str, message: str, detail: str) -> dict[str, str]:
    return {"code": code, "severity": severity, "message": message, "detail": detail}


def generate_recommendation(
    capacity_status: str,
    capacity_after_assignment: float,
    predicted_completion_hours: float,
    remaining_capacity: float,
    deadline_risk_probability: float,
    deadline_risk_level: str,
    teacher_estimated_hours: float | None = None,
) -> dict[str, Any]:
    """Turn the analysis for one student into teacher-facing advice.

    Args:
        capacity_status: ``SAFE``/``MODERATE``/``HIGH RISK`` from the capacity engine.
        capacity_after_assignment: Spare hours once the new work is included.
        predicted_completion_hours: Model estimate of hours this student needs.
        remaining_capacity: Spare hours before the new work is added.
        deadline_risk_probability: Modelled probability of a late submission.
        deadline_risk_level: ``LOW``/``MODERATE``/``HIGH``.
        teacher_estimated_hours: The teacher's own estimate, used to point out
            when a student is likely to need materially longer than planned.

    Returns:
        A dict with a headline ``recommendation``, the triggered ``reasons``, and
        ``suggested_actions`` the teacher may choose to take — or ignore.
    """
    reasons: list[dict[str, str]] = []

    # CASE 1 — the work does not fit in the time available.
    if capacity_status == RISK_HIGH:
        reasons.append(_rule(
            "CAPACITY_EXCEEDED", "critical",
            "Consider extending the deadline.",
            f"This student is {abs(capacity_after_assignment):.1f} h short: the work does not "
            f"fit in the time they have before the deadline.",
        ))

    # CASE 2 — predicted effort outruns the slack the student actually has.
    if predicted_completion_hours > remaining_capacity:
        reasons.append(_rule(
            "PREDICTION_EXCEEDS_CAPACITY", "warning",
            "Student may not have sufficient capacity.",
            f"Predicted completion is {predicted_completion_hours:.1f} h against "
            f"{remaining_capacity:.1f} h of free time before the deadline.",
        ))

    # CASE 3 — the classifier considers late submission more likely than not.
    if deadline_risk_probability > RISK_MODERATE_MAX:
        reasons.append(_rule(
            "HIGH_LATE_PROBABILITY", "warning",
            "High probability of late submission.",
            f"Modelled late-submission probability is {deadline_risk_probability:.0%}, "
            f"based on this student's availability, pending work and submission history.",
        ))

    # Supporting observation: the estimate itself may be optimistic for this student.
    if teacher_estimated_hours and predicted_completion_hours > teacher_estimated_hours * 1.3:
        overrun = predicted_completion_hours - teacher_estimated_hours
        reasons.append(_rule(
            "ESTIMATE_OPTIMISTIC", "caution",
            "This student is likely to need longer than estimated.",
            f"Predicted {predicted_completion_hours:.1f} h against your {teacher_estimated_hours:.1f} h "
            f"estimate — about {overrun:.1f} h more.",
        ))

    # A middling case that is worth naming rather than leaving silent.
    if capacity_status == RISK_MODERATE and deadline_risk_level == RISK_LEVEL_MODERATE:
        reasons.append(_rule(
            "TIGHT_BUT_FEASIBLE", "caution",
            "Feasible, but with no margin for error.",
            "The work fits only if nothing else changes before the deadline.",
        ))

    # CASE 4 — everything is comfortable.
    if capacity_status == RISK_SAFE and deadline_risk_level == RISK_LEVEL_LOW:
        reasons.append(_rule(
            "ON_TRACK", "positive",
            "Student is likely to complete the assignment successfully.",
            f"{capacity_after_assignment:.1f} h of slack remain after this assignment, and the "
            f"modelled late-submission risk is {deadline_risk_probability:.0%}.",
        ))

    if not reasons:
        reasons.append(_rule(
            "NO_SIGNIFICANT_RISK", "positive",
            "No significant capacity concern identified.",
            "Capacity and predicted risk are both within normal bounds.",
        ))

    headline = max(reasons, key=lambda r: SEVERITY[r["severity"]])

    return {
        "recommendation": headline["message"],
        "severity": headline["severity"],
        "reasons": reasons,
        "suggested_actions": _suggested_actions(capacity_status, deadline_risk_level),
        # Stated in the payload so no consumer can mistake advice for enforcement.
        "decision_authority": "teacher",
    }


def _suggested_actions(capacity_status: str, deadline_risk_level: str) -> list[str]:
    """Options a teacher may pick from. Never applied automatically."""
    if capacity_status == RISK_HIGH or deadline_risk_level == RISK_LEVEL_HIGH:
        return [
            "Extend the deadline",
            "Reduce the assignment scope",
            "Provide an alternative shorter task",
            "Allow an individual grace period",
            "Continue with the original assignment",
        ]
    if capacity_status == RISK_MODERATE or deadline_risk_level == RISK_LEVEL_MODERATE:
        return [
            "Continue with the original assignment",
            "Extend the deadline by one day",
            "Flag the student for a check-in",
        ]
    return ["Continue with the original assignment"]


def summarise_class_recommendation(
    total: int, safe: int, moderate: int, high_risk: int
) -> dict[str, Any]:
    """Produce the class-level headline shown above the per-student table."""
    if total == 0:
        return {
            "recommendation": "No students to analyse.",
            "severity": "positive",
            "detail": "The selected class has no students.",
        }

    high_share = high_risk / total

    if high_share >= 0.25:
        severity, message = "critical", "Reconsider this deadline before publishing."
    elif high_risk > 0:
        severity, message = "warning", f"{high_risk} students cannot fit this work before the deadline."
    elif moderate > 0:
        severity, message = "caution", "The class can absorb this, but some students have no margin."
    else:
        severity, message = "positive", "The whole class has capacity for this assignment."

    return {
        "recommendation": message,
        "severity": severity,
        "detail": (
            f"{safe} of {total} students are safe, {moderate} are at moderate capacity and "
            f"{high_risk} have insufficient time."
        ),
        "decision_authority": "teacher",
    }
