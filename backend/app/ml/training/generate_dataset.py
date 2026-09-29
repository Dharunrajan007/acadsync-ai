"""Phase 2 — synthetic dataset generation.

There is no historical AcadSync data yet, so the models are bootstrapped on
simulated records. The point is NOT to invent numbers that look plausible in a
spreadsheet; it is to encode the causal story the product claims, so that a model
trained here learns the relationships the product is actually asserting:

    * harder and larger work takes longer than the teacher's estimate
    * a student already carrying a lot of work slows down further
    * students have a persistent personal pace that shows up across assignments
    * lateness follows from the work not fitting in the time available

Each student is given a stable latent profile (pace, reliability) that persists
across all of their assignments, because a model trained on rows where every
record is independently random would have nothing real to learn.

Run:
    python -m app.ml.training.generate_dataset
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from ..config import (
    ASSIGNMENT_TYPES,
    DATASET_PATH,
    DIFFICULTIES,
    DIFFICULTY_MULTIPLIER,
    N_RECORDS,
    N_STUDENTS,
    RANDOM_SEED,
    SUBJECTS,
    TYPE_MULTIPLIER,
)


def _build_student_profiles(rng: np.random.Generator, n_students: int) -> pd.DataFrame:
    """Give every student a persistent working profile.

    `pace_factor` is the heart of the simulation: how long this student takes
    relative to a teacher's estimate. Someone at 1.35 consistently overruns;
    someone at 0.8 is consistently quick. Reliability is derived from pace with
    noise, so that slower students are somewhat more likely to have a history of
    lateness — without that being a perfect, trivially learnable rule.
    """
    pace = rng.lognormal(mean=0.0, sigma=0.22, size=n_students).clip(0.62, 1.9)

    # Reliability falls as pace rises, plus genuine individual variation.
    # Centred well below 1.0 so the feature spans a usable range: an earlier
    # version centred at ~1.05 and clipped, leaving the column almost constant
    # and therefore useless to the classifier.
    reliability = (0.88 - 0.34 * (pace - 1.0) + rng.normal(0, 0.10, n_students)).clip(0.45, 0.99)

    # Past lateness is a count, driven by reliability.
    late_lambda = (1.0 - reliability) * 6.0
    previous_late = rng.poisson(late_lambda).clip(0, 9)

    return pd.DataFrame(
        {
            "student_id": [f"S{i + 1:04d}" for i in range(n_students)],
            "pace_factor": pace,
            "previous_completion_rate": reliability.round(3),
            "previous_late_submissions": previous_late,
        }
    )


def generate_dataset(
    n_records: int = N_RECORDS,
    n_students: int = N_STUDENTS,
    seed: int = RANDOM_SEED,
) -> pd.DataFrame:
    """Generate the assignment-level dataset used to train both models.

    Args:
        n_records: Number of assignment rows to simulate.
        n_students: Size of the simulated student body.
        seed: Seed so the dataset is reproducible run to run.

    Returns:
        A dataframe with the feature columns, plus both targets
        (``actual_completion_hours`` and ``submitted_late``).
    """
    rng = np.random.default_rng(seed)
    profiles = _build_student_profiles(rng, n_students)

    idx = rng.integers(0, n_students, size=n_records)
    student = profiles.iloc[idx].reset_index(drop=True)

    subject = rng.choice(SUBJECTS, size=n_records)
    assignment_type = rng.choice(
        ASSIGNMENT_TYPES, size=n_records, p=[0.32, 0.22, 0.20, 0.14, 0.12]
    )
    difficulty = rng.choice(DIFFICULTIES, size=n_records, p=[0.30, 0.45, 0.25])

    # Teacher estimates cluster at whole/half hours the way real ones do.
    teacher_estimated_hours = rng.choice(
        [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0],
        size=n_records,
        p=[0.05, 0.16, 0.16, 0.22, 0.13, 0.14, 0.09, 0.05],
    )
    # Harder work is set with a bigger estimate too.
    diff_bump = np.select(
        [difficulty == "Hard", difficulty == "Medium"], [1.0, 0.5], default=0.0
    )
    teacher_estimated_hours = (teacher_estimated_hours + diff_bump).clip(0.5, 8.0)

    number_of_pending_assignments = rng.poisson(2.8, n_records).clip(0, 9)
    # Pending hours follow from how many things are outstanding.
    existing_pending_hours = (
        number_of_pending_assignments * rng.uniform(0.6, 2.4, n_records)
    ).round(2)

    hours_until_deadline = rng.choice(
        [6, 12, 24, 36, 48, 72, 120], size=n_records, p=[0.08, 0.14, 0.26, 0.14, 0.18, 0.14, 0.06]
    ).astype(float)

    # A student can only realistically use a fraction of the calendar window:
    # sleep, classes, travel, everything else. That fraction varies per student.
    usable_fraction = rng.uniform(0.10, 0.30, n_records)
    available_hours = (hours_until_deadline * usable_fraction).clip(0.5, 26).round(2)

    pace = student["pace_factor"].to_numpy()
    prev_rate = student["previous_completion_rate"].to_numpy()
    prev_late = student["previous_late_submissions"].to_numpy()

    # A student's historical average completion time, as the platform would have
    # recorded it: their pace applied to a typical 2-hour task.
    average_previous_completion_hours = (2.0 * pace + rng.normal(0, 0.18, n_records)).clip(0.5, 7.0).round(2)

    # ---- Target 1: how long the work actually takes ------------------------
    # Estimate, adjusted for difficulty, kind of work, and the student's pace,
    # then degraded further when the student is already loaded up.
    diff_mult = np.array([DIFFICULTY_MULTIPLIER[d] for d in difficulty])
    type_mult = np.array([TYPE_MULTIPLIER[t] for t in assignment_type])

    # Being busy costs time: context switching, fatigue, fragmented sessions.
    workload_pressure = 1.0 + 0.045 * number_of_pending_assignments

    actual_completion_hours = (
        teacher_estimated_hours * diff_mult * type_mult * pace * workload_pressure
    )
    # Multiplicative noise keeps the spread realistic at every scale.
    actual_completion_hours *= rng.lognormal(0.0, 0.17, n_records)
    actual_completion_hours = actual_completion_hours.clip(0.25, 20).round(2)

    # ---- Target 2: was it handed in late -----------------------------------
    # Lateness is driven by the work not fitting the time, which is exactly the
    # relationship the product claims to detect.
    time_deficit = actual_completion_hours - available_hours

    risk_score = (
        1.15 * time_deficit                      # the dominant cause
        + 0.30 * (existing_pending_hours / 5.0)  # competing commitments
        + 0.22 * prev_late                       # habit and circumstance
        - 2.10 * prev_rate                       # reliability protects
        - 0.012 * hours_until_deadline           # a longer runway absorbs overrun
        + 0.35 * (difficulty == "Hard")
        + rng.normal(0, 0.75, n_records)         # everything unmodelled
    )
    # Intercept tuned so the classes land in a usable, non-degenerate balance.
    late_probability = 1.0 / (1.0 + np.exp(-(risk_score + 1.15)))
    submitted_late = np.where(rng.uniform(0, 1, n_records) < late_probability, "Yes", "No")

    frame = pd.DataFrame(
        {
            "student_id": student["student_id"],
            "assignment_id": [f"A{i + 1:05d}" for i in range(n_records)],
            "subject": subject,
            "assignment_type": assignment_type,
            "difficulty": difficulty,
            "teacher_estimated_hours": teacher_estimated_hours.round(2),
            "available_hours": available_hours,
            "existing_pending_hours": existing_pending_hours,
            "number_of_pending_assignments": number_of_pending_assignments,
            "hours_until_deadline": hours_until_deadline,
            "previous_completion_rate": prev_rate,
            "previous_late_submissions": prev_late,
            "average_previous_completion_hours": average_previous_completion_hours,
            "actual_completion_hours": actual_completion_hours,
            "submitted_late": submitted_late,
        }
    )
    return frame


def validate_dataset(frame: pd.DataFrame) -> list[str]:
    """Check the generated data before it is allowed to train anything.

    Returns a list of problems; an empty list means the dataset is usable.
    """
    problems: list[str] = []

    missing = frame.isna().sum()
    if missing.any():
        problems.append(f"missing values present: {missing[missing > 0].to_dict()}")

    if (frame["actual_completion_hours"] <= 0).any():
        problems.append("non-positive completion hours found")
    if (frame["available_hours"] < 0).any():
        problems.append("negative available hours found")
    if not frame["previous_completion_rate"].between(0, 1).all():
        problems.append("previous_completion_rate outside 0-1")

    late_share = (frame["submitted_late"] == "Yes").mean()
    if not 0.20 <= late_share <= 0.55:
        problems.append(f"late class share {late_share:.1%} is outside the usable 20-55% band")

    # The core relationship must survive the noise, or the models have nothing
    # to learn and the dataset is not doing its job.
    corr = frame["teacher_estimated_hours"].corr(frame["actual_completion_hours"])
    if corr < 0.5:
        problems.append(f"estimate/actual correlation too weak ({corr:.2f})")

    return problems


def describe(frame: pd.DataFrame) -> None:
    """Print the dataset statistics the brief asks for."""
    late = (frame["submitted_late"] == "Yes").sum()
    print("\n" + "=" * 62)
    print("DATASET SUMMARY")
    print("=" * 62)
    print(f"Total records                : {len(frame):,}")
    print(f"Unique students              : {frame['student_id'].nunique():,}")
    print(f"Unique assignments           : {frame['assignment_id'].nunique():,}")
    print(f"Late submissions             : {late:,} ({late / len(frame):.1%})")
    print(f"On-time submissions          : {len(frame) - late:,} ({1 - late / len(frame):.1%})")
    print(f"Mean teacher estimate (h)    : {frame['teacher_estimated_hours'].mean():.2f}")
    print(f"Mean actual completion (h)   : {frame['actual_completion_hours'].mean():.2f}")
    print(f"Median actual completion (h) : {frame['actual_completion_hours'].median():.2f}")
    print(f"Overrun vs estimate          : "
          f"{(frame['actual_completion_hours'] / frame['teacher_estimated_hours']).mean():.2f}x")
    print(f"Estimate/actual correlation  : "
          f"{frame['teacher_estimated_hours'].corr(frame['actual_completion_hours']):.3f}")

    print("\nMean completion hours by difficulty:")
    print(frame.groupby("difficulty", observed=True)["actual_completion_hours"].mean().round(2).to_string())

    print("\nLate rate by difficulty:")
    print(
        frame.assign(late=frame["submitted_late"].eq("Yes"))
        .groupby("difficulty", observed=True)["late"]
        .mean()
        .mul(100)
        .round(1)
        .to_string()
    )
    print("=" * 62 + "\n")


def main() -> None:
    frame = generate_dataset()
    problems = validate_dataset(frame)

    describe(frame)

    if problems:
        print("VALIDATION FAILED:")
        for problem in problems:
            print(f"  - {problem}")
        raise SystemExit(1)

    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(DATASET_PATH, index=False)
    print(f"Validation passed. Written to {DATASET_PATH}")


if __name__ == "__main__":
    main()
