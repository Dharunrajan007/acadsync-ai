import { useMemo } from 'react'
import { GraduationCap, School, BarChart3, ClipboardList } from 'lucide-react'
import HomeFeed, { AllClear, QuickActions } from '../../components/HomeFeed'
import { Card } from '../../components/ui'
import { buildAdminFeed, splitFeed } from '../../lib/priority'
import { adminSummary, adminAlerts } from '../../data/adminData'

/**
 * Admin Home.
 *
 * A short overview and the issues that need a decision — not a wall of charts.
 * The full analytics surface still exists at /admin/analytics.
 */
export default function AdminHome() {
  const { activities } = useMemo(
    () => buildAdminFeed({ overloadedStudents: adminSummary.overloadedStudents, alerts: adminAlerts }),
    []
  )
  const { primary, secondary, remaining } = splitFeed(activities, 3)

  const quickActions = [
    { to: '/admin/students', icon: GraduationCap, label: 'Manage students', hint: 'Roster and workload standing' },
    { to: '/admin/teachers', icon: School, label: 'Manage teachers', hint: 'Staff and assignment activity' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Workload analytics', hint: 'Trends and congestion' },
    { to: '/admin/assignments', icon: ClipboardList, label: 'All assignments', hint: 'Across every department' },
  ]

  return (
    <HomeFeed
      greeting="Academic overview"
      subtitle="Here is what needs attention across the institution."
      primary={primary}
      secondary={secondary}
      remaining={remaining}
      viewAllTo="/admin/analytics"
      viewAllLabel="Open analytics"
      emptyState={<AllClear title="Nothing needs attention" message="No department is showing workload pressure this week." />}
    >
      {/* Three figures, not a dashboard. Everything else is one search away. */}
      <section className="mt-7">
        <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-ink-muted">At a glance</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Students', value: adminSummary.totalStudents },
            { label: 'Teachers', value: adminSummary.totalTeachers },
            { label: 'Active work', value: adminSummary.activeAssignments },
          ].map((stat) => (
            <Card key={stat.label} className="card-pad text-center">
              <p className="tnum text-[24px] font-extrabold leading-none tracking-tight text-ink">{stat.value}</p>
              <p className="mt-1.5 text-[12px] font-semibold text-ink-muted">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <QuickActions actions={quickActions} />
    </HomeFeed>
  )
}
