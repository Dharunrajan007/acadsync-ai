import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Clock, CalendarDays, Award, FileText, Upload, CheckCircle2, User,
  Loader2, X, Sparkles,
} from 'lucide-react'
import {
  Card, PageHeader, Badge, StatusBadge, PriorityBadge, ProgressBar, EmptyState,
  InlineAlert, ConfirmationDialog,
} from '../../components/ui'
import { AIInsightCard } from '../../components/cards'
import { useApp } from '../../context/AppContext'
import Lottie from '../../components/Lottie'

const STAGES = ['Not Started', 'In Progress', 'Completed']

export default function AssignmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { assignments, updateAssignment, submitAssignment, showToast } = useApp()
  const assignment = assignments.find((a) => a.id === id)

  const [file, setFile] = useState(assignment?.submittedFile || null)
  const [uploading, setUploading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!assignment) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="Assignment not found"
          message="This assignment is not part of the demo data set."
          action={<Link to="/student/assignments" className="btn btn-primary btn-md">Back to assignments</Link>}
        />
      </Card>
    )
  }

  const a = assignment
  const submitted = a.status === 'Completed' && a.submittedFile
  const overdue = a.status === 'Overdue'

  const simulateUpload = () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setFile(`assignment_dharun.${a.formats[0].toLowerCase()}`)
      showToast('File ready to submit', 'info')
    }, 1100)
  }

  const doSubmit = () => {
    setConfirmOpen(false)
    submitAssignment(a.id, file)
    showToast('Assignment submitted successfully')
  }

  const setStage = (stage) => {
    const progress = stage === 'Completed' ? 100 : stage === 'In Progress' ? Math.max(a.progress, 20) : 0
    updateAssignment(a.id, { status: stage, progress })
    showToast(`Marked as ${stage.toLowerCase()}`, 'info')
  }

  return (
    <>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4 -ml-2">
        <ArrowLeft size={15} /> Back
      </button>

      <PageHeader
        title={a.title}
        subtitle={`${a.subject} · assigned by ${a.teacher}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={a.status} />
            <PriorityBadge priority={a.priority} />
          </div>
        }
      />

      {overdue && (
        <InlineAlert tone="risk" title="This assignment is past its deadline" className="mb-5">
          The submission window closed on {a.deadlineFull}. Contact {a.teacher} if you need a grace period.
        </InlineAlert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card className="card-pad">
            <div className="grid grid-cols-2 gap-5 border-b border-slate-100 pb-5 sm:grid-cols-4">
              <Fact icon={CalendarDays} label="Deadline" value={a.deadlineFull} tone={overdue ? 'risk' : 'default'} />
              <Fact icon={Clock} label="Estimated time" value={`${a.estimatedHours} hours`} />
              <Fact icon={Award} label="Maximum marks" value={`${a.marks} marks`} />
              <Fact icon={FileText} label="Formats" value={a.formats.join(', ')} />
            </div>

            <div className="pt-5">
              <h2 className="section-title">Description</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{a.description}</p>
            </div>

            {a.instructions?.length > 0 && (
              <div className="pt-6">
                <h2 className="section-title">Instructions</h2>
                <ol className="mt-3 space-y-2.5">
                  {a.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-ink-soft">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-100 text-[11px] font-bold text-ink-soft">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>

          {/* Submission */}
          <Card className="card-pad">
            <h2 className="section-title">Submission</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Accepted formats: {a.formats.join(', ')} · maximum one file
            </p>

            {submitted ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
                <div className="flex items-start gap-3">
                  <Lottie src="/animations/check.json" className="-mt-2 aspect-square w-12 shrink-0" loop={false} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-ink">Assignment submitted successfully</p>
                    <p className="mt-1 text-[13px] text-ink-soft">
                      {a.submittedFile} · submitted {a.submittedAt}
                    </p>
                    {a.scored !== undefined && (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[13px] font-bold text-ink">
                        <Award size={15} className="text-safe" /> {a.scored} / {a.marks} marks
                      </p>
                    )}
                    {a.feedback && (
                      <p className="mt-3 rounded-lg bg-white px-3 py-2.5 text-[13px] leading-relaxed text-ink-soft">
                        <span className="font-bold text-ink">Feedback · </span>{a.feedback}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                {!file ? (
                  <button
                    onClick={simulateUpload}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 transition-colors hover:border-brand-400 hover:bg-brand-50/40"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={26} className="animate-spin text-brand-600" />
                        <p className="mt-3 text-[14px] font-bold text-ink">Preparing file…</p>
                      </>
                    ) : (
                      <>
                        <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-brand-600 shadow-card">
                          <Upload size={20} />
                        </span>
                        <p className="mt-3.5 text-[15px] font-bold text-ink">Upload assignment</p>
                        <p className="mt-1 text-[13px] text-ink-muted">
                          Accepted: {a.formats.join(', ')} · simulated upload
                        </p>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-safe">
                        <CheckCircle2 size={19} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-ink">File ready</p>
                        <p className="truncate text-[13px] text-ink-muted">{file}</p>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="btn btn-ghost h-8 w-8 shrink-0 rounded-lg p-0"
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <button className="btn btn-primary btn-md mt-4 w-full" onClick={() => setConfirmOpen(true)}>
                      Submit assignment
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="card-pad">
            <h2 className="section-title">Progress</h2>
            <div className="mt-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink-muted">Completion</span>
                <span className="text-[20px] font-extrabold text-ink">{a.progress}%</span>
              </div>
              <ProgressBar value={a.progress} tone={a.progress === 100 ? 'safe' : overdue ? 'risk' : 'brand'} height="h-2.5" />
            </div>

            <div className="mt-5 space-y-2">
              {STAGES.map((s) => {
                const active = a.status === s || (a.status === 'Overdue' && s === 'In Progress')
                return (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      active ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                      {active && <CheckCircle2 size={12} className="text-white" />}
                    </span>
                    <span className={`text-[14px] font-semibold ${active ? 'text-brand-700' : 'text-ink-soft'}`}>{s}</span>
                  </button>
                )
              })}
            </div>

            {a.status === 'In Progress' && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <label className="label" htmlFor="progress-range">Update progress</label>
                <input
                  id="progress-range"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={a.progress}
                  onChange={(e) => updateAssignment(a.id, { progress: Number(e.target.value) })}
                  className="w-full accent-brand-600"
                />
                <p className="hint">Drag to record how far along you are. Simulated locally.</p>
              </div>
            )}
          </Card>

          <AIInsightCard
            title="Capacity note"
            body={
              overdue
                ? 'This work is overdue and still 60% incomplete. Two hours on Saturday morning would clear it without disturbing your other deadlines.'
                : `You have ${a.estimatedHours} hours of estimated effort left against 3 hours of availability before this deadline. Starting today keeps the margin comfortable.`
            }
            footnote="Derived from your availability and pending estimates."
          />

          <Card className="card-pad">
            <h2 className="section-title">Assigned by</h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-violetx-100 text-[13px] font-bold text-violetx-700">
                {a.teacher.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </span>
              <div>
                <p className="text-[14px] font-bold text-ink">{a.teacher}</p>
                <p className="text-[12px] text-ink-muted">{a.subject}</p>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm mt-4 w-full"
              onClick={() => showToast('Extension request sent to ' + a.teacher, 'info')}
            >
              Request deadline extension
            </button>
          </Card>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
        title="Submit this assignment?"
        message={`${file} will be submitted for ${a.title}. In this prototype the submission is simulated and can't be withdrawn.`}
        confirmLabel="Submit assignment"
      />
    </>
  )
}

function Fact({ icon: Icon, label, value, tone = 'default' }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        <Icon size={12} /> {label}
      </p>
      <p className={`mt-1.5 text-[14px] font-bold ${tone === 'risk' ? 'text-risk' : 'text-ink'}`}>{value}</p>
    </div>
  )
}
