"""Phase 1 — Student Capacity Engine.

This module is deliberately NOT machine learning. It answers one arithmetic
question with no ambiguity and no training data:

    Does this student have enough unbooked time left to absorb new work
    before the deadline?

Because the answer drives decisions a teacher will defend to a student, the
calculation stays transparent and reproducible. The ML models elsewhere in this
package refine the *inputs* to this engine; they never replace it.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Sequence

from .config import (
    CAPACITY_MODERATE_THRESHOLD,
    CAPACITY_SAFE_THRESHOLD,
    RISK_HIGH,
    RISK_MODERATE,
    RISK_SAFE,
)


class CapacityInputError(ValueError):
    """Raised when the values handed to the capacity engine cannot be used."""


@dataclass(frozen=True)
class CapacityResult:
    """The outcome of a single student's capacity calculation."""

    student_id: str
    available_hours: float
    existing_workload: float
    new_assignment_hours: float
    remaining_capacity: float
    capacity_after_assignment: float
    risk_level: str

    def to_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable shape the API and frontend consume."""
        return {
            "student_id": self.student_id,
            "available_hours": self.available_hours,
            "existing_workload": self.existing_workload,
            "new_assignment_hours": self.new_assignment_hours,
            "remaining_capacity": self.remaining_capacity,
            "capacity_after_assignment": self.capacity_after_assignment,
            "risk_level": self.risk_level,
        }


def classify_capacity(
    capacity_after_assignment: float,
    safe_threshold: float = CAPACITY_SAFE_THRESHOLD,
    moderate_threshold: float = CAPACITY_MODERATE_THRESHOLD,
) -> str:
    """Map leftover hours onto a risk band.

    Args:
        capacity_after_assignment: Hours left once the new work is accounted for.
        safe_threshold: At or above this many spare hours the student is SAFE.
        moderate_threshold: At or above this, but below `safe_threshold`, the
            student is MODERATE. Below it they are over capacity.

    Returns:
        One of ``SAFE``, ``MODERATE`` or ``HIGH RISK``.
    """
    if capacity_after_assignment >= safe_threshold:
        return RISK_SAFE
    if capacity_after_assignment >= moderate_threshold:
        return RISK_MODERATE
    return RISK_HIGH


def _validate(name: str, value: float, allow_zero: bool = True) -> float:
    """Coerce an input to float and reject values that make no physical sense."""
    try:
        numeric = float(value)
    except (TypeError, ValueError) as exc:
        raise CapacityInputError(f"{name} must be a number, got {value!r}") from exc

    if numeric < 0:
        raise CapacityInputError(f"{name} cannot be negative, got {numeric}")
    if not allow_zero and numeric == 0:
        raise CapacityInputError(f"{name} must be greater than zero")
    return numeric


def calculate_student_capacity(
    student_id: str,
    available_hours: float,
    existing_pending_hours: float,
    new_assignment_hours: float,
    safe_threshold: float = CAPACITY_SAFE_THRESHOLD,
    moderate_threshold: float = CAPACITY_MODERATE_THRESHOLD,
) -> CapacityResult:
    """Work out whether one student can absorb one new assignment.

    Args:
        student_id: Identifier used to join the result back to the roster.
        available_hours: Hours the student declared free before the deadline.
        existing_pending_hours: Estimated hours of work already outstanding.
        new_assignment_hours: Estimated hours the new assignment will take. This
            may be the teacher's estimate or, in the hybrid engine, the model's
            predicted completion time.
        safe_threshold: Spare-hours cutoff for the SAFE band.
        moderate_threshold: Spare-hours cutoff for the MODERATE band.

    Returns:
        A :class:`CapacityResult` describing the student's position.

    Raises:
        CapacityInputError: If any hour value is negative or non-numeric.
    """
    if not str(student_id).strip():
        raise CapacityInputError("student_id must be a non-empty string")

    available = _validate("available_hours", available_hours)
    existing = _validate("existing_pending_hours", existing_pending_hours)
    new_hours = _validate("new_assignment_hours", new_assignment_hours)

    remaining_capacity = available - existing
    capacity_after = remaining_capacity - new_hours

    return CapacityResult(
        student_id=str(student_id),
        available_hours=round(available, 2),
        existing_workload=round(existing, 2),
        new_assignment_hours=round(new_hours, 2),
        remaining_capacity=round(remaining_capacity, 2),
        capacity_after_assignment=round(capacity_after, 2),
        risk_level=classify_capacity(capacity_after, safe_threshold, moderate_threshold),
    )


def analyze_multiple_students(
    students: Sequence[dict[str, Any]] | Iterable[dict[str, Any]],
    new_assignment_hours: float,
    safe_threshold: float = CAPACITY_SAFE_THRESHOLD,
    moderate_threshold: float = CAPACITY_MODERATE_THRESHOLD,
) -> dict[str, Any]:
    """Run the capacity calculation across a whole class.

    Args:
        students: Records carrying at least ``student_id``, ``available_hours``
            and ``existing_pending_hours``. A per-student
            ``new_assignment_hours`` overrides the class-wide value, which is how
            the hybrid engine feeds in an individual predicted completion time.
        new_assignment_hours: Default estimated hours for the new assignment.
        safe_threshold: Spare-hours cutoff for the SAFE band.
        moderate_threshold: Spare-hours cutoff for the MODERATE band.

    Returns:
        A summary dict with counts per band and every student's result, sorted
        with the tightest schedules first so a teacher reads the problems before
        the non-problems.
    """
    results: list[CapacityResult] = []
    errors: list[dict[str, str]] = []

    for record in students:
        try:
            results.append(
                calculate_student_capacity(
                    student_id=record["student_id"],
                    available_hours=record["available_hours"],
                    existing_pending_hours=record["existing_pending_hours"],
                    new_assignment_hours=record.get("new_assignment_hours", new_assignment_hours),
                    safe_threshold=safe_threshold,
                    moderate_threshold=moderate_threshold,
                )
            )
        except (CapacityInputError, KeyError) as exc:
            # One malformed row must not abort the analysis of an entire class.
            errors.append({"student_id": str(record.get("student_id", "unknown")), "error": str(exc)})

    results.sort(key=lambda r: r.capacity_after_assignment)

    return {
        "total_students": len(results),
        "safe_students": sum(r.risk_level == RISK_SAFE for r in results),
        "moderate_students": sum(r.risk_level == RISK_MODERATE for r in results),
        "high_risk_students": sum(r.risk_level == RISK_HIGH for r in results),
        "students": [r.to_dict() for r in results],
        "errors": errors,
    }
