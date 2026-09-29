"""Phase 4 — preprocessing.

Both models share one preprocessing definition, built with ColumnTransformer and
wrapped in a Pipeline. That matters more than it looks: the exact same
transformation has to be applied at training time and at prediction time, and the
only reliable way to guarantee that is to persist the fitted transformer inside
the model artefact rather than re-deriving it by hand in the serving code.

Run:
    python -m app.ml.training.preprocess
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ..config import (
    CATEGORICAL_FEATURES,
    DATASET_PATH,
    FEATURE_COLUMNS,
    NUMERICAL_FEATURES,
    TARGET_COMPLETION,
    TARGET_LATE,
)


@dataclass
class Dataset:
    """A feature matrix and its target, ready to be split and fitted."""

    X: pd.DataFrame
    y: pd.Series
    name: str


def load_dataset(path=DATASET_PATH) -> pd.DataFrame:
    """Read the CSV produced in Phase 2."""
    if not path.exists():
        raise FileNotFoundError(
            f"{path} not found. Run `python -m app.ml.training.generate_dataset` first."
        )
    return pd.read_csv(path)


def build_preprocessor() -> ColumnTransformer:
    """Assemble the shared feature transformer.

    Categorical columns are one-hot encoded with ``handle_unknown="ignore"`` so
    that a subject or assignment type the model never saw during training cannot
    crash a live prediction — it simply contributes nothing, which is the correct
    degradation for a decision-support tool.

    Numerical columns are median-imputed and scaled. Trees do not need scaling,
    but the linear and logistic baselines this is compared against do, and one
    shared preprocessor keeps the comparison honest.
    """
    categorical = Pipeline(
        steps=[
            ("impute", SimpleImputer(strategy="most_frequent")),
            ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )
    numerical = Pipeline(
        steps=[
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("cat", categorical, CATEGORICAL_FEATURES),
            ("num", numerical, NUMERICAL_FEATURES),
        ],
        remainder="drop",
    )


def prepare_completion_dataset(frame: pd.DataFrame) -> Dataset:
    """Dataset A — regression target: how long the work actually took."""
    X = frame[FEATURE_COLUMNS].copy()
    y = frame[TARGET_COMPLETION].astype(float)
    return Dataset(X=X, y=y, name="completion_time")


def prepare_deadline_dataset(frame: pd.DataFrame) -> Dataset:
    """Dataset B — classification target: was the work handed in late.

    ``Yes``/``No`` is mapped to 1/0 so that the positive class is "late", which
    is the event the product needs recall on.
    """
    X = frame[FEATURE_COLUMNS].copy()
    y = frame[TARGET_LATE].map({"Yes": 1, "No": 0}).astype(int)

    if y.isna().any():
        raise ValueError(f"{TARGET_LATE} contains values outside Yes/No")
    return Dataset(X=X, y=y, name="deadline_risk")


def describe_features() -> None:
    """Print the feature contract so it is visible in the training logs."""
    print(f"Categorical features ({len(CATEGORICAL_FEATURES)}): {', '.join(CATEGORICAL_FEATURES)}")
    print(f"Numerical features   ({len(NUMERICAL_FEATURES)}): {', '.join(NUMERICAL_FEATURES)}")


def main() -> None:
    frame = load_dataset()
    describe_features()

    completion = prepare_completion_dataset(frame)
    deadline = prepare_deadline_dataset(frame)

    preprocessor = build_preprocessor()
    transformed = preprocessor.fit_transform(completion.X)

    print(f"\nDataset A (completion) : X={completion.X.shape}, y={completion.y.shape}")
    print(f"Dataset B (deadline)   : X={deadline.X.shape}, y={deadline.y.shape}")
    print(f"Encoded feature width  : {transformed.shape[1]} columns after one-hot encoding")
    print(f"Class balance (late=1) : {deadline.y.mean():.1%} positive")
    print("\nPreprocessing pipeline builds cleanly.")


if __name__ == "__main__":
    main()
