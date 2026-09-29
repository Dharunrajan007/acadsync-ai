import { useState } from 'react'
import { Search, ClipboardList } from 'lucide-react'
import { Card, PageHeader, Tabs, EmptyState, StatusBadge, ProgressBar } from '../../components/ui'
import { adminAssignments } from '../../data/adminData'

export default function AdminAssignments() {
  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')

  const rows = adminAssignments
    .filter((a) => tab === 'All' || a.status === tab)
    .filter((a) => {
      const q = query.trim().toLowerCase()
      return !q || a.title.toLowerCase().includes(q) || a.teacher.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q)
    })

  return (
    <>
      <PageHeader title="Assignments" subtitle="Every assignment across departments, with submission progress." />

      <Card className="card-pad mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            tabs={['All', 'Active', 'Closed'].map((t) => ({
              key: t,
              label: t,
              count: t === 'All' ? adminAssignments.length : adminAssignments.filter((a) => a.status === t).length,
            }))}
            active={tab}
            onChange={setTab}
          />
          <div className="relative sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input className="input pl-9" placeholder="Search assignments" aria-label="Search assignments" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        {rows.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="th">Assignment</th>
                  <th className="th">Subject</th>
                  <th className="th">Teacher</th>
                  <th className="th">Department</th>
                  <th className="th">Deadline</th>
                  <th className="th">Submissions</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => {
                  const pct = Math.round((a.submitted / a.students) * 100)
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="td font-semibold text-ink">{a.title}</td>
                      <td className="td">{a.subject}</td>
                      <td className="td">{a.teacher}</td>
                      <td className="td">{a.department}</td>
                      <td className="td">{a.deadline}</td>
                      <td className="td w-52">
                        <div className="flex items-center gap-2.5">
                          <ProgressBar value={pct} tone={pct > 70 ? 'safe' : pct > 40 ? 'warn' : 'risk'} className="w-24" />
                          <span className="font-semibold text-ink">{a.submitted}/{a.students}</span>
                        </div>
                      </td>
                      <td className="td"><StatusBadge status={a.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState animation="/animations/search.json" title="No assignments match" message="Try a different tab or search term." />
        )}
      </Card>
    </>
  )
}
