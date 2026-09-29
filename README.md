# AcadSync AI

**An Intelligent Academic Workload Management and Student Capacity Prediction System**

*Academic work, organized around real life.*

Multiple teachers assign work independently. None of them can see how much a student
is already carrying, how much time that student actually has, or whether the new work
realistically fits before the deadline. AcadSync AI makes that shared picture visible
to the teacher **before** the assignment is published — and leaves the decision with them.

---

## What is built

| Layer | Status | Location |
|---|---|---|
| React frontend (student / teacher / admin) | Complete | `src/` |
| Minimal context-aware UX (4-item nav, priority feed, global search) | Complete | `src/lib/`, `src/layouts/AppLayout.jsx` |
| Rule-based capacity engine | Complete, 20 tests | `backend/app/ml/capacity_engine.py` |
| Synthetic dataset generator | Complete, 8,000 rows | `backend/app/ml/training/generate_dataset.py` |
| Completion-time model (regression) | Trained | `backend/app/ml/training/train_completion_model.py` |
| Deadline-risk model (classification) | Trained | `backend/app/ml/training/train_deadline_model.py` |
| Recommendation engine (rule-based) | Complete | `backend/app/ml/recommendation_engine.py` |
| Hybrid intelligence engine | Complete | `backend/app/ml/academic_intelligence_engine.py` |
| FastAPI service | Complete, 7 endpoints | `backend/app/main.py` |
| Frontend ↔ backend integration | Complete, with fallback | `src/services/api.js` |

**58 tests pass** across the capacity engine, the trained models, and the API.

---

## Interface architecture

The app follows **show → prioritize → explore**. Navigation is four items on every
breakpoint — **Home, Search, Notifications, Profile** — and nothing else. The
sixteen screens that used to sit in sidebars still exist and are still reachable;
they moved behind three affordances:

| Where it went | What lives there |
|---|---|
| **Home** | Only what needs attention now: one priority card + up to 3 secondary rows |
| **Search** (⌘K) | Every screen, every record, and verb-style actions ("submit", "create work") |
| **Profile** | The "More" area — academic screens, preferences, help, sign out |
| **Contextual** | Rarely-used actions sit on the screen they apply to, behind "•••" |

### The priority engine

`src/lib/priority.js` scores everything competing for attention onto one scale and
Home renders only the top of it. The score is never shown; only its consequence is.

```
1. Overdue          6. Scheduled today
2. Due today        7. Upcoming
3. Due tomorrow     8. General updates
4. High risk
5. Action required
```

Workload pressure is injected as its own activity rather than a permanent widget —
it earns a place on Home only when the week genuinely does not fit.

### Search as navigation

Because the sidebar was cut, `src/lib/searchIndex.js` carries the weight. It indexes
destinations, actions, and live records, and ranks destinations and actions *above*
records — someone typing "availability" wants the screen, not a record mentioning it.
Recent searches persist per browser via `localStorage`.

Typing `availability` returns:

```
GO TO     My availability      The hours you can realistically work
ACTIONS   Edit working hours   Change when you are available
```

### Verified, not assumed

`npm run ux-audit` checks the redesign against its own rules: that all **27
pre-existing routes still render**, that the rail is 4 items, that Home never
exceeds one priority card plus three rows, that search resolves relocated features,
and that mobile has 4 tabs with no horizontal overflow at 375px.

---

## Running it

Two processes. The frontend works on its own; the backend adds the predictions.

```bash
# 1. Frontend  (http://localhost:5173)
npm install
npm run dev

# 2. Backend   (http://localhost:8000, docs at /docs)
cd backend
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
uvicorn app.main:app --reload --port 8000
```

To rebuild the models from scratch:

```bash
cd backend
python -m app.ml.training.generate_dataset       # writes the CSV, validates it
python -m app.ml.training.explore_dataset        # statistics + plots
python -m app.ml.training.preprocess             # verifies the feature pipeline
python -m app.ml.training.train_completion_model # trains + saves + records metrics
python -m app.ml.training.train_deadline_model
python -m pytest -q                              # 58 tests
```

---

## How the intelligence works

The system is **hybrid** by design: a transparent rule engine that a teacher can
verify by hand, informed by two models that adjust its inputs.

```
teacher drafts assignment
          │
          ▼
┌─────────────────────┐     ┌──────────────────────────┐
│ RULE ENGINE         │     │ ML ENGINE                │
│ capacity arithmetic │◄────│ predicted completion time │
│                     │     │ deadline risk probability │
└──────────┬──────────┘     └──────────────┬───────────┘
           └────────────┬──────────────────┘
                        ▼
           HYBRID INTELLIGENCE ENGINE
                        ▼
             RECOMMENDATION ENGINE
                        ▼
              teacher decides
```

The pivot is one substitution. The capacity calculation is:

```
remaining_capacity        = available_hours − existing_pending_hours
capacity_after_assignment = remaining_capacity − new_assignment_hours
```

…and `new_assignment_hours` is **the model's prediction for that specific student**,
not the teacher's flat estimate. A 2-hour task is not a 2-hour task for everyone.

### Worked example (real output from the running service)

Dharun: 5 h available, 3 h already pending, teacher estimates 2 h for a Hard assignment.

| | Rule-only | Hybrid |
|---|---|---|
| Hours charged | 2.0 (the estimate) | **4.14 (predicted)** |
| Capacity after | 0.0 | **−2.14** |
| Verdict | MODERATE | **HIGH RISK** |
| Late probability | — | **69%** |

The rule-only path says he just fits. The hybrid path says he does not. That gap is the product.

