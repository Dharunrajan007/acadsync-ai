"""Phase 10 — behavioural tests for the trained models and the hybrid engine.

Good metrics on a held-out split do not prove a model behaves sensibly on the
cases the product actually cares about. These tests assert on *direction*: harder
work should not predict as faster, a cornered student should not read as low
risk. Directional tests survive retraining; exact-value assertions would not.
"""

from __future__ import annotations

import pytest

from app.ml.academic_intelligence_engine import analyze_single_student, analyze_students
from app.ml.class_analysis import analyze_class, top_at_risk
from app.ml.config import RISK_HIGH, RISK_LEVEL_HIGH, RISK_LEVEL_LOW, RISK_SAFE
from app.ml.prediction.predictor import (
    ModelNotAvailable,
    classify_risk,
    models_available,
    predict_completion_time,
    predict_deadline_risk,
)

pytestmark = pytest.mark.skipif(
    not all(models_available().values()),
    reason="trained model artefacts not present; run the training modules first",
)


def _features(**overrides) -> dict:
    """A neutral, average student and assignment, before overrides."""
    base = {
        "subject": "Machine Learning",
        "assignment_type": "Coding",
        "difficulty": "Medium",
        "teacher_estimated_hours": 2.0,
        "available_hours": 6.0,
        "existing_pending_hours": 2.0,
        "number_of_pending_assignments": 2,
        "hours_until_deadline": 48.0,
        "previous_completion_rate": 0.85,
        "previous_late_submissions": 1,
        "average_previous_completion_hours": 2.0,
    }
    base.update(overrides)
    return base


class TestCompletionModel:
    def test_predictions_are_positive_and_finite(self) -> None:
        for difficulty in ("Easy", "Medium", "Hard"):
            hours = predict_completion_time(_features(difficulty=difficulty))
            assert 0 < hours < 40, f"{difficulty} produced implausible {hours} h"

    def test_difficulty_orders_correctly(self) -> None:
        """Harder work must not predict as quicker. This is the core sanity check."""
        easy = predict_completion_time(_features(difficulty="Easy"))
        medium = predict_completion_time(_features(difficulty="Medium"))
        hard = predict_completion_time(_features(difficulty="Hard"))
        assert easy < medium < hard, f"got Easy={easy}, Medium={medium}, Hard={hard}"

    def test_larger_estimate_predicts_more_hours(self) -> None:
        small = predict_completion_time(_features(teacher_estimated_hours=1.0))
        large = predict_completion_time(_features(teacher_estimated_hours=5.0))
        assert large > small

    def test_slower_student_predicts_more_hours(self) -> None:
        """A student whose history shows they take longer should be predicted longer."""
        quick = predict_completion_time(_features(average_previous_completion_hours=1.0))
        slow = predict_completion_time(_features(average_previous_completion_hours=4.0))
        assert slow > quick

    def test_unseen_category_does_not_crash(self) -> None:
        """handle_unknown='ignore' must keep a live prediction alive."""
        hours = predict_completion_time(_features(subject="Quantum Basketweaving"))
        assert hours > 0


class TestDeadlineModel:
    def test_low_risk_student(self) -> None:
        """Lots of time, little pending work, long runway, strong history."""
        result = predict_deadline_risk(_features(
            available_hours=20.0,
            existing_pending_hours=0.5,
            number_of_pending_assignments=0,
            hours_until_deadline=120.0,
            previous_completion_rate=0.98,
            previous_late_submissions=0,
            difficulty="Easy",
            teacher_estimated_hours=1.0,
        ))
        assert result["risk_level"] == RISK_LEVEL_LOW
        assert result["late_probability"] < 0.30

    def test_high_risk_student(self) -> None:
        """Almost no time, heavily loaded, deadline imminent, poor history."""
        result = predict_deadline_risk(_features(
            available_hours=1.0,
            existing_pending_hours=12.0,
            number_of_pending_assignments=7,
            hours_until_deadline=6.0,
            previous_completion_rate=0.50,
            previous_late_submissions=5,
            difficulty="Hard",
            teacher_estimated_hours=5.0,
        ))
        assert result["risk_level"] == RISK_LEVEL_HIGH
        assert result["late_probability"] > 0.60

    def test_risk_increases_as_time_shrinks(self) -> None:
        """Monotonic in the variable the product is built around."""
        generous = predict_deadline_risk(_features(available_hours=18.0))["late_probability"]
        tight = predict_deadline_risk(_features(available_hours=1.0))["late_probability"]
        assert tight > generous

    def test_probability_is_bounded(self) -> None:
        p = predict_deadline_risk(_features())["late_probability"]
        assert 0.0 <= p <= 1.0


class TestRiskBands:
    @pytest.mark.parametrize(
        "probability,expected",
        [(0.0, "LOW"), (0.30, "LOW"), (0.31, "MODERATE"),
         (0.60, "MODERATE"), (0.61, "HIGH"), (1.0, "HIGH")],
    )
    def test_band_boundaries(self, probability: float, expected: str) -> None:
        assert classify_risk(probability) == expected


