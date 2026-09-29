import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Users, LayoutGrid, List } from 'lucide-react'
import { Card, PageHeader, Tabs, EmptyState, Avatar, WorkloadBadge, ProgressBar } from '../../components/ui'
import { StudentCard } from '../../components/cards'
import { students, workloadLevel } from '../../data/students'
import { Link } from 'react-router-dom'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: 'Safe capacity' },
  { key: 'moderate', label: 'Moderate workload' },
  { key: 'high', label: 'High workload' },
]

export default function TeacherStudents() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState('grid')
  const filter = params.get('filter') || 'all'

  const counts = useMemo(() => ({
    all: students.length,
    safe: students.filter((s) => workloadLevel(s.workload) === 'low').length,
    moderate: students.filter((s) => workloadLevel(s.workload) === 'moderate').length,
    high: students.filter((s) => workloadLevel(s.workload) === 'high').length,
  }), [])

  const rows = useMemo(() => students
    .filter((s) => {
      const level = workloadLevel(s.workload)
      if (filter === 'safe') return level === 'low'
      if (filter === 'moderate') return level === 'moderate'
      if (filter === 'high') return level === 'high'
      return true
    })
    .filter((s) => {
      const q = query.trim().toLowerCase()
      return !q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
    }), [filter, query])

  return (
    <>
      <PageHeader title="Students" subtitle="Workload and capacity for every student you teach." />

      <Card className="card-pad mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            tabs={FILTERS.map((f) => ({ ...f, count: counts[f.key] }))}
            active={filter}
            onChange={(k) => setParams(k === 'all' ? {} : { filter: k })}
            className="w-full overflow-x-auto lg:w-auto"
          />
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input className="input pl-9" placeholder="Search students" aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 sm:flex">
              <button
                onClick={() => setLayout('grid')}
                aria-label="Grid view"
                className={`grid h-8 w-8 place-items-center rounded-lg transition-all ${layout === 'grid' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setLayout('table')}
                aria-label="Table view"
                className={`grid h-8 w-8 place-items-center rounded-lg transition-all ${layout === 'table' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {!rows.length ? (
        <Card>
          <EmptyState
            animation="/animations/search.json"
            title="No students match"
            message="Try a different search term or filter."
            action={<button className="btn btn-secondary btn-md" onClick={() => { setQuery(''); setParams({}) }}>Clear filters</button>}
          />
        </Card>
      ) : layout === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.slice(0, 24).map((s) => (
            <StudentCard key={s.id} student={s} to={`/teacher/students/${s.id}`} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="table-wrap">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="th">Student</th>
                  <th className="th">Department</th>
                  <th className="th">Workload</th>
                  <th className="th">Available</th>
                  <th className="th">Completion</th>
                  <th className="th">Status</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 24).map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <Avatar initials={s.initials} name={s.name} size="sm" />
                        <div>
                          <p className="font-bold text-ink">{s.name}</p>
                          <p className="text-[12px] text-ink-muted">{s.rollNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td">{s.department}</td>
                    <td className="td w-40">
                      <div className="flex items-center gap-2.5">
                        <ProgressBar
                          value={s.workload}
                          tone={s.workload >= 80 ? 'risk' : s.workload >= 60 ? 'warn' : 'safe'}
                          className="w-20"
                        />
                        <span className="font-bold text-ink">{s.workload}%</span>
                      </div>
                    </td>
                    <td className="td">{s.availableHours} h</td>
                    <td className="td">{s.completionRate}%</td>
                    <td className="td"><WorkloadBadge level={workloadLevel(s.workload)} /></td>
                    <td className="td text-right">
                      <Link to={`/teacher/students/${s.id}`} className="btn btn-ghost btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {rows.length > 24 && (
        <p className="mt-4 text-center text-[13px] text-ink-muted">
          Showing 24 of {rows.length} students in this prototype.
        </p>
      )}
    </>
  )
}
