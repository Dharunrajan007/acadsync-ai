"""Pydantic schemas — the contract between the React frontend and the ML layer.

Validation lives here so that malformed input is rejected at the edge with a
clear 422 rather than propagating into the engine and surfacing as a confusing
500. Every hour field is constrained to a non-negative, physically sensible
range for the same reason.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

Difficulty = Literal["Easy", "Medium", "Hard"]
AssignmentType = Literal["Coding", "Theory", "Lab", "Project", "Research"]


class StudentData(BaseModel):
    """One student's workload position at the moment of analysis."""

    student_id: str = Field(..., min_length=1, examples=["S001"])
    student_name: str | None = Field(None, examples=["Dharun Rajan"])

    available_hours: float = Field(
        ..., ge=0, le=200, description="Hours the student can realistically work before the deadline."
    )
    existing_pending_hours: float = Field(
        0.0, ge=0, le=200, description="Estimated hours of work already outstanding."
    )
    number_of_pending_assignments: int = Field(0, ge=0, le=50)

    # Historical signals. Defaults are deliberately average, not flattering:
    # an unknown student should not be assumed reliable.
    previous_completion_rate: float = Field(0.85, ge=0.0, le=1.0)
    previous_late_submissions: int = Field(0, ge=0, le=100)
    average_previous_completion_hours: float = Field(2.0, gt=0, le=50)

    model_config = {"json_schema_extra": {"examples": [{
        "student_id": "S001", "student_name": "Dharun Rajan",
        "available_hours": 5, "existing_pending_hours": 3,
        "number_of_pending_assignments": 3, "previous_completion_rate": 0.78,
        "previous_late_submissions": 2, "average_previous_completion_hours": 2.5,
    }]}}


class AssignmentData(BaseModel):
    """The assignment a teacher is considering publishing."""

    title: str | None = Field(None, examples=["Build a Classification Model"])
    subject: str = Field("Machine Learning", min_length=1)
    assignment_type: AssignmentType = "Coding"
    difficulty: Difficulty = "Medium"
    teacher_estimated_hours: float = Field(..., gt=0, le=100)
    hours_until_deadline: float = Field(
        24.0, gt=0, le=2000, description="Calendar hours between now and the deadline."
    )

    model_config = {"json_schema_extra": {"examples": [{
        "title": "Build a Classification Model", "subject": "Machine Learning",
        "assignment_type": "Coding", "difficulty": "Hard",
        "teacher_estimated_hours": 2, "hours_until_deadline": 24,
    }]}}


class CapacityRequest(BaseModel):
    """Inputs for the rule-only capacity endpoint."""

    student_id: str = Field(..., min_length=1)
    available_hours: float = Field(..., ge=0, le=200)
    existing_pending_hours: float = Field(0.0, ge=0, le=200)
    new_assignment_hours: float = Field(..., ge=0, le=100)


class CapacityResult(BaseModel):
    """The rule-based capacity verdict for one student."""

    student_id: str
    available_hours: float
    existing_workload: float
    new_assignment_hours: float
    remaining_capacity: float
    capacity_after_assignment: float
    risk_level: str


class RiskPrediction(BaseModel):
    """Output of the deadline-risk classifier."""

    late_probability: float = Field(..., ge=0.0, le=1.0)
    risk_level: Literal["LOW", "MODERATE", "HIGH"]


class CompletionPrediction(BaseModel):
    """Output of the completion-time regressor."""

    predicted_completion_hours: float
    teacher_estimated_hours: float
    difference_hours: float = Field(..., description="Predicted minus estimated; positive means overrun.")


class RecommendationReason(BaseModel):
    """A single triggered rule, so the advice can be explained line by line."""

    code: str
    severity: Literal["critical", "warning", "caution", "positive"]
    message: str
    detail: str


class StudentAnalysis(BaseModel):
    """The complete hybrid analysis for one student."""

    student_id: str
    student_name: str
    teacher_estimated_hours: float
    predicted_completion_hours: float
    available_hours: float
    existing_workload: float
    remaining_capacity: float
    capacity_after_assignment: float
    capacity_status: str
    deadline_risk_probability: float
    deadline_risk: str
    overall_status: str
    recommendation: str
    severity: str
    reasons: list[RecommendationReason]
    suggested_actions: list[str]
    ml_applied: bool


class ClassRecommendation(BaseModel):
    recommendation: str
    severity: str
    detail: str
    decision_authority: Literal["teacher"] = "teacher"


class ClassAnalysisRequest(BaseModel):
    assignment: AssignmentData
    students: list[StudentData] = Field(..., min_length=1, max_length=2000)


class SingleAnalysisRequest(BaseModel):
    assignment: AssignmentData
    student: StudentData


class ClassAnalysisResult(BaseModel):
    """What the teacher's 'Analyze Student Capacity' screen renders."""

    total_students: int
    safe_students: int
    moderate_students: int
    high_risk_students: int
    class_recommendation: ClassRecommendation
    statistics: dict[str, Any]
    students: list[StudentAnalysis]


class ModelInfo(BaseModel):
    """Phase 13 — honest reporting of what is actually running."""

    completion_model: dict[str, Any] | None
    deadline_model: dict[str, Any] | None
    data_source: str
    disclaimer: str
