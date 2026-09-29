import { useState } from 'react'
import { Search, School, ClipboardList, Gauge } from 'lucide-react'
import { Card, PageHeader, EmptyState, Avatar, Badge, ProgressBar, StatCard } from '../../components/ui'
import { teachers } from '../../data/mockData'

export default function AdminTeachers() {
  const [query, setQuery] = useState('')
  const rows = teachers.filter((t) => {
    const q = query.trim().toLowerCase()
    return !q || t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q)
  })

  const avg = Math.round(teachers.reduce((s, t) => s + t.avgStudentWorkload, 0) / teachers.length)
  const total = teachers.reduce((s, t) => s + t.assignmentsGiven, 0)

  return (
    <>
      <PageHeader title="Teachers" subtitle="Assignment activity and the workload it creates for students." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Teachers listed" value={teachers.length} sub="Across 3 departments" icon={School} tone="brand" />
        <StatCard label="Assignments given" value={total} sub="This term" icon={ClipboardList} tone="violet" />
        <StatCard label="Average student workload" value={`${avg}%`} sub="Across all their classes" icon={Gauge} tone="warn" />
      </div>

      <Card className="card-pad mb-5">
        <div className="relative sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder="Search teachers" aria-label="Search teachers" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Card>

      <Card>
        {rows.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="th">Teacher</th>
                  <th className="th">Department</th>
                  <th className="th">Subjects</th>
                  <th className="th">Assignments given</th>
                  <th className="th">Average student workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                          name={t.name}
                          size="sm"
                          tone="violet"
                        />
                        <div>
                          <p className="font-bold text-ink">{t.name}</p>
                          <p className="text-[12px] text-ink-muted">{t.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td">{t.department}</td>
                    <td className="td">
                      <div className="flex flex-wrap gap-1.5">
                        {t.subjects.map((s) => <Badge key={s} tone="neutral">{s}</Badge>)}
                      </div>
                    </td>
                    <td className="td font-bold text-ink">{t.assignmentsGiven}</td>
                    <td className="td w-52">
                      <div className="flex items-center gap-2.5">
                        <ProgressBar
                          value={t.avgStudentWorkload}
                          tone={t.avgStudentWorkload >= 80 ? 'risk' : t.avgStudentWorkload >= 65 ? 'warn' : 'safe'}
                          className="w-24"
                        />
                        <span className="font-bold text-ink">{t.avgStudentWorkload}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState animation="/animations/search.json" title="No teachers match" message="Try a different search term." />
        )}
      </Card>
    </>
  )
}
