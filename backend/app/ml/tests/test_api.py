"""Phase 11 tests — exercise the API surface the frontend will call.

These go through the real ASGI app rather than calling the engine directly, so
they cover routing, Pydantic validation and response serialisation together.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ml.prediction.predictor import models_available

client = TestClient(app)

ASSIGNMENT = {
    "title": "Build a Classification Model",
    "subject": "Machine Learning",
    "assignment_type": "Coding",
    "difficulty": "Hard",
    "teacher_estimated_hours": 2,
    "hours_until_deadline": 24,
}

STUDENT = {
    "student_id": "S001",
    "student_name": "Dharun Rajan",
    "available_hours": 5,
    "existing_pending_hours": 3,
    "number_of_pending_assignments": 3,
    "previous_completion_rate": 0.78,
    "previous_late_submissions": 2,
    "average_previous_completion_hours": 2.5,
}

needs_models = pytest.mark.skipif(
    not all(models_available().values()), reason="trained artefacts not present"
)


class TestMeta:
    def test_root(self) -> None:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["service"] == "AcadSync AI"

    def test_health(self) -> None:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    @needs_models
    def test_model_info_reports_real_metrics(self) -> None:
        """Phase 13: the UI must show measured numbers, never invented ones."""
        response = client.get("/api/models/info")
        assert response.status_code == 200
        body = response.json()
        assert body["data_source"] == "synthetic"
        assert "synthetic" in body["disclaimer"].lower()
        assert 0 < body["completion_model"]["metrics"]["mae"] < 5
        assert 0 < body["deadline_model"]["metrics"]["f1"] <= 1


class TestCapacityEndpoint:
    def test_rule_only_capacity(self) -> None:
        """Works with no ML artefacts at all — the always-available fallback."""
        response = client.post("/api/capacity", json={
            "student_id": "S001", "available_hours": 5,
            "existing_pending_hours": 3, "new_assignment_hours": 2,
        })
        assert response.status_code == 200
        body = response.json()
        assert body["remaining_capacity"] == 2
        assert body["capacity_after_assignment"] == 0
        assert body["risk_level"] == "MODERATE"

    def test_negative_hours_rejected_at_the_edge(self) -> None:
        response = client.post("/api/capacity", json={
            "student_id": "S001", "available_hours": -5,
            "existing_pending_hours": 0, "new_assignment_hours": 2,
        })
        assert response.status_code == 422


@needs_models
class TestAnalysisEndpoints:
    def test_analyze_student(self) -> None:
        response = client.post("/api/analyze/student",
                               json={"assignment": ASSIGNMENT, "student": STUDENT})
        assert response.status_code == 200
        body = response.json()
        assert body["student_id"] == "S001"
        assert body["predicted_completion_hours"] > 0
        assert body["overall_status"] in {"SAFE", "MODERATE", "HIGH RISK"}
        assert body["deadline_risk"] in {"LOW", "MODERATE", "HIGH"}
        assert body["reasons"], "a recommendation must always be explainable"
        assert body["ml_applied"] is True

    def test_analyze_class_counts_are_exhaustive(self) -> None:
        students = [
            {**STUDENT, "student_id": f"S{i:03d}", "student_name": f"Student {i}",
             "available_hours": 1 + (i % 12) * 2,
             "existing_pending_hours": i % 5}
            for i in range(60)
        ]
        response = client.post("/api/analyze/class",
                               json={"assignment": ASSIGNMENT, "students": students})
        assert response.status_code == 200
        body = response.json()
        assert body["total_students"] == 60
        assert (
            body["safe_students"] + body["moderate_students"] + body["high_risk_students"] == 60
        )
        assert body["class_recommendation"]["decision_authority"] == "teacher"
        # Worst first, so the teacher reads the problems at the top.
        probs = [s["deadline_risk_probability"] for s in body["students"]]
        assert probs == sorted(probs, reverse=True)

    def test_predict_completion_time(self) -> None:
        response = client.post("/api/predict/completion-time",
                               json={"assignment": ASSIGNMENT, "student": STUDENT})
        assert response.status_code == 200
        body = response.json()
        assert body["predicted_completion_hours"] > 0
        assert body["difference_hours"] == pytest.approx(
            body["predicted_completion_hours"] - body["teacher_estimated_hours"], abs=0.01
        )

    def test_predict_deadline_risk(self) -> None:
        response = client.post("/api/predict/deadline-risk",
                               json={"assignment": ASSIGNMENT, "student": STUDENT})
        assert response.status_code == 200
        body = response.json()
        assert 0 <= body["late_probability"] <= 1
        assert body["risk_level"] in {"LOW", "MODERATE", "HIGH"}


class TestValidation:
    def test_empty_class_rejected(self) -> None:
        response = client.post("/api/analyze/class",
                               json={"assignment": ASSIGNMENT, "students": []})
        assert response.status_code == 422

    def test_invalid_difficulty_rejected(self) -> None:
        bad = {**ASSIGNMENT, "difficulty": "Impossible"}
        response = client.post("/api/analyze/student",
                               json={"assignment": bad, "student": STUDENT})
        assert response.status_code == 422

    def test_zero_estimated_hours_rejected(self) -> None:
        bad = {**ASSIGNMENT, "teacher_estimated_hours": 0}
        response = client.post("/api/analyze/student",
                               json={"assignment": bad, "student": STUDENT})
        assert response.status_code == 422

    def test_completion_rate_above_one_rejected(self) -> None:
        bad = {**STUDENT, "previous_completion_rate": 1.5}
        response = client.post("/api/analyze/student",
                               json={"assignment": ASSIGNMENT, "student": bad})
        assert response.status_code == 422
