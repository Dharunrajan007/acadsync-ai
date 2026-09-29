import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Sparkles, Loader2, Save, Send, PencilLine, TriangleAlert,
  CalendarClock, Scissors, Shuffle, Clock, Check, Users,
} from 'lucide-react'
import {
  Card, PageHeader, SectionHeader, Badge, WorkloadBadge, InlineAlert, StatCard,
  ConfirmationDialog, Avatar,
} from '../../components/ui'
import { AIInsightCard } from '../../components/cards'
import { ChartCard, DistributionBar, PALETTE, BarList } from '../../components/charts'
import { analyseCapacity } from '../../data/students'
import { buildRecommendations } from '../../data/teacherData'
import { subjects } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import { students as roster } from '../../data/students'
import { analyzeClass, toAnalysisView, toAssignmentPayload, toStudentPayload } from '../../services/api'
import Lottie from '../../components/Lottie'

const FORMATS = ['PDF', 'DOCX', 'PPTX', 'ZIP', 'Other']
const REC_ICON = { calendar: CalendarClock, scissors: Scissors, shuffle: Shuffle, clock: Clock, check: Check }

const emptyDraft = {
  title: 'Machine Learning Classification Assignment',
  subject: 'Machine Learning',
  className: 'Semester 5 · Section A',
  description: 'Train and evaluate a supervised classification model on the shared dataset, comparing at least two algorithms.',
  instructions: 'Perform exploratory analysis\nTrain two classifiers and compare them\nReport accuracy, precision, recall and F1\nSubmit the report and the notebook',
  estimatedHours: 2,
  difficulty: 'Hard',
  deadlineDate: '2026-09-05',
  deadlineTime: '23:59',
  marks: 20,
  formats: ['PDF', 'ZIP'],
}

