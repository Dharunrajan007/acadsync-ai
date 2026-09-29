import { useState } from 'react'
import { Inbox, FileText, Search, ArrowLeft, Save, Download } from 'lucide-react'
import {
  Card, PageHeader, Tabs, Badge, StatusBadge, EmptyState, Avatar, SectionHeader, StatCard,
} from '../../components/ui'
import { submissionsFor } from '../../data/teacherData'
import { useApp } from '../../context/AppContext'

export default function TeacherSubmissions() {
  const { teacherAssignments, showToast } = useApp()
  const assignable = teacherAssignments.filter((a) => a.status !== 'Draft')
  const [selected, setSelected] = useState(assignable[0]?.id || null)
  const [review, setReview] = useState(null)
  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')

  const assignment = assignable.find((a) => a.id === selected)
  const rows = assignment ? submissionsFor(assignment.id) : []
  const filtered = rows
    .filter((r) => tab === 'All' || r.status === tab)
    .filter((r) => !query.trim() || r.student.toLowerCase().includes(query.trim().toLowerCase()))

  if (review && assignment) {
    return <ReviewPanel row={review} assignment={assignment} onBack={() => setReview(null)} showToast={showToast} />
  }

  return (
    <>
      <PageHeader title="Submissions" subtitle="Review what has come in and record evaluations." />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="card-pad lg:sticky lg:top-24 lg:self-start">
          <SectionHeader title="Assignments" />
          <ul className="mt-4 space-y-2">
            {assignable.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setSelected(a.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    selected === a.id ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-[13.5px] font-bold text-ink">{a.title}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{a.subject}</p>
                  <p className="mt-1.5 text-[11.5px] font-semibold text-ink-muted">
                    {a.submitted} of {a.students} submitted
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          {assignment ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Submitted" value={rows.filter((r) => r.status !== 'Pending').length} sub="Of 24 shown" icon={Inbox} tone="safe" />
                <StatCard label="Pending" value={rows.filter((r) => r.status === 'Pending').length} sub="No file received" icon={FileText} tone="warn" />
                <StatCard label="Evaluated" value={rows.filter((r) => r.marks !== null).length} sub="Marks recorded" icon={Save} tone="brand" />
              </div>

              <Card>
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <Tabs
                    tabs={['All', 'Submitted', 'Late', 'Pending'].map((t) => ({
                      key: t,
                      label: t,
                      count: t === 'All' ? rows.length : rows.filter((r) => r.status === t).length,
                    }))}
                    active={tab}
                    onChange={setTab}
                    className="w-full overflow-x-auto sm:w-auto"
                  />
                  <div className="relative sm:w-56">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input className="input pl-9" placeholder="Search students" aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                </div>

                {filtered.length ? (
                  <div className="table-wrap">
                    <table className="w-full min-w-[760px]">
                      <thead className="border-b border-slate-100 bg-slate-50/60">
                        <tr>
                          <th className="th">Student</th>
                          <th className="th">Submission status</th>
                          <th className="th">Submission time</th>
                          <th className="th">File</th>
                          <th className="th">Marks</th>
                          <th className="th"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((r) => (
                          <tr key={r.id} className="transition-colors hover:bg-slate-50/70">
                            <td className="td">
                              <div className="flex items-center gap-3">
                                <Avatar initials={r.initials} name={r.student} size="sm" />
                                <div>
                                  <p className="font-bold text-ink">{r.student}</p>
                                  <p className="text-[12px] text-ink-muted">{r.rollNo}</p>
                                </div>
                              </div>
                            </td>
                            <td className="td"><StatusBadge status={r.status} /></td>
                            <td className="td">{r.submittedAt}</td>
                            <td className="td">
                              {r.file ? (
                                <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                                  <FileText size={14} className="text-ink-muted" /> {r.file}
                                </span>
                              ) : (
                                <span className="text-ink-muted">—</span>
                              )}
                            </td>
                            <td className="td">
                              {r.marks !== null ? <Badge tone="safe">{r.marks}/{assignment.marks}</Badge> : <span className="text-ink-muted">—</span>}
                            </td>
                            <td className="td text-right">
                              <button className="btn btn-secondary btn-sm" disabled={r.status === 'Pending'} onClick={() => setReview(r)}>
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState animation="/animations/search.json" title="No submissions match" message="Try a different tab or search term." />
                )}
              </Card>
            </>
          ) : (
            <Card>
              <EmptyState icon={Inbox} title="No assignments to review" message="Publish an assignment and submissions will appear here." />
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function ReviewPanel({ row, assignment, onBack, showToast }) {
  const [marks, setMarks] = useState(row.marks ?? '')
  const [feedback, setFeedback] = useState(row.feedback || '')

  return (
    <>
      <button onClick={onBack} className="btn btn-ghost btn-sm mb-4 -ml-2">
        <ArrowLeft size={15} /> Back to submissions
      </button>

      <PageHeader title="Review submission" subtitle={`${assignment.title} · ${assignment.subject}`} />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="card-pad">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar initials={row.initials} name={row.student} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold text-ink">{row.student}</p>
              <p className="text-[13px] text-ink-muted">{row.rollNo}</p>
            </div>
            <StatusBadge status={row.status} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-5">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Submission time</dt>
              <dd className="mt-1 text-[14px] font-bold text-ink">{row.submittedAt}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Maximum marks</dt>
              <dd className="mt-1 text-[14px] font-bold text-ink">{assignment.marks}</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <FileText size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-ink">{row.file}</p>
              <p className="text-[12px] text-ink-muted">Simulated file · preview unavailable in the prototype</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Download simulated', 'info')}>
              <Download size={14} /> Open
            </button>
          </div>
        </Card>

        <Card className="card-pad">
          <SectionHeader title="Evaluation" />
          <div className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="marks">Marks</label>
              <div className="flex items-center gap-2">
                <input
                  id="marks"
                  type="number"
                  min="0"
                  max={assignment.marks}
                  className="input"
                  placeholder="0"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
                <span className="text-[15px] font-bold text-ink-muted">/ {assignment.marks}</span>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="feedback">Feedback</label>
              <textarea
                id="feedback"
                rows={6}
                className="textarea"
                placeholder="What went well, and what to improve next time."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-md w-full" onClick={() => { showToast('Evaluation saved'); onBack() }}>
              <Save size={15} /> Save evaluation
            </button>
          </div>
        </Card>
      </div>
    </>
  )
}
