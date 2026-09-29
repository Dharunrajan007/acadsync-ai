import { Link } from 'react-router-dom'
import { GraduationCap, School, ClipboardList, TriangleAlert, ArrowRight, AlertTriangle, Info } from 'lucide-react'
import { Card, PageHeader, StatCard, SectionHeader } from '../../components/ui'
import { ChartCard, DonutChart, BarList } from '../../components/charts'
import { AIInsightCard } from '../../components/cards'
import {
  adminSummary, workloadDistribution, assignmentsByDepartment, assignmentsBySubject,
  assignmentsByTeacher, adminAlerts,
} from '../../data/adminData'
import WelcomeBanner from '../../components/WelcomeBanner'

const ALERT_TONE = {
  warn: { cls: 'bg-amber-50/70 border-amber-200 text-warn', Icon: AlertTriangle },
  risk: { cls: 'bg-red-50/70 border-red-200 text-risk', Icon: TriangleAlert },
  info: { cls: 'bg-blue-50/70 border-blue-200 text-info', Icon: Info },
}

export default function AdminDashboard() {
  return (
    <>
      <WelcomeBanner
        tone="safe"
        animation="/animations/scan.json"
        greeting="Academic overview"
        name="September"
        subtitle="Workload, assignments and capacity across every department this week."
        stats={[
          { label: 'Avg workload', value: '68%', tone: 'text-warn' },
          { label: 'Peak deadline day', value: 'Sep 10', tone: 'text-risk' },
          { label: 'Departments', value: '4' },
        ]}
        actions={<Link to="/admin/analytics" className="btn btn-primary btn-sm">Open analytics <ArrowRight size={14} aria-hidden /></Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={adminSummary.totalStudents} sub="Across 4 departments" icon={GraduationCap} tone="brand" />
        <StatCard label="Total teachers" value={adminSummary.totalTeachers} sub="Active this term" icon={School} tone="info" />
        <StatCard label="Active assignments" value={adminSummary.activeAssignments} sub="Due in the next 14 days" icon={ClipboardList} tone="violet" />
        <StatCard label="Overloaded students" value={adminSummary.overloadedStudents} sub="Above 80% of capacity" icon={TriangleAlert} tone="risk" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Student workload distribution" subtitle="Every student, grouped by current load">
          <DonutChart data={workloadDistribution} centerLabel="Students" centerValue={adminSummary.totalStudents} />
        </ChartCard>

        <Card className="card-pad">
          <SectionHeader title="Alerts" subtitle="What needs attention this week" />
          <ul className="mt-5 space-y-3">
            {adminAlerts.map((a) => {
              const tone = ALERT_TONE[a.level]
              const Icon = tone.Icon
              return (
                <li key={a.id} className={`flex items-start gap-3 rounded-xl border p-4 ${tone.cls}`}>
                  <Icon size={18} className="mt-0.5 shrink-0" strokeWidth={2.2} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-ink">{a.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{a.body}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <Link to="/admin/analytics" className="btn btn-secondary btn-sm mt-5 w-full">
            Open analytics <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Assignments by department" subtitle="Active assignments">
          <BarList data={assignmentsByDepartment} />
        </ChartCard>
        <ChartCard title="Assignments by subject" subtitle="Active assignments">
          <BarList data={assignmentsBySubject} />
        </ChartCard>
        <ChartCard title="Assignments by teacher" subtitle="Given this term">
          <BarList data={assignmentsByTeacher} />
        </ChartCard>
      </div>

      <AIInsightCard
        className="mt-5"
        title="Institution insight"
        body="Assignment density in AI & Data Science is 31 active assignments against 168 students — the highest ratio on campus. 37 students sit above 80% of their declared capacity, and 12 of them share the September 10 deadline cluster."
        footnote="Aggregated from declared availability and assignment estimates. Guidance for academic planning only."
        actions={<Link to="/admin/analytics" className="btn btn-violet btn-sm">View workload analytics <ArrowRight size={14} /></Link>}
      />
    </>
  )
}
