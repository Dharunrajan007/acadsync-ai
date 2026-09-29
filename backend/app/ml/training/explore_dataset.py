"""Phase 3 — dataset exploration.

Prints the summary statistics required by the brief and writes a small set of
plots to ``app/ml/reports``. Exploration runs before preprocessing so that any
problem with the generated data is caught while it is still cheap to fix.

Run:
    python -m app.ml.training.explore_dataset
"""

from __future__ import annotations

import matplotlib

# Non-interactive backend: this runs headless in a terminal, not in a notebook.
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd

from ..config import DATASET_PATH, REPORT_DIR, TARGET_COMPLETION, TARGET_LATE

PLOT_COLOR = "#4444D6"
ACCENT_COLOR = "#C3820B"


def load_dataset(path=DATASET_PATH) -> pd.DataFrame:
    """Load the generated dataset, failing loudly if Phase 2 has not been run."""
    if not path.exists():
        raise FileNotFoundError(
            f"{path} not found. Run `python -m app.ml.training.generate_dataset` first."
        )
    return pd.read_csv(path)


def print_overview(frame: pd.DataFrame) -> None:
    """Print the record counts and target distributions the brief asks for."""
    late = (frame[TARGET_LATE] == "Yes").sum()
    on_time = len(frame) - late

    print("=" * 62)
    print("DATASET EXPLORATION")
    print("=" * 62)
    print(f"Total records          : {len(frame):,}")
    print(f"Total students         : {frame['student_id'].nunique():,}")
    print(f"Total assignments      : {frame['assignment_id'].nunique():,}")
    print(f"Late submissions       : {late:,} ({late / len(frame):.1%})")
    print(f"On-time submissions    : {on_time:,} ({on_time / len(frame):.1%})")
    print(f"Average completion (h) : {frame[TARGET_COMPLETION].mean():.2f}")
    print(f"Median completion (h)  : {frame[TARGET_COMPLETION].median():.2f}")
    print(f"Std deviation (h)      : {frame[TARGET_COMPLETION].std():.2f}")

    print("\n--- Missing values ---")
    missing = frame.isna().sum()
    print("None" if not missing.any() else missing[missing > 0].to_string())

    print("\n--- Column types ---")
    print(frame.dtypes.to_string())

    print("\n--- Difficulty distribution ---")
    print(frame["difficulty"].value_counts().to_string())

    print("\n--- Assignment type distribution ---")
    print(frame["assignment_type"].value_counts().to_string())

    print("\n--- Mean completion hours by difficulty ---")
    print(frame.groupby("difficulty", observed=True)[TARGET_COMPLETION].mean().round(2).to_string())

    print("\n--- Late rate by number of pending assignments ---")
    late_by_pending = (
        frame.assign(late=frame[TARGET_LATE].eq("Yes"))
        .groupby("number_of_pending_assignments", observed=True)["late"]
        .agg(["mean", "size"])
    )
    late_by_pending["mean"] = (late_by_pending["mean"] * 100).round(1)
    print(late_by_pending.rename(columns={"mean": "late_%", "size": "n"}).to_string())

    print("\n--- Numeric feature ranges ---")
    numeric = frame.select_dtypes("number")
    print(numeric.describe().T[["min", "mean", "max"]].round(2).to_string())
    print("=" * 62)


def plot_distributions(frame: pd.DataFrame) -> list[str]:
    """Write exploratory plots and return the file names produced."""
    written: list[str] = []

    # 1. Completion time distribution.
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.hist(frame[TARGET_COMPLETION], bins=45, color=PLOT_COLOR, alpha=0.85)
    ax.set_title("Distribution of actual completion hours")
    ax.set_xlabel("Hours")
    ax.set_ylabel("Assignments")
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(REPORT_DIR / "completion_hours_distribution.png", dpi=120)
    plt.close(fig)
    written.append("completion_hours_distribution.png")

    # 2. Estimate vs actual — the relationship the regressor has to learn.
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.scatter(
        frame["teacher_estimated_hours"], frame[TARGET_COMPLETION],
        s=6, alpha=0.18, color=PLOT_COLOR,
    )
    lim = frame["teacher_estimated_hours"].max()
    ax.plot([0, lim], [0, lim], color=ACCENT_COLOR, linewidth=2, label="estimate = actual")
    ax.set_title("Teacher estimate vs actual completion time")
    ax.set_xlabel("Teacher estimate (h)")
    ax.set_ylabel("Actual (h)")
    ax.legend(frameon=False)
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(REPORT_DIR / "estimate_vs_actual.png", dpi=120)
    plt.close(fig)
    written.append("estimate_vs_actual.png")

    # 3. Late rate by difficulty.
    fig, ax = plt.subplots(figsize=(6, 4))
    rates = (
        frame.assign(late=frame[TARGET_LATE].eq("Yes"))
        .groupby("difficulty", observed=True)["late"].mean().mul(100)
        .reindex(["Easy", "Medium", "Hard"])
    )
    ax.bar(rates.index, rates.to_numpy(), color=[PLOT_COLOR, ACCENT_COLOR, "#D14343"], width=0.55)
    for i, v in enumerate(rates.to_numpy()):
        ax.text(i, v + 0.6, f"{v:.1f}%", ha="center", fontsize=10, fontweight="bold")
    ax.set_title("Late submission rate by difficulty")
    ax.set_ylabel("Late (%)")
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(REPORT_DIR / "late_rate_by_difficulty.png", dpi=120)
    plt.close(fig)
    written.append("late_rate_by_difficulty.png")

    # 4. Available hours split by outcome — the core product hypothesis.
    fig, ax = plt.subplots(figsize=(7, 4))
    for label, colour in (("No", "#10906B"), ("Yes", "#D14343")):
        subset = frame.loc[frame[TARGET_LATE] == label, "available_hours"]
        ax.hist(subset, bins=35, alpha=0.6, label=f"submitted late: {label}", color=colour)
    ax.set_title("Available hours by submission outcome")
    ax.set_xlabel("Available hours")
    ax.set_ylabel("Assignments")
    ax.legend(frameon=False)
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(REPORT_DIR / "available_hours_by_outcome.png", dpi=120)
    plt.close(fig)
    written.append("available_hours_by_outcome.png")

    return written


def main() -> None:
    frame = load_dataset()
    print_overview(frame)
    written = plot_distributions(frame)
    print(f"\nPlots written to {REPORT_DIR}:")
    for name in written:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
