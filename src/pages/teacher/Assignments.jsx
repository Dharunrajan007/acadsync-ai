import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, BookOpen, TriangleAlert, Users, Clock } from 'lucide-react'
import { Card, PageHeader, Tabs, Badge, StatusBadge, ProgressBar, EmptyState } from '../../components/ui'
import { useApp } from '../../context/AppContext'

export default function TeacherAssignments() {
  const { teacherAssignments } = useApp()
  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => ({
    All: teacherAssignments.length,
    Active: teacherAssignments.filter((a) => a.status === 'Active').length,
    Draft: teacherAssignments.filter((a) => a.status === 'Draft').length,
    Closed: teacherAssignments.filter((a) => a.status === 'Closed').length,
  }), [teacherAssignments])

  const rows = teacherAssignments
    .filter((a) => tab === 'All' || a.status === tab)
    .filter((a) => {
      const q = query.trim().toLowerCase()
      return !q || a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q)
    })

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="Everything you have assigned, with submission progress and capacity flags."
        actions={<Link to="/teacher/create" className="btn btn-primary btn-md"><PlusCircle size={16} /> Create assignment</Link>}
      />

      <Card className="card-pad mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            tabs={['All', 'Active', 'Draft', 'Closed'].map((t) => ({ key: t, label: t, count: counts[t] }))}
            active={tab}
            onChange={setTab}
            className="w-full overflow-x-auto sm:w-auto"
          />
          <div className="relative sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input className="input pl-9" placeholder="Search assignments" aria-label="Search assignments" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </Card>

      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((a) => {
            const pct = a.students ? Math.round((a.submitted / a.students) * 100) : 0
            return (
              <Card key={a.id} hover className="card-pad flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone="brand">{a.subject}</Badge>
                  <StatusBadge status={a.status} />
                </div>

                <h3 className="mt-3 text-[16px] font-bold tracking-tight text-ink">{a.title}</h3>
                <p className="mt-1 text-[12.5px] text-ink-muted">{a.className}</p>

                <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-slate-100 py-4">
                  {[
                    [Users, 'Students', a.students],
                    [BookOpen, 'Submitted', a.submitted],
                    [Clock, 'Pending', a.pending],
                  ].map(([Icon, k, v]) => (
                    <div key={k}>
                      <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                        <Icon size={11} /> {k}
                      </dt>
                      <dd className="tnum mt-0.5 text-[16px] font-extrabold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                    <span className="text-ink-muted">Submissions</span>
                    <span className="text-ink">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} tone={pct > 70 ? 'safe' : pct > 40 ? 'warn' : 'risk'} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-muted">
                  <Clock size={13} /> Due {a.deadline} · {a.estimatedHours} h · {a.marks} marks
                </div>

                {a.riskCount > 0 && (
                  <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] font-semibold text-warn">
                    <TriangleAlert size={13} /> {a.riskCount} students flagged
                  </p>
                )}

                <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                  <Link to="/teacher/submissions" className="btn btn-secondary btn-sm flex-1">Submissions</Link>
                  <Link to="/teacher/workload" className="btn btn-ghost btn-sm">Workload</Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            animation={query ? '/animations/search.json' : '/animations/calendar.json'}
            title={query ? 'No matching assignments' : `No ${tab.toLowerCase()} assignments`}
            message={query ? 'Try a different search term.' : 'Create an assignment and it will show up here.'}
            action={<Link to="/teacher/create" className="btn btn-primary btn-md">Create assignment</Link>}
          />
        </Card>
      )}
    </>
  )
}
