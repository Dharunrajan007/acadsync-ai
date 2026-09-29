"""Central configuration for the AcadSync AI intelligence layer.

Every threshold the system uses to make a judgement lives here rather than being
scattered through the modules. The brief asks for these to be configurable, and
keeping them in one place also means a school could tune the system to its own
academic culture without touching any logic.
"""

from __future__ import annotations

from pathlib import Path
from typing import Final

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ML_DIR: Final[Path] = Path(__file__).resolve().parent
DATA_DIR: Final[Path] = ML_DIR / "data"
MODEL_DIR: Final[Path] = ML_DIR / "models"
REPORT_DIR: Final[Path] = ML_DIR / "reports"

DATASET_PATH: Final[Path] = DATA_DIR / "student_assignment_dataset.csv"
COMPLETION_MODEL_PATH: Final[Path] = MODEL_DIR / "completion_time_model.pkl"
DEADLINE_MODEL_PATH: Final[Path] = MODEL_DIR / "deadline_risk_model.pkl"
METRICS_PATH: Final[Path] = MODEL_DIR / "model_metrics.json"

for _directory in (DATA_DIR, MODEL_DIR, REPORT_DIR):
    _directory.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Capacity engine thresholds (Phase 1)
# ---------------------------------------------------------------------------
# Hours of slack a student must retain AFTER the new assignment to count as safe.
CAPACITY_SAFE_THRESHOLD: Final[float] = 2.0
# Below this the student is over capacity: the work does not fit in the time.
CAPACITY_MODERATE_THRESHOLD: Final[float] = 0.0

RISK_SAFE: Final[str] = "SAFE"
RISK_MODERATE: Final[str] = "MODERATE"
RISK_HIGH: Final[str] = "HIGH RISK"

# ---------------------------------------------------------------------------
# Deadline-risk probability bands (Phase 6)
# ---------------------------------------------------------------------------
RISK_LOW_MAX: Final[float] = 0.30
RISK_MODERATE_MAX: Final[float] = 0.60

RISK_LEVEL_LOW: Final[str] = "LOW"
RISK_LEVEL_MODERATE: Final[str] = "MODERATE"
RISK_LEVEL_HIGH: Final[str] = "HIGH"

# ---------------------------------------------------------------------------
# Dataset generation (Phase 2)
# ---------------------------------------------------------------------------
RANDOM_SEED: Final[int] = 42
N_RECORDS: Final[int] = 8000
N_STUDENTS: Final[int] = 400

SUBJECTS: Final[tuple[str, ...]] = (
    "Machine Learning",
    "Database Management",
    "Python Programming",
    "Java Programming",
    "Big Data Analytics",
    "Data Visualization",
)

ASSIGNMENT_TYPES: Final[tuple[str, ...]] = ("Coding", "Theory", "Lab", "Project", "Research")

DIFFICULTIES: Final[tuple[str, ...]] = ("Easy", "Medium", "Hard")

# How much longer a task tends to take as difficulty rises.
DIFFICULTY_MULTIPLIER: Final[dict[str, float]] = {"Easy": 0.85, "Medium": 1.05, "Hard": 1.40}

# Some kinds of work overrun their estimate more than others.
TYPE_MULTIPLIER: Final[dict[str, float]] = {
    "Coding": 1.10,
    "Theory": 0.90,
    "Lab": 1.00,
    "Project": 1.30,
    "Research": 1.15,
}

# ---------------------------------------------------------------------------
# Modelling (Phases 4-6)
# ---------------------------------------------------------------------------
TEST_SIZE: Final[float] = 0.20

CATEGORICAL_FEATURES: Final[list[str]] = ["subject", "assignment_type", "difficulty"]

NUMERICAL_FEATURES: Final[list[str]] = [
    "teacher_estimated_hours",
    "available_hours",
    "existing_pending_hours",
    "number_of_pending_assignments",
    "hours_until_deadline",
    "previous_completion_rate",
    "previous_late_submissions",
    "average_previous_completion_hours",
]

FEATURE_COLUMNS: Final[list[str]] = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

TARGET_COMPLETION: Final[str] = "actual_completion_hours"
TARGET_LATE: Final[str] = "submitted_late"
