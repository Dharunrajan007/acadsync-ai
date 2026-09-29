import { useState } from 'react'
import { Search, LayoutGrid } from 'lucide-react'
import { Card, PageHeader, EmptyState, Badge, ProgressBar } from '../../components/ui'
import { subjects } from '../../data/mockData'

const LOAD_TONE = { High: 'risk', Medium: 'warn', Low: 'safe' }

export default function AdminSubjects() {
  const [query, setQuery] = useState('')
  const rows = subjects.filter((s) => {
    const q = query.trim().toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
  })

  return (
    <>
      <PageHeader title="Subjects" subtitle="Assignment density and workload contribution per subject." />

      <Card className="card-pad mb-5">
        <div className="relative sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder="Search subjects" aria-label="Search subjects" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Card>

      {rows.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((s) => (
            <Card key={s.id} hover className="card-pad flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                    <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">{s.code}</p>
                  </div>
                  <h3 className="mt-2 text-[16px] font-bold tracking-tight text-ink">{s.name}</h3>
                  <p className="mt-1 text-[12.5px] text-ink-muted">{s.teacher} · {s.department}</p>
                </div>
                <Badge tone={LOAD_TONE[s.load]}>{s.load} load</Badge>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Credits</dt>
                  <dd className="mt-0.5 text-[15px] font-extrabold text-ink">{s.credits}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Active work</dt>
                  <dd className="mt-0.5 text-[15px] font-extrabold text-ink">{s.activeAssignments}</dd>
                </div>
              </dl>

              <div className="mt-auto pt-4">
                <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                  <span className="text-ink-muted">Assignment density</span>
                  <span className="text-ink">{Math.round((s.activeAssignments / 14) * 100)}%</span>
                </div>
                <ProgressBar value={(s.activeAssignments / 14) * 100} tone={LOAD_TONE[s.load]} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><EmptyState animation="/animations/search.json" title="No subjects match" message="Try a different search term." /></Card>
      )}
    </>
  )
}
