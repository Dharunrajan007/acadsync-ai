"""Phase 5 — completion-time prediction model (regression).

Predicts how many hours a given student will actually need for a given
assignment. This is the number the hybrid engine feeds into the capacity engine
in place of the teacher's estimate, which is the whole point: a 2-hour task is
not a 2-hour task for every student.

Three candidates are trained and compared on a held-out split; the best by MAE
wins and is persisted together with its fitted preprocessor.

Run:
    python -m app.ml.training.train_completion_model
"""

from __future__ import annotations

import json
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from ..config import (
    COMPLETION_MODEL_PATH,
    METRICS_PATH,
    RANDOM_SEED,
    TEST_SIZE,
)
from .preprocess import build_preprocessor, load_dataset, prepare_completion_dataset


def candidate_models() -> dict[str, Any]:
    """The models to compare. Linear regression is the honest baseline."""
    return {
        "LinearRegression": LinearRegression(),
        "RandomForestRegressor": RandomForestRegressor(
            n_estimators=300,
            max_depth=18,
            min_samples_leaf=2,
            random_state=RANDOM_SEED,
            n_jobs=-1,
        ),
        "GradientBoostingRegressor": GradientBoostingRegressor(
            n_estimators=300,
            learning_rate=0.06,
            max_depth=4,
            random_state=RANDOM_SEED,
        ),
    }


def evaluate(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
    """Compute the regression metrics named in the brief."""
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    return {"mae": round(mae, 4), "rmse": round(rmse, 4), "r2": round(float(r2_score(y_true, y_pred)), 4)}


def train() -> dict[str, Any]:
    """Train, compare, select and persist the completion-time model."""
    frame = load_dataset()
    data = prepare_completion_dataset(frame)

    X_train, X_test, y_train, y_test = train_test_split(
        data.X, data.y, test_size=TEST_SIZE, random_state=RANDOM_SEED
    )

    print("=" * 66)
    print("PHASE 5 — COMPLETION TIME PREDICTION (regression)")
    print("=" * 66)
    print(f"Train rows: {len(X_train):,}   Test rows: {len(X_test):,}")
    print(f"Target mean (train): {y_train.mean():.2f} h\n")

    # A naive predictor sets the bar every model must clear to justify itself.
    baseline_pred = np.full(len(y_test), y_train.mean())
    baseline = evaluate(y_test.to_numpy(), baseline_pred)
    print(f"{'Baseline (predict mean)':<28} MAE={baseline['mae']:.3f}  "
          f"RMSE={baseline['rmse']:.3f}  R2={baseline['r2']:.3f}")

    # The teacher's own estimate is the incumbent this product must beat.
    teacher_estimate = evaluate(y_test.to_numpy(), X_test["teacher_estimated_hours"].to_numpy())
    print(f"{'Teacher estimate as-is':<28} MAE={teacher_estimate['mae']:.3f}  "
          f"RMSE={teacher_estimate['rmse']:.3f}  R2={teacher_estimate['r2']:.3f}\n")

    results: dict[str, dict[str, float]] = {}
    fitted: dict[str, Pipeline] = {}

    for name, estimator in candidate_models().items():
        pipeline = Pipeline([("preprocess", build_preprocessor()), ("model", estimator)])
        pipeline.fit(X_train, y_train)
        metrics = evaluate(y_test.to_numpy(), pipeline.predict(X_test))
        results[name] = metrics
        fitted[name] = pipeline
        print(f"{name:<28} MAE={metrics['mae']:.3f}  "
              f"RMSE={metrics['rmse']:.3f}  R2={metrics['r2']:.3f}")

    # Lower MAE wins: it is the metric a teacher would intuitively check
    # ("how many hours out is this, typically?").
    best_name = min(results, key=lambda k: results[k]["mae"])
    best_metrics = results[best_name]

    print(f"\nSelected: {best_name}  (MAE {best_metrics['mae']:.3f} h)")
    print(f"Improvement over teacher estimate: "
          f"{(1 - best_metrics['mae'] / teacher_estimate['mae']):.1%} lower MAE")

    joblib.dump(fitted[best_name], COMPLETION_MODEL_PATH)
    print(f"Saved -> {COMPLETION_MODEL_PATH}")

    return {
        "model_type": best_name,
        "task": "regression",
        "metrics": best_metrics,
        "all_candidates": results,
        "baselines": {"predict_mean": baseline, "teacher_estimate": teacher_estimate},
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
    }


def _merge_metrics(payload: dict[str, Any]) -> None:
    """Persist metrics alongside any already recorded for the other model."""
    existing: dict[str, Any] = {}
    if METRICS_PATH.exists():
        existing = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    existing["completion_model"] = payload
    existing["data_source"] = "synthetic"
    METRICS_PATH.write_text(json.dumps(existing, indent=2), encoding="utf-8")


def main() -> None:
    summary = train()
    _merge_metrics(summary)
    print(f"Metrics recorded in {METRICS_PATH}")


if __name__ == "__main__":
    main()