---

## Measured model performance

Real numbers from the held-out 20% test split. They are written to
`backend/app/ml/models/model_metrics.json` by the training scripts and read live by
the UI (Admin → System Settings), so nothing displayed is hand-typed.

**Completion time** — `GradientBoostingRegressor`

| Metric | Value |
|---|---|
| MAE | **0.592 h** |
| RMSE | 0.884 h |
| R² | 0.873 |

Context: predicting the training mean scores MAE 1.820 h; using the teacher's own
estimate scores MAE 1.293 h. The model is **54% closer** than the estimate it replaces.

**Deadline risk** — `LogisticRegression` (class-weighted)

| Metric | Value |
|---|---|
| Accuracy | 0.884 |
| Precision | 0.713 |
| Recall | **0.900** |
| F1 | 0.796 |
| ROC-AUC | 0.958 |

Majority-class accuracy is 0.749, so accuracy alone is not meaningful here — selection
used F1 on the late class. Of 402 genuinely late submissions in the test set the model
flags 362, at the cost of 146 false alarms. For this product that trade is the right way
round: a missed at-risk student is worse than one extra name for a teacher to glance at.

### Honest caveats

- **The models are trained on synthetic data.** They demonstrate the architecture and
  the prediction pipeline. They are not validated against real student behaviour.
- **The classifier's scores are optimistic by construction.** The dataset generator
  produces lateness from a logistic function, so a logistic model is matched to the
  true data-generating process. On real data, expect materially worse — and expect a
  tree model to compete better than it does here.
- Real deployment requires historical assignment and submission records for retraining
  and validation before any of these numbers should be quoted.

This is a **decision-support system**, not an automated one. It never changes a
deadline, rescopes work, alters marks, or reassigns anything. Every payload it returns
carries `decision_authority: "teacher"`.

---

## API

Interactive docs at `http://localhost:8000/docs`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/analyze/class` | Full analysis of a class against a draft assignment |
| POST | `/api/analyze/student` | Full analysis for one student |
| POST | `/api/predict/completion-time` | Regression only |
| POST | `/api/predict/deadline-risk` | Classification only |
| POST | `/api/capacity` | Rule engine only — needs no trained models |
| GET | `/api/models/info` | Measured metrics from the last training run |
| GET | `/api/health` | Service and artefact status |

### Graceful degradation

If the backend is down, the teacher's capacity screen falls back to the local
rule-based simulation and **labels itself** "Rule-based simulation" instead of
"ML-backed analysis". The prototype stays fully explorable with no backend running.

---

## Dataset

`backend/app/ml/data/student_assignment_dataset.csv` — 8,000 assignment records across
400 simulated students, generated with a fixed seed.

The generator is not random noise. Each student carries a persistent latent **pace
factor** that shows up across all their assignments, and completion time is built as:

```
teacher_estimate × difficulty × assignment_type × student_pace × workload_pressure × noise
```

Lateness then follows causally from the work not fitting the available time. The
generator refuses to write the file if validation fails — during development it
correctly rejected a run at 19.9% late submissions as too imbalanced to train on.

Observed relationships: Hard assignments average 5.7 h against Easy at 2.3 h; the late
rate rises from 13% (Easy) to 38% (Hard); the class-wide overrun against the teacher's
estimate is 1.35×.

---

## Project structure

```
std/
├── src/                      # React frontend
│   ├── lib/
│   │   ├── priority.js       # what surfaces on Home, and in what order
│   │   └── searchIndex.js    # global search: destinations, actions, records
│   ├── layouts/AppLayout.jsx # 4-item shell (Home / Search / Alerts / Profile)
│   ├── components/
│   │   ├── HomeFeed.jsx      # PriorityCard, ActivityCard, AttentionCard
│   │   ├── GlobalSearch.jsx  # command palette (Cmd/Ctrl+K)
│   │   ├── menus.jsx         # ContextMenu, ProfileMenu
│   │   └── ModelInfoCard.jsx
│   └── services/api.js       # backend client + shape adapters
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── routers/          # endpoints
│   │   ├── schemas/          # Pydantic contracts
│   │   └── ml/
│   │       ├── config.py     # every threshold, in one place
│   │       ├── capacity_engine.py
│   │       ├── recommendation_engine.py
│   │       ├── academic_intelligence_engine.py
│   │       ├── class_analysis.py
│   │       ├── data/         # generated CSV
│   │       ├── models/       # .pkl artefacts + metrics.json
│   │       ├── reports/      # exploration plots
│   │       ├── training/     # generate / explore / preprocess / train
│   │       ├── prediction/   # model loading and inference
│   │       └── tests/        # 58 tests
│   └── requirements.txt
└── tools/                    # screenshot + e2e harnesses
```

**Note on layout:** the brief specifies `acadsync-ai/frontend` and `acadsync-ai/backend`
as siblings. The frontend already occupied the repository root, so the backend was added
at `backend/` rather than relocating a working frontend mid-project. The separation is
the same; only the nesting differs.

---

## Thresholds

All configurable in `backend/app/ml/config.py`.

| Setting | Value | Meaning |
|---|---|---|
| `CAPACITY_SAFE_THRESHOLD` | 2.0 h | Spare hours after the assignment to count as SAFE |
| `CAPACITY_MODERATE_THRESHOLD` | 0.0 h | Below this the work does not fit |
| `RISK_LOW_MAX` | 0.30 | Late probability ≤ this is LOW |
| `RISK_MODERATE_MAX` | 0.60 | Late probability ≤ this is MODERATE |
