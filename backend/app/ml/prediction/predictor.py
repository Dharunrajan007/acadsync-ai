"""Model loading and inference.

The trained pipelines carry their own fitted preprocessing, so serving code
never rebuilds feature transformations by hand — that mismatch is the classic
way a model that scored well in training quietly rots in production.

Models are loaded once and cached. If an artefact is missing the predictor
degrades gracefully rather than crashing: the capacity engine is rule-based and
still works without ML, so the product should keep functioning with reduced
intelligence rather than fail outright.
"""

from __future__ import annotations

import threading
from functools import lru_cache
from typing import Any

import joblib
import pandas as pd

from ..config import (
    COMPLETION_MODEL_PATH,
    DEADLINE_MODEL_PATH,
    FEATURE_COLUMNS,
    RISK_LEVEL_HIGH,
    RISK_LEVEL_LOW,
    RISK_LEVEL_MODERATE,
    RISK_LOW_MAX,
    RISK_MODERATE_MAX,
)

_LOAD_LOCK = threading.Lock()


class ModelNotAvailable(RuntimeError):
    """Raised when a prediction is requested but the artefact is not on disk."""


@lru_cache(maxsize=1)
def load_completion_model() -> Any:
    """Load and cache the completion-time regressor."""
    if not COMPLETION_MODEL_PATH.exists():
        raise ModelNotAvailable(
            f"{COMPLETION_MODEL_PATH.name} not found. "
            "Run `python -m app.ml.training.train_completion_model`."
        )
    with _LOAD_LOCK:
        return joblib.load(COMPLETION_MODEL_PATH)


@lru_cache(maxsize=1)
def load_deadline_model() -> Any:
    """Load and cache the deadline-risk classifier."""
    if not DEADLINE_MODEL_PATH.exists():
        raise ModelNotAvailable(
            f"{DEADLINE_MODEL_PATH.name} not found. "
            "Run `python -m app.ml.training.train_deadline_model`."
        )
    with _LOAD_LOCK:
        return joblib.load(DEADLINE_MODEL_PATH)


def models_available() -> dict[str, bool]:
    """Report which artefacts exist, for the health endpoint."""
    return {
        "completion_model": COMPLETION_MODEL_PATH.exists(),
        "deadline_model": DEADLINE_MODEL_PATH.exists(),
    }


def _to_frame(features: dict[str, Any] | list[dict[str, Any]]) -> pd.DataFrame:
    """Build the single-row (or multi-row) frame the pipelines expect.

    Missing columns are filled with None and handled by the pipeline's imputers,
    so a caller omitting an optional history field gets a sensible prediction
    instead of a KeyError.
    """
    records = [features] if isinstance(features, dict) else list(features)
    frame = pd.DataFrame(records)

    for column in FEATURE_COLUMNS:
        if column not in frame.columns:
            frame[column] = None
    return frame[FEATURE_COLUMNS]


def classify_risk(
    probability: float,
    low_max: float = RISK_LOW_MAX,
    moderate_max: float = RISK_MODERATE_MAX,
) -> str:
    """Turn a late-submission probability into the product's risk band."""
    if probability <= low_max:
        return RISK_LEVEL_LOW
    if probability <= moderate_max:
        return RISK_LEVEL_MODERATE
    return RISK_LEVEL_HIGH


def predict_completion_time(features: dict[str, Any]) -> float:
    """Predict the hours a student will actually need.

    Args:
        features: One record carrying the columns in ``FEATURE_COLUMNS``.

    Returns:
        Predicted completion hours, floored at 0.25 h — a negative or zero
        prediction is meaningless and would corrupt the capacity arithmetic.
    """
    model = load_completion_model()
    prediction = float(model.predict(_to_frame(features))[0])
    return round(max(prediction, 0.25), 2)


def predict_completion_time_batch(records: list[dict[str, Any]]) -> list[float]:
    """Vectorised completion-time prediction for a whole class.

    Predicting 60 students in one call rather than 60 separate calls is the
    difference between one pipeline transform and sixty.
    """
    if not records:
        return []
    model = load_completion_model()
    predictions = model.predict(_to_frame(records))
    return [round(max(float(p), 0.25), 2) for p in predictions]


def predict_deadline_risk(features: dict[str, Any]) -> dict[str, Any]:
    """Predict the probability that this student submits late.

    Returns:
        A dict with the probability and its risk band.
    """
    model = load_deadline_model()
    probability = float(model.predict_proba(_to_frame(features))[0][1])
    return {
        "late_probability": round(probability, 4),
        "risk_level": classify_risk(probability),
    }


def predict_deadline_risk_batch(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Vectorised deadline-risk prediction for a whole class."""
    if not records:
        return []
    model = load_deadline_model()
    probabilities = model.predict_proba(_to_frame(records))[:, 1]
    return [
        {"late_probability": round(float(p), 4), "risk_level": classify_risk(float(p))}
        for p in probabilities
    ]
