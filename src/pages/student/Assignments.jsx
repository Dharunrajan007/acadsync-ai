import { useMemo, useState } from 'react'
import { Search, BookOpen, SlidersHorizontal } from 'lucide-react'
import { PageHeader, Tabs, Card, EmptyState, LoadingCard } from '../../components/ui'
import { AssignmentCard } from '../../components/cards'
import { useApp } from '../../context/AppContext'

const TABS = ['All', 'Pending', 'Completed', 'Overdue']

export default function StudentAssignments() {
  const { assignments } = useApp()
  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All subjects')

  const subjectOptions = useMemo(
    () => ['All subjects', ...Array.from(new Set(assignments.map((a) => a.subject)))],
    [assignments]
  )

  const counts = useMemo(
    () => ({
      All: assignments.length,
      Pending: assignments.filter((a) => a.status === 'In Progress' || a.status === 'Not Started').length,
      Completed: assignments.filter((a) => a.status === 'Completed').length,
      Overdue: assignments.filter((a) => a.status === 'Overdue').length,
    }),
    [assignments]
  )

  const filtered = useMemo(() => {
    return assignments
      .filter((a) => {
        if (tab === 'Pending') return a.status === 'In Progress' || a.status === 'Not Started'
        if (tab === 'Completed') return a.status === 'Completed'
        if (tab === 'Overdue') return a.status === 'Overdue'
        return true
      })
      .filter((a) => subject === 'All subjects' || a.subject === subject)
      .filter((a) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q) || a.teacher.toLowerCase().includes(q)
      })
      .sort((a, b) => a.dueSort - b.dueSort)
  }, [assignments, tab, subject, query])

  return (
    <>
      <PageHeader
        title="My Assignments"
        subtitle="Everything assigned to you, with the estimated effort behind each one."
      />

      <Card className="card-pad mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            tabs={TABS.map((t) => ({ key: t, label: t, count: counts[t] }))}
            active={tab}
            onChange={setTab}
            className="w-full overflow-x-auto lg:w-auto"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                className="input pl-9"
                placeholder="Search assignments"
                aria-label="Search assignments"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <select
                className="input appearance-none pl-9 pr-8"
                aria-label="Filter by subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjectOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AssignmentCard key={a.id} assignment={a} to={`/student/assignments/${a.id}`} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            animation={query || subject !== 'All subjects' ? '/animations/search.json' : '/animations/check.json'}
            title={query || subject !== 'All subjects' ? 'No matching assignments' : 'No assignments yet'}
            message={
              query || subject !== 'All subjects'
                ? 'Try a different search term or clear the subject filter.'
                : 'Enjoy your free time. New assignments will appear here.'
            }
            action={
              (query || subject !== 'All subjects') && (
                <button className="btn btn-secondary btn-md" onClick={() => { setQuery(''); setSubject('All subjects') }}>
                  Clear filters
                </button>
              )
            }
          />
        </Card>
      )}
    </>
  )
}
