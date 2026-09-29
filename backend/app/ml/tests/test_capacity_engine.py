"""Phase 1 tests — the capacity engine must be right before anything is built on it.

Covers the five cases named in the brief plus the boundary conditions, because
the thresholds are exactly where a rule engine tends to be wrong.
"""

from __future__ import annotations

import pytest

from app.ml.capacity_engine import (
    CapacityInputError,
    analyze_multiple_students,
    calculate_student_capacity,
    classify_capacity,
)
from app.ml.config import RISK_HIGH, RISK_MODERATE, RISK_SAFE


class TestSingleStudent:
    def test_safe_student(self) -> None:
        """8 free - 1 pending - 2 new = 5 spare hours: comfortably SAFE."""
        result = calculate_student_capacity("S001", 8, 1, 2)
        assert result.remaining_capacity == 7
        assert result.capacity_after_assignment == 5
        assert result.risk_level == RISK_SAFE

    def test_moderate_student(self) -> None:
        """The brief's worked example: 5 - 3 - 2 = 0 spare hours, so MODERATE."""
        result = calculate_student_capacity("S002", 5, 3, 2)
        assert result.remaining_capacity == 2
        assert result.capacity_after_assignment == 0
        assert result.risk_level == RISK_MODERATE

    def test_high_risk_student(self) -> None:
        """The brief's second example: 3 - 2 - 2 = -1, the work does not fit."""
        result = calculate_student_capacity("S003", 3, 2, 2)
        assert result.remaining_capacity == 1
        assert result.capacity_after_assignment == -1
        assert result.risk_level == RISK_HIGH

    def test_zero_available_hours(self) -> None:
        """A student with no free time cannot absorb any work at all."""
        result = calculate_student_capacity("S004", 0, 0, 2)
        assert result.remaining_capacity == 0
        assert result.capacity_after_assignment == -2
        assert result.risk_level == RISK_HIGH

    def test_no_existing_workload(self) -> None:
        """With nothing pending, spare time is simply availability minus the task."""
        result = calculate_student_capacity("S005", 6, 0, 2)
        assert result.remaining_capacity == 6
        assert result.capacity_after_assignment == 4
        assert result.risk_level == RISK_SAFE

    def test_serialisation_shape(self) -> None:
        """The dict form is the API contract, so its keys are part of the test."""
        payload = calculate_student_capacity("S001", 5, 3, 2).to_dict()
        assert payload == {
            "student_id": "S001",
            "available_hours": 5.0,
            "existing_workload": 3.0,
            "new_assignment_hours": 2.0,
            "remaining_capacity": 2.0,
            "capacity_after_assignment": 0.0,
            "risk_level": RISK_MODERATE,
        }


class TestBoundaries:
    """The thresholds themselves — off-by-one errors live here."""

    def test_exactly_two_spare_hours_is_safe(self) -> None:
        assert classify_capacity(2.0) == RISK_SAFE

    def test_just_under_two_spare_hours_is_moderate(self) -> None:
        assert classify_capacity(1.99) == RISK_MODERATE

    def test_exactly_zero_spare_hours_is_moderate(self) -> None:
        assert classify_capacity(0.0) == RISK_MODERATE

    def test_just_below_zero_is_high_risk(self) -> None:
        assert classify_capacity(-0.01) == RISK_HIGH

    def test_thresholds_are_configurable(self) -> None:
        """A stricter school could demand 4 spare hours before calling it safe."""
        assert classify_capacity(3.0, safe_threshold=4.0) == RISK_MODERATE
        assert classify_capacity(3.0, safe_threshold=2.0) == RISK_SAFE

    def test_fractional_hours_are_preserved(self) -> None:
        result = calculate_student_capacity("S006", 4.5, 1.25, 1.5)
        assert result.capacity_after_assignment == 1.75
        assert result.risk_level == RISK_MODERATE


class TestValidation:
    def test_negative_available_hours_rejected(self) -> None:
        with pytest.raises(CapacityInputError, match="cannot be negative"):
            calculate_student_capacity("S007", -1, 0, 2)

    def test_non_numeric_rejected(self) -> None:
        with pytest.raises(CapacityInputError, match="must be a number"):
            calculate_student_capacity("S008", "plenty", 0, 2)

    def test_empty_student_id_rejected(self) -> None:
        with pytest.raises(CapacityInputError, match="student_id"):
            calculate_student_capacity("   ", 5, 1, 2)


class TestClassAnalysis:
    @staticmethod
    def _roster() -> list[dict[str, object]]:
        return [
            {"student_id": "S001", "available_hours": 8, "existing_pending_hours": 1},   # +5 safe
            {"student_id": "S002", "available_hours": 5, "existing_pending_hours": 3},   # 0 moderate
            {"student_id": "S003", "available_hours": 3, "existing_pending_hours": 2},   # -1 high
            {"student_id": "S004", "available_hours": 10, "existing_pending_hours": 2},  # +6 safe
            {"student_id": "S005", "available_hours": 2, "existing_pending_hours": 2},   # -2 high
        ]

    def test_counts_add_up(self) -> None:
        summary = analyze_multiple_students(self._roster(), new_assignment_hours=2)
        assert summary["total_students"] == 5
        assert summary["safe_students"] == 2
        assert summary["moderate_students"] == 1
        assert summary["high_risk_students"] == 2
        assert (
            summary["safe_students"] + summary["moderate_students"] + summary["high_risk_students"]
            == summary["total_students"]
        )

    def test_sorted_worst_first(self) -> None:
        """A teacher should meet the students in trouble at the top of the table."""
        summary = analyze_multiple_students(self._roster(), new_assignment_hours=2)
        spare = [s["capacity_after_assignment"] for s in summary["students"]]
        assert spare == sorted(spare)
        assert summary["students"][0]["student_id"] == "S005"

    def test_per_student_override_wins(self) -> None:
        """The hybrid engine passes an individual predicted time per student."""
        roster = [{"student_id": "S001", "available_hours": 8, "existing_pending_hours": 1,
                   "new_assignment_hours": 7}]
        summary = analyze_multiple_students(roster, new_assignment_hours=2)
        assert summary["students"][0]["capacity_after_assignment"] == 0.0
        assert summary["moderate_students"] == 1

    def test_bad_row_is_reported_not_fatal(self) -> None:
        """One broken record must not lose the analysis for the other 59 students."""
        roster = self._roster() + [{"student_id": "S404", "available_hours": -5,
                                    "existing_pending_hours": 0}]
        summary = analyze_multiple_students(roster, new_assignment_hours=2)
        assert summary["total_students"] == 5
        assert len(summary["errors"]) == 1
        assert summary["errors"][0]["student_id"] == "S404"

    def test_empty_roster(self) -> None:
        summary = analyze_multiple_students([], new_assignment_hours=2)
        assert summary["total_students"] == 0
        assert summary["students"] == []
