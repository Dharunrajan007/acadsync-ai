import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Inbox, Award, Download } from 'lucide-react'
import { Card, PageHeader, Tabs, Badge, StatusBadge, EmptyState, StatCard } from '../../components/ui'
import { useApp } from '../../context/AppContext'

export default function StudentSubmissions() {
  const { assignments, showToast } = useApp()
  const [tab, setTab] = useState('Submitted')

  const submitted = assignments.filter((a) => a.submittedFile)
  const awaiting = assignments.filter((a) => !a.submittedFile && a.status !== 'Completed')
  const rows = tab === 'Submitted' ? submitted : awaiting

  const marked = submitted.filter((a) => a.scored !== undefined)
  const average = marked.length
    ? Math.round((marked.reduce((s, a) => s + (a.scored / a.marks) * 100, 0) / marked.length))
    : 0

  return (
    <>
      <PageHeader title="Submissions" subtitle="What you have sent, and what is still waiting on you." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Submitted" value={submitted.length} sub="This semester" icon={Inbox} tone="brand" />
        <StatCard label="Awaiting submission" value={awaiting.length} sub={`${awaiting.filter((a) => a.status === 'Overdue').length} overdue`} icon={FileText} tone="warn" />
        <StatCard label="Average score" value={`${average}%`} sub={`${marked.length} evaluated`} icon={Award} tone="safe" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <Tabs
            tabs={[
              { key: 'Submitted', label: 'Submitted', count: submitted.length },
              { key: 'Awaiting', label: 'Awaiting', count: awaiting.length },
            ]}
            active={tab}
            onChange={setTab}
          />
          <button className="btn btn-secondary btn-sm" onClick={() => showToast('Export simulated — no file is generated', 'info')}>
            <Download size={14} /> Export history
          </button>
        </div>

        {rows.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="th">Assignment</th>
                  <th className="th">Subject</th>
                  <th className="th">Deadline</th>
                  <th className="th">{tab === 'Submitted' ? 'Submitted' : 'Status'}</th>
                  <th className="th">File</th>
                  <th className="th">Marks</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="td font-semibold text-ink">{a.title}</td>
                    <td className="td">{a.subject}</td>
                    <td className="td">{a.deadlineLabel.split(' · ')[0]}</td>
                    <td className="td">
                      {tab === 'Submitted' ? a.submittedAt : <StatusBadge status={a.status} />}
                    </td>
                    <td className="td">
                      {a.submittedFile ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                          <FileText size={14} className="text-ink-muted" /> {a.submittedFile}
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="td">
                      {a.scored !== undefined ? (
                        <Badge tone="safe">{a.scored}/{a.marks}</Badge>
                      ) : (
                        <span className="text-ink-muted">Pending</span>
                      )}
                    </td>
                    <td className="td text-right">
                      <Link to={`/student/assignments/${a.id}`} className="btn btn-ghost btn-sm">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            animation={tab === 'Submitted' ? '/animations/calendar.json' : '/animations/check.json'}
            title={tab === 'Submitted' ? 'No submissions yet' : 'Nothing awaiting submission'}
            message={
              tab === 'Submitted'
                ? 'Once you submit an assignment it will be listed here with its evaluation.'
                : 'Everything assigned to you has been submitted. Nicely done.'
            }
            action={<Link to="/student/assignments" className="btn btn-primary btn-md">Go to assignments</Link>}
          />
        )}
      </Card>
    </>
  )
}
