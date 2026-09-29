import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ListChecks, FileClock, Clock, Activity, ArrowRight, CalendarDays, BookOpen,
} from 'lucide-react'
import { Card, StatCard, SectionHeader, WorkloadBadge, EmptyState, Badge } from '../../components/ui'
import { AIInsightCard, Timeline, DeadlineRow } from '../../components/cards'
import { ChartCard, CapacityColumns, LegendItem, PALETTE } from '../../components/charts'
import { todayPlan, weeklyWorkload, currentStudent } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import WelcomeBanner from '../../components/WelcomeBanner'

// "Tue, Wed and Fri" rather than "Tue and Wed and Fri".
function formatList(items) {
  if (items.length <= 1) return items[0] || ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export default function StudentOverview() {
  const { assignments, showToast } = useApp()
  const [dismissed, setDismissed] = useState(false)

  const pending = assignments.filter((a) => a.status !== 'Completed')
  const upcoming = useMemo(
    () => pending.filter((a) => a.status !== 'Overdue').sort((a, b) => a.dueSort - b.dueSort).slice(0, 4),
    [pending]
  )

  const todayHours = todayPlan.filter((t) => t.type === 'work').reduce((s, t) => s + t.hours, 0)
  const requiredThisWeek = weeklyWorkload.reduce((s, d) => s + d.required, 0)
  const availableThisWeek = weeklyWorkload.reduce((s, d) => s + d.available, 0)
  const overloadDays = weeklyWorkload.filter((d) => d.required > d.available)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <>
      <WelcomeBanner
        animation="/animations/calendar.json"
        greeting={greeting}
        name={currentStudent.shortName}
        subtitle="Here's what your academic workload looks like today."
        stats={[
          { label: 'Next deadline', value: 'Tomorrow', tone: 'text-risk' },
          { label: 'Planned this week', value: `${requiredThisWeek} h` },
          { label: 'Completion rate', value: '88%' },
        ]}
        actions={
          <>
            <Link to="/student/timeline" className="btn btn-primary btn-sm">Open today&apos;s plan <ArrowRight size={14} aria-hidden /></Link>
            <Link to="/student/availability" className="btn btn-secondary btn-sm">Update availability</Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's work" value={`${todayPlan.filter((t) => t.type === 'work').length} tasks`} sub={`${todayHours} hours planned`} icon={ListChecks} tone="brand" />
        <StatCard label="Pending assignments" value={pending.length} sub={`${pending.filter((a) => a.status === 'Overdue').length} overdue`} icon={FileClock} tone="info" />
        <StatCard label="Available time" value="4.5 hours" sub="Today, 6:00–10:30 PM" icon={Clock} tone="safe" />
        <Card hover className="card-pad">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-ink-muted">Workload status</p>
              <p className="mt-2 text-[26px] font-extrabold uppercase leading-none tracking-tight text-warn">Moderate</p>
              <p className="mt-2 text-[13px] text-ink-muted">72% of capacity used</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-warn">
              <Activity size={18} strokeWidth={2.2} />
            </span>
          </div>
        </Card>
      </div>

      {!dismissed && (
        <AIInsightCard
          className="mt-5"
          body={
            <>
              Your workload is higher than usual this week. Completing the <strong className="font-bold text-ink">Machine
              Learning assignment</strong> today will reduce your deadline risk by <strong className="font-bold text-ink">34%</strong>.
            </>
          }
          footnote="Based on your declared availability and pending estimated hours. Guidance only — you decide what to work on."
          actions={
            <>
              <Link to="/student/timeline" className="btn btn-violet btn-sm">View plan <ArrowRight size={14} /></Link>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setDismissed(true); showToast('Insight dismissed for today', 'info') }}
              >
                Dismiss
              </button>
            </>
          }
        />
      )}

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.15fr_1fr]">
        <Card className="card-pad">
          <SectionHeader
            title="Your plan for today"
            subtitle="Built around your 6:00 PM – 10:30 PM availability"
            action={<Link to="/student/timeline" className="btn btn-secondary btn-sm">Full timeline</Link>}
          />
          <div className="mt-6">
            {todayPlan.length ? (
              <Timeline items={todayPlan} />
            ) : (
              <EmptyState animation="/animations/calendar.json" title="Nothing planned today" message="Set your availability and new work will be scheduled here." />
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="card-pad">
            <SectionHeader
              title="Upcoming deadlines"
              action={<Link to="/student/assignments" className="btn btn-ghost btn-sm">All <ArrowRight size={14} /></Link>}
            />
            <div className="mt-3 -mx-3">
              {upcoming.length ? (
                upcoming.map((a) => (
                  <DeadlineRow
                    key={a.id}
                    to={`/student/assignments/${a.id}`}
                    title={a.title}
                    subject={a.subject}
                    due={a.deadlineLabel.split(' · ')[0]}
                    priority={a.priority}
                  />
                ))
              ) : (
                <EmptyState animation="/animations/check.json" title="No assignments yet" message="Enjoy your free time. New assignments will appear here." />
              )}
            </div>
          </Card>

          <ChartCard
            title="This week's capacity"
            subtitle={`${requiredThisWeek} hours of work against ${availableThisWeek} hours available`}
            legend={
              <>
                <LegendItem color={PALETTE.secondary} label="Available" />
                <LegendItem color={PALETTE.primary} label="Required" />
                <LegendItem color={PALETTE.status.risk} label="Over capacity" />
              </>
            }
          >
            <CapacityColumns data={weeklyWorkload} height={170} />
            {overloadDays.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3">
                <WorkloadBadge level="high" label="Overload risk" />
                <p className="text-[13px] font-medium text-ink-soft">
                  {formatList(overloadDays.map((d) => d.day))} need more time than you have available.
                </p>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/student/availability', icon: Clock, title: 'Update availability', body: 'Change the hours you can work this week.' },
          { to: '/student/assignments', icon: BookOpen, title: 'Browse assignments', body: 'Filter by pending, completed or overdue.' },
          { to: '/student/workload', icon: Activity, title: 'Workload intelligence', body: 'Capacity, distribution and deadline risk.' },
          { to: '/student/submissions', icon: FileClock, title: 'Submission history', body: 'What you sent and what was marked.' },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="card card-pad group transition-all hover:-translate-y-0.5 hover:shadow-lift">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-ink-soft transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
              <q.icon size={17} strokeWidth={2.1} />
            </span>
            <p className="mt-3.5 text-[14px] font-bold text-ink">{q.title}</p>
            <p className="mt-1 text-[13px] text-ink-muted">{q.body}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
