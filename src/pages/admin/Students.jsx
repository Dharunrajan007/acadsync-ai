import { useMemo, useState } from 'react'
import { Search, GraduationCap, Download } from 'lucide-react'
import { Card, PageHeader, Tabs, EmptyState, Avatar, WorkloadBadge, ProgressBar } from '../../components/ui'
import { students, workloadLevel } from '../../data/students'
import { useApp } from '../../context/AppContext'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'high', label: 'High' },
]

export default function AdminStudents() {
  const { showToast } = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('All departments')

  const departments = useMemo(() => ['All departments', ...Array.from(new Set(students.map((s) => s.department)))], [])

  const counts = useMemo(() => ({
    all: students.length,
    low: students.filter((s) => workloadLevel(s.workload) === 'low').length,
    moderate: students.filter((s) => workloadLevel(s.workload) === 'moderate').length,
    high: students.filter((s) => workloadLevel(s.workload) === 'high').length,
  }), [])

  const rows = students
    .filter((s) => filter === 'all' || workloadLevel(s.workload) === filter)
    .filter((s) => dept === 'All departments' || s.department === dept)
    .filter((s) => {
      const q = query.trim().toLowerCase()
      return !q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
    })

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Every student on the platform, with their current workload standing."
        actions={
          <button className="btn btn-secondary btn-md" onClick={() => showToast('Export simulated — no file is generated', 'info')}>
            <Download size={15} /> Export
          </button>
        }
      />

      <Card className="card-pad mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            tabs={FILTERS.map((f) => ({ ...f, count: counts[f.key] }))}
            active={filter}
            onChange={setFilter}
            className="w-full overflow-x-auto lg:w-auto"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <select className="input sm:w-52" aria-label="Filter by department" value={dept} onChange={(e) => setDept(e.target.value)}>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <div className="relative sm:w-60">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input className="input pl-9" placeholder="Search students" aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {rows.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="th">Name</th>
                  <th className="th">Department</th>
                  <th className="th">Class</th>
                  <th className="th">Workload</th>
                  <th className="th">Assignments</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 30).map((s) => (
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
                    <td className="td">{s.className}</td>
                    <td className="td w-44">
                      <div className="flex items-center gap-2.5">
                        <ProgressBar
                          value={s.workload}
                          tone={s.workload >= 80 ? 'risk' : s.workload >= 60 ? 'warn' : 'safe'}
                          className="w-24"
                        />
                        <span className="font-bold text-ink">{s.workload}%</span>
                      </div>
                    </td>
                    <td className="td">{s.assignmentsPending} pending</td>
                    <td className="td"><WorkloadBadge level={workloadLevel(s.workload)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState animation="/animations/search.json" title="No students match" message="Try a different filter or search term." />
        )}
      </Card>

      {rows.length > 30 && (
        <p className="mt-4 text-center text-[13px] text-ink-muted">Showing 30 of {rows.length} students in this prototype.</p>
      )}
    </>
  )
}
