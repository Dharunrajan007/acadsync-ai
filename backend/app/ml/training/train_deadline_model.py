"""Phase 6 — deadline-risk prediction model (classification).

Predicts the probability that a student submits a given assignment late. The
probability, not the hard label, is what the product uses: a teacher deciding
whether to move a deadline needs "how likely", not a yes/no.

The classes are imbalanced (roughly one late submission in four), so:
  * accuracy alone is explicitly not trusted — a model predicting "never late"
    would score ~75% and be useless;
  * ``class_weight="balanced"`` is used where the estimator supports it;
  * selection is on F1 for the late class, which balances catching real risk
    against crying wolf.

Run:
    python -m app.ml.training.train_deadline_model
"""

from __future__ import annotations

import json
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from ..config import DEADLINE_MODEL_PATH, METRICS_PATH, RANDOM_SEED, TEST_SIZE
from .preprocess import build_preprocessor, load_dataset, prepare_deadline_dataset


def candidate_models() -> dict[str, Any]:
    """Candidates to compare. All are class-weighted where supported."""
    return {
        "LogisticRegression": LogisticRegression(
            max_iter=1000, class_weight="balanced", random_state=RANDOM_SEED
        ),
        "RandomForestClassifier": RandomForestClassifier(
            n_estimators=400,
            max_depth=14,
            min_samples_leaf=3,
            class_weight="balanced",
            random_state=RANDOM_SEED,
            n_jobs=-1,
        ),
        # GradientBoosting has no class_weight; it compensates through boosting.
        "GradientBoostingClassifier": GradientBoostingClassifier(
            n_estimators=300, learning_rate=0.06, max_depth=4, random_state=RANDOM_SEED
        ),
    }


def evaluate(y_true: np.ndarray, y_pred: np.ndarray, y_proba: np.ndarray) -> dict[str, Any]:
    """Compute the classification metrics named in the brief, plus ROC-AUC."""
    matrix = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = matrix.ravel()
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_true, y_proba)), 4),
        "confusion_matrix": {
            "true_negative": int(tn), "false_positive": int(fp),
            "false_negative": int(fn), "true_positive": int(tp),
        },
    }


def train() -> dict[str, Any]:
    """Train, compare, select and persist the deadline-risk classifier."""
    frame = load_dataset()
    data = prepare_deadline_dataset(frame)

    X_train, X_test, y_train, y_test = train_test_split(
        data.X, data.y, test_size=TEST_SIZE, random_state=RANDOM_SEED, stratify=data.y
    )

    print("=" * 66)
    print("PHASE 6 — DEADLINE RISK PREDICTION (classification)")
    print("=" * 66)
    print(f"Train rows: {len(X_train):,}   Test rows: {len(X_test):,}")
    print(f"Positive class (late) share: train {y_train.mean():.1%}, test {y_test.mean():.1%}")
    print(f"Majority-class accuracy to beat: {max(1 - y_test.mean(), y_test.mean()):.1%}\n")

    results: dict[str, dict[str, Any]] = {}
    fitted: dict[str, Pipeline] = {}

    for name, estimator in candidate_models().items():
        pipeline = Pipeline([("preprocess", build_preprocessor()), ("model", estimator)])
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        y_proba = pipeline.predict_proba(X_test)[:, 1]
        metrics = evaluate(y_test.to_numpy(), y_pred, y_proba)
        results[name] = metrics
        fitted[name] = pipeline
        print(f"{name:<30} acc={metrics['accuracy']:.3f}  prec={metrics['precision']:.3f}  "
              f"rec={metrics['recall']:.3f}  F1={metrics['f1']:.3f}  AUC={metrics['roc_auc']:.3f}")

    # F1 on the late class, not accuracy: the majority-class trap is real here.
    best_name = max(results, key=lambda k: results[k]["f1"])
    best = results[best_name]
    matrix = best["confusion_matrix"]

    print(f"\nSelected: {best_name}  (F1 {best['f1']:.3f} on the late class)")
    print("\nConfusion matrix (rows = actual, cols = predicted):")
    print(f"                 pred on-time   pred late")
    print(f"  actual on-time  {matrix['true_negative']:>10}  {matrix['false_positive']:>10}")
    print(f"  actual late     {matrix['false_negative']:>10}  {matrix['true_positive']:>10}")
    print(f"\n  Of {matrix['false_negative'] + matrix['true_positive']} genuinely late submissions, "
          f"the model flags {matrix['true_positive']}.")
    print(f"  It raises {matrix['false_positive']} false alarms on work that arrived on time.")

    joblib.dump(fitted[best_name], DEADLINE_MODEL_PATH)
    print(f"\nSaved -> {DEADLINE_MODEL_PATH}")

    return {
        "model_type": best_name,
        "task": "binary_classification",
        "positive_class": "submitted_late",
        "metrics": best,
        "all_candidates": results,
        "majority_class_accuracy": round(float(max(1 - y_test.mean(), y_test.mean())), 4),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
    }


def _merge_metrics(payload: dict[str, Any]) -> None:
    existing: dict[str, Any] = {}
    if METRICS_PATH.exists():
        existing = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    existing["deadline_model"] = payload
    existing["data_source"] = "synthetic"
    METRICS_PATH.write_text(json.dumps(existing, indent=2), encoding="utf-8")


def main() -> None:
    summary = train()
    _merge_metrics(summary)
    print(f"Metrics recorded in {METRICS_PATH}")


if __name__ == "__main__":
    main()