export default function CreateAssignment() {
  const navigate = useNavigate()
  const { createAssignment, showToast } = useApp()

  const [step, setStep] = useState('form') // form | analysing | analysis
  const [draft, setDraft] = useState(emptyDraft)
  const [chosen, setChosen] = useState(null)
  const [confirm, setConfirm] = useState(null)
  // Filled from the ML backend when it is reachable; null means we fell back
  // to the local rule-only simulation.
  const [mlAnalysis, setMlAnalysis] = useState(null)
  const [mlError, setMlError] = useState(null)

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const toggleFormat = (f) =>
    setDraft((d) => ({ ...d, formats: d.formats.includes(f) ? d.formats.filter((x) => x !== f) : [...d.formats, f] }))

  const localAnalysis = useMemo(
    () => analyseCapacity(Number(draft.estimatedHours) || 1),
    [draft.estimatedHours]
  )
  // The ML result supersedes the local simulation whenever it is available.
  const analysis = mlAnalysis ?? localAnalysis

  const deadlineLabel = useMemo(() => {
    if (!draft.deadlineDate) return 'Not scheduled'
    const [y, m, d] = draft.deadlineDate.split('-').map(Number)
    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]
    const [hh, mm] = (draft.deadlineTime || '23:59').split(':').map(Number)
    const period = hh >= 12 ? 'PM' : 'AM'
    const h12 = hh % 12 === 0 ? 12 : hh % 12
    return `${month} ${d} · ${h12}:${String(mm).padStart(2, '0')} ${period}`
  }, [draft.deadlineDate, draft.deadlineTime])

  const runAnalysis = async () => {
    setStep('analysing')
    setMlAnalysis(null)
    setMlError(null)

    // Hours between now and the chosen deadline — the models need the real
    // runway, not just the estimate.
    const deadline = new Date(`${draft.deadlineDate}T${draft.deadlineTime || '23:59'}`)
    const hoursUntilDeadline = Math.max(
      1,
      Math.round((deadline.getTime() - Date.now()) / 36e5) || 24
    )

    const started = Date.now()
    const result = await analyzeClass(
      toAssignmentPayload(draft, hoursUntilDeadline),
      roster.map(toStudentPayload)
    )

    if (result.ok) {
      setMlAnalysis(toAnalysisView(result.data))
    } else {
      setMlError(result.error)
    }

    // Keep the progress screen visible long enough to read, even on a fast reply.
    const elapsed = Date.now() - started
    setTimeout(() => setStep('analysis'), Math.max(0, 900 - elapsed))
  }

  const publish = (status) => {
    createAssignment({ ...draft, deadlineLabel, riskCount: analysis.insufficient }, status)
    setConfirm(null)
    showToast(status === 'Draft' ? 'Saved as draft' : 'Assignment published to 60 students')
    navigate('/teacher/assignments')
  }

  if (step === 'analysing') return <Analysing title={draft.title} />
  if (step === 'analysis') {
    return (
      <CapacityAnalysis
        draft={draft}
        deadlineLabel={deadlineLabel}
        analysis={analysis}
        mlError={mlError}
        chosen={chosen}
        setChosen={setChosen}
        onBack={() => setStep('form')}
        onAssign={() => setConfirm('Active')}
        onDraft={() => publish('Draft')}
        confirm={confirm}
        closeConfirm={() => setConfirm(null)}
        onConfirm={() => publish('Active')}
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Create New Assignment"
        subtitle="Describe the work, estimate the effort, then check what it costs your students before publishing."
      />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card className="card-pad">
            <SectionHeader title="Basic information" subtitle="What the students will see" />
            <div className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="title">Assignment title</label>
                <input id="title" className="input" value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Build a Classification Model" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="subject">Subject</label>
                  <select id="subject" className="input" value={draft.subject} onChange={(e) => set({ subject: e.target.value })}>
                    {subjects.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="class">Class / section</label>
                  <select id="class" className="input" value={draft.className} onChange={(e) => set({ className: e.target.value })}>
                    <option>Semester 5 · Section A</option>
                    <option>Semester 5 · Section B</option>
                    <option>Semester 5 · Both sections</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" rows={3} className="textarea" value={draft.description} onChange={(e) => set({ description: e.target.value })} />
              </div>

              <div>
                <label className="label" htmlFor="instructions">Instructions</label>
                <textarea id="instructions" rows={5} className="textarea" value={draft.instructions} onChange={(e) => set({ instructions: e.target.value })} />
                <p className="hint">One instruction per line — they are numbered for the student.</p>
              </div>
            </div>
          </Card>

          <Card className="card-pad">
            <SectionHeader title="Workload information" subtitle="This is what makes capacity analysis possible" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="hours">Estimated completion time</label>
                <div className="flex items-center gap-3">
                  <input
                    id="hours"
                    type="range" min="0.5" max="8" step="0.5"
                    value={draft.estimatedHours}
                    onChange={(e) => set({ estimatedHours: Number(e.target.value) })}
                    className="flex-1 accent-brand-600"
                  />
                  <span className="w-[74px] shrink-0 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-[13px] font-bold text-ink">
                    {draft.estimatedHours} h
                  </span>
                </div>
                <p className="hint">An honest estimate keeps the analysis meaningful.</p>
              </div>

              <div>
                <label className="label">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => set({ difficulty: d })}
                      className={`h-10 rounded-lg border text-[13px] font-semibold transition-all ${
                        draft.difficulty === d ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-ink-soft hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="date">Deadline date</label>
                <input id="date" type="date" className="input" value={draft.deadlineDate} onChange={(e) => set({ deadlineDate: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="time">Deadline time</label>
                <input id="time" type="time" className="input" value={draft.deadlineTime} onChange={(e) => set({ deadlineTime: e.target.value })} />
              </div>

              <div>
                <label className="label" htmlFor="marks">Maximum marks</label>
                <input id="marks" type="number" min="1" max="100" className="input" value={draft.marks} onChange={(e) => set({ marks: e.target.value })} />
              </div>
            </div>
          </Card>

          <Card className="card-pad">
            <SectionHeader title="Submission settings" subtitle="Accepted file formats" />
            <div className="mt-5 flex flex-wrap gap-2.5">
              {FORMATS.map((f) => {
                const on = draft.formats.includes(f)
                return (
                  <button
                    key={f}
                    onClick={() => toggleFormat(f)}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3.5 h-10 text-[13px] font-semibold transition-all ${
                      on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-ink-soft hover:bg-slate-50'
                    }`}
                  >
                    <span className={`grid h-4 w-4 place-items-center rounded border ${on ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                      {on && <Check size={11} className="text-white" strokeWidth={3} />}
                    </span>
                    {f}
                  </button>
                )
              })}
            </div>
            {!draft.formats.length && <p className="mt-3 text-[13px] font-semibold text-risk">Select at least one accepted format.</p>}
          </Card>
        </div>

        {/* Sticky summary + primary action */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="card-pad">
            <SectionHeader title="Summary" />
            <dl className="mt-5 space-y-3.5">
              {[
                ['Title', draft.title || '—'],
                ['Subject', draft.subject],
                ['Class', draft.className],
                ['Estimated effort', `${draft.estimatedHours} hours`],
                ['Difficulty', draft.difficulty],
                ['Deadline', deadlineLabel],
                ['Marks', `${draft.marks}`],
                ['Formats', draft.formats.join(', ') || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <dt className="text-[12.5px] font-semibold text-ink-muted">{k}</dt>
                  <dd className="text-right text-[13px] font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <div className="ai-surface rounded-2xl border border-violetx-200/70 p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/80 text-violetx-600 shadow-sm">
                <Sparkles size={15} strokeWidth={2.4} />
              </span>
              <h3 className="text-[15px] font-bold tracking-tight text-ink">Before you publish</h3>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
              Check how this {draft.estimatedHours}-hour assignment lands against each student&apos;s declared availability
              and the work they already have pending.
            </p>
            <button
              className="btn btn-violet btn-md mt-4 w-full"
              disabled={!draft.title || !draft.formats.length}
              onClick={runAnalysis}
            >
              <Sparkles size={15} /> Analyze student capacity
            </button>
            <p className="mt-3 text-[11px] font-medium text-ink-muted">
              Nothing is published or notified until you choose to assign.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-secondary btn-md flex-1" onClick={() => publish('Draft')}>
              <Save size={15} /> Save as draft
            </button>
            <button className="btn btn-ghost btn-md" onClick={() => setDraft(emptyDraft)}>Reset</button>
          </div>
        </div>
      </div>
    </>
  )
}

function Analysing({ title }) {
  const steps = [
    'Reading declared availability for 60 students',
    'Summing pending assignment estimates',
    'Comparing capacity against the selected deadline',
  ]
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="w-full max-w-md p-8 text-center">
        <Lottie src="/animations/scan.json" className="mx-auto aspect-square w-36 sm:w-40" speed={1.2} />
        <h2 className="mt-2 text-lg font-bold tracking-tight text-ink">Analysing student capacity</h2>
        <p className="mt-1.5 text-[14px] text-ink-muted">{title}</p>
        <ul className="mt-6 space-y-2.5 text-left">
          {steps.map((s, i) => (
            <li
              key={s}
              className="flex items-center gap-3 rounded-lg bg-slate-50 px-3.5 py-2.5 text-[13px] font-medium text-ink-soft animate-fade-up"
              style={{ animationDelay: `${i * 260}ms` }}
            >
              <Loader2 size={13} className="shrink-0 animate-spin text-violetx-500" />
              {s}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function CapacityAnalysis({
  draft, deadlineLabel, analysis, mlError, chosen, setChosen, onBack, onAssign, onDraft, confirm,
  closeConfirm, onConfirm,
}) {
  const mlBacked = analysis.source === 'ml'
  const segments = [
    { label: 'Safe capacity', value: analysis.safe, color: PALETTE.status.safe },
    { label: 'Moderate capacity', value: analysis.moderate, color: PALETTE.status.warn },
    { label: 'Insufficient capacity', value: analysis.insufficient, color: PALETTE.status.risk },
  ]

  return (
    <>
      <button onClick={onBack} className="btn btn-ghost btn-sm mb-4 -ml-2">
        <ArrowLeft size={15} /> Back and edit
      </button>

      <PageHeader
        title="Student Capacity Analysis"
        subtitle="Analysis based on available time and existing academic workload."
        actions={
          <Badge tone={mlBacked ? 'violet' : 'neutral'} icon={Sparkles}>
            {mlBacked ? 'ML-backed analysis' : 'Rule-based simulation'}
          </Badge>
        }
      />

      {!mlBacked && (
        <InlineAlert tone="info" title="Showing the rule-based estimate" className="mb-5">
          The prediction service is not reachable{mlError ? ` (${mlError})` : ''}, so capacity is
          calculated from the teacher estimate alone. Start the backend with{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px]">uvicorn app.main:app --port 8000</code>{' '}
          to include predicted completion times and deadline risk.
        </InlineAlert>
      )}

      <Card className="card-pad mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Assignment under review</p>
            <h2 className="mt-1.5 text-[18px] font-bold tracking-tight text-ink">{draft.title}</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              {draft.subject} · {draft.className} · {draft.estimatedHours} hours · due {deadlineLabel}
            </p>
          </div>
          <Badge tone={draft.difficulty === 'Hard' ? 'risk' : draft.difficulty === 'Medium' ? 'warn' : 'safe'}>
            {draft.difficulty}
          </Badge>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={analysis.total} sub={draft.className} icon={Users} tone="brand" />
        <StatCard label="Safe capacity" value={analysis.safe} sub={`${Math.round((analysis.safe / analysis.total) * 100)}% of the class`} icon={Check} tone="safe" />
        <StatCard label="Moderate capacity" value={analysis.moderate} sub="Under 1.5 h of slack" icon={Clock} tone="warn" />
        <StatCard label="Insufficient capacity" value={analysis.insufficient} sub="Negative remaining time" icon={TriangleAlert} tone="risk" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <ChartCard title="Capacity distribution" subtitle={`How ${analysis.total} students absorb ${draft.estimatedHours} extra hours`}>
          <DistributionBar segments={segments} height="h-4" />
          <div className="mt-6">
            <BarList
              data={segments.map((s) => ({ label: s.label, value: s.value, color: s.color }))}
              unit=" students"
            />
          </div>
        </ChartCard>

        <AIInsightCard
          title="What this means"
          body={
            mlBacked ? (
              <>
                <strong className="font-bold text-ink">{analysis.insufficient} students</strong> cannot fit this work before{' '}
                {deadlineLabel}, and {analysis.moderate} more have under 90 minutes to spare. The model predicts an average of{' '}
                <strong className="font-bold text-ink">
                  {analysis.statistics?.mean_predicted_completion_hours} h
                </strong>{' '}
                against your {draft.estimatedHours} h estimate
                {analysis.statistics?.mean_overrun_vs_estimate_hours > 0 && (
                  <> — about {analysis.statistics.mean_overrun_vs_estimate_hours} h more per student</>
                )}.
              </>
            ) : (
              <>
                <strong className="font-bold text-ink">{analysis.insufficient} students</strong> have insufficient available
                capacity before {deadlineLabel}, and {analysis.moderate} more would finish with less than 90 minutes to spare.
                Extending the deadline by two days moves nearly all of them into the safe band.
              </>
            )
          }
          footnote={
            mlBacked
              ? 'Capacity = declared availability − pending work − predicted completion time. Predictions come from models trained on synthetic data; they are guidance, not fact.'
              : 'Capacity = declared availability − pending estimated work − this assignment. No student data leaves this screen.'
          }
        />
      </div>

      {/* Affected students */}
      <Card className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
          <div>
            <h2 className="section-title">Affected students</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Sorted by remaining capacity — the tightest schedules first.
            </p>
          </div>
          <Badge tone="warn">{analysis.affected.length} flagged</Badge>
        </div>

        <div className="table-wrap">
          <table className="w-full min-w-[820px]">
            <thead className="border-y border-slate-100 bg-slate-50/60">
              <tr>
                <th className="th">Student</th>
                <th className="th-num">Available time</th>
                <th className="th-num">Existing workload</th>
                <th className="th-num">{mlBacked ? 'Predicted effort' : 'New assignment'}</th>
                <th className="th-num">Remaining capacity</th>
                {mlBacked && <th className="th-num">Late risk</th>}
                <th className="th">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis.affected.slice(0, 12).map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar initials={s.initials} name={s.name} size="sm" tone={s.level === 'insufficient' ? 'violet' : 'brand'} />
                      <div>
                        <p className="font-bold text-ink">{s.name}</p>
                        <p className="text-[12px] text-ink-muted">{s.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td-num">{s.availableHours} h</td>
                  <td className="td-num">{s.existingHours} h</td>
                  <td className="td-num">
                    {s.newHours} h
                    {mlBacked && s.teacherEstimate !== undefined && s.newHours > s.teacherEstimate && (
                      <span className="ml-1.5 text-[11px] font-semibold text-warn">
                        +{(s.newHours - s.teacherEstimate).toFixed(1)}
                      </span>
                    )}
                  </td>
                  <td className={`td-num font-bold ${s.remaining < 0 ? 'text-risk' : s.remaining < 1.5 ? 'text-warn' : 'text-safe'}`}>
                    {s.remaining > 0 ? '+' : ''}{s.remaining} {Math.abs(s.remaining) === 1 ? 'hour' : 'hours'}
                  </td>
                  {mlBacked && (
                    <td className={`td-num font-bold ${
                      s.deadlineRisk === 'HIGH' ? 'text-risk' : s.deadlineRisk === 'MODERATE' ? 'text-warn' : 'text-safe'
                    }`}>
                      {Math.round((s.riskProbability ?? 0) * 100)}%
                    </td>
                  )}
                  <td className="td"><WorkloadBadge level={s.level} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {analysis.affected.length > 12 && (
          <p className="border-t border-slate-100 px-5 py-3.5 text-[13px] text-ink-muted">
            Showing 12 of {analysis.affected.length} flagged students.
          </p>
        )}
      </Card>

      {/* Recommendations — teacher decides */}
      <Card className="card-pad mt-5">
        <SectionHeader
          title="Recommended actions"
          subtitle={`${analysis.insufficient} students have insufficient available capacity before the selected deadline.`}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {buildRecommendations({ insufficient: analysis.insufficient, moderate: analysis.moderate, hours: Number(draft.estimatedHours) || 1 }).map((r) => {
            const Icon = REC_ICON[r.icon] || Check
            const active = chosen === r.id
            return (
              <button
                key={r.id}
                onClick={() => setChosen(active ? null : r.id)}
                aria-pressed={active}
                className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
                  active ? 'border-brand-400 bg-brand-50/60 shadow-card' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft'}`}>
                  <Icon size={17} strokeWidth={2.1} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-ink">{r.label}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{r.detail}</p>
                </div>
              </button>
            )
          })}
        </div>

        <InlineAlert tone="info" title="You stay in control" className="mt-5">
          AcadSync never changes a deadline, rescopes an assignment or edits a student&apos;s work. Selecting a
          recommendation only records your intent for this prototype.
        </InlineAlert>
      </Card>

      {/* Actions */}
      <div className="sticky bottom-0 z-10 mt-5 -mx-4 border-t border-slate-200 bg-white/92 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:rounded-2xl lg:border lg:px-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button className="btn btn-ghost btn-md mr-auto" onClick={onBack}>
            <PencilLine size={15} /> Modify assignment
          </button>
          <button className="btn btn-secondary btn-md" onClick={onDraft}>
            <Save size={15} /> Save as draft
          </button>
          <button className="btn btn-primary btn-md" onClick={onAssign}>
            <Send size={15} /> Assign anyway
          </button>
        </div>
      </div>

      <ConfirmationDialog
        open={confirm === 'Active'}
        onClose={closeConfirm}
        onConfirm={onConfirm}
        title="Publish this assignment?"
        message={`${draft.title} will be assigned to ${analysis.total} students, ${analysis.insufficient} of whom are flagged with insufficient capacity. They will be notified of the deadline risk.`}
        confirmLabel="Assign to 60 students"
      />
    </>
  )
}