class TestHybridEngine:
    @staticmethod
    def _assignment(**overrides) -> dict:
        base = {
            "subject": "Machine Learning",
            "assignment_type": "Coding",
            "difficulty": "Hard",
            "teacher_estimated_hours": 2.0,
            "hours_until_deadline": 24.0,
        }
        base.update(overrides)
        return base

    def test_uses_prediction_not_teacher_estimate(self) -> None:
        """The whole point of the hybrid: capacity is charged the predicted hours."""
        student = {
            "student_id": "S001", "student_name": "Dharun",
            "available_hours": 5.0, "existing_pending_hours": 3.0,
            "number_of_pending_assignments": 3, "previous_completion_rate": 0.7,
            "previous_late_submissions": 2, "average_previous_completion_hours": 3.5,
        }
        result = analyze_single_student(student, self._assignment())
        assert result["ml_applied"] is True
        assert result["predicted_completion_hours"] != result["teacher_estimated_hours"]
        expected = round(result["remaining_capacity"] - result["predicted_completion_hours"], 2)
        assert result["capacity_after_assignment"] == pytest.approx(expected, abs=0.02)

    def test_cornered_student_is_high_risk(self) -> None:
        student = {
            "student_id": "S002", "student_name": "Overloaded",
            "available_hours": 1.0, "existing_pending_hours": 9.0,
            "number_of_pending_assignments": 7, "previous_completion_rate": 0.5,
            "previous_late_submissions": 5, "average_previous_completion_hours": 4.0,
        }
        result = analyze_single_student(student, self._assignment(hours_until_deadline=6.0))
        assert result["overall_status"] == RISK_HIGH
        assert "deadline" in result["recommendation"].lower() or "capacity" in result["recommendation"].lower()
        assert result["suggested_actions"], "a high-risk student must offer the teacher options"

    def test_comfortable_student_is_safe(self) -> None:
        student = {
            "student_id": "S003", "student_name": "Ahead",
            "available_hours": 22.0, "existing_pending_hours": 0.5,
            "number_of_pending_assignments": 0, "previous_completion_rate": 0.97,
            "previous_late_submissions": 0, "average_previous_completion_hours": 1.5,
        }
        result = analyze_single_student(
            student, self._assignment(difficulty="Easy", teacher_estimated_hours=1.0,
                                      hours_until_deadline=120.0)
        )
        assert result["overall_status"] == RISK_SAFE

    def test_engine_never_mutates_the_assignment(self) -> None:
        """The system advises; it must not quietly rewrite the teacher's input."""
        assignment = self._assignment()
        snapshot = dict(assignment)
        analyze_students([{"student_id": "S1", "available_hours": 4,
                           "existing_pending_hours": 1}], assignment)
        assert assignment == snapshot

    def test_fallback_without_ml(self) -> None:
        """With use_ml off the engine still answers, and says the ML was not applied."""
        result = analyze_single_student(
            {"student_id": "S004", "available_hours": 5, "existing_pending_hours": 1},
            self._assignment(), use_ml=False,
        )
        assert result["ml_applied"] is False
        assert result["predicted_completion_hours"] == result["teacher_estimated_hours"]
        assert result["capacity_status"] in {"SAFE", "MODERATE", "HIGH RISK"}


class TestClassAnalysis:
    @staticmethod
    def _roster(n: int = 30) -> list[dict]:
        roster = []
        for i in range(n):
            roster.append({
                "student_id": f"S{i + 1:03d}",
                "student_name": f"Student {i + 1}",
                "available_hours": 1.0 + (i % 10) * 2.0,
                "existing_pending_hours": float(i % 6),
                "number_of_pending_assignments": i % 5,
                "previous_completion_rate": 0.55 + (i % 8) * 0.05,
                "previous_late_submissions": i % 4,
                "average_previous_completion_hours": 1.5 + (i % 5) * 0.5,
            })
        return roster

    def test_counts_are_exhaustive(self) -> None:
        result = analyze_class(self._roster(), TestHybridEngine._assignment())
        assert result["total_students"] == 30
        assert (
            result["safe_students"] + result["moderate_students"] + result["high_risk_students"]
            == result["total_students"]
        )

    def test_sorted_by_risk_descending(self) -> None:
        result = analyze_class(self._roster(), TestHybridEngine._assignment())
        probs = [s["deadline_risk_probability"] for s in result["students"]]
        assert probs == sorted(probs, reverse=True)

    def test_statistics_present(self) -> None:
        result = analyze_class(self._roster(), TestHybridEngine._assignment())
        stats = result["statistics"]
        assert stats["mean_predicted_completion_hours"] > 0
        assert 0 <= stats["mean_late_probability"] <= 1

    def test_class_recommendation_and_top_list(self) -> None:
        result = analyze_class(self._roster(), TestHybridEngine._assignment())
        assert result["class_recommendation"]["decision_authority"] == "teacher"
        top = top_at_risk(result, limit=5)
        assert len(top) == 5

    def test_empty_class(self) -> None:
        result = analyze_class([], TestHybridEngine._assignment())
        assert result["total_students"] == 0
        assert result["students"] == []
