import { Link } from 'react-router-dom'
import { BookOpen, Users, Inbox, TriangleAlert, ArrowRight, PlusCircle, Clock } from 'lucide-react'
import { Card, StatCard, SectionHeader, Badge, ProgressBar, EmptyState } from '../../components/ui'
import { AIInsightCard } from '../../components/cards'
import { ChartCard, Columns, PALETTE, DistributionBar } from '../../components/charts'
import { classWorkload } from '../../data/teacherData'
import { currentTeacher } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import WelcomeBanner from '../../components/WelcomeBanner'
import Lottie from '../../components/Lottie'

export default function TeacherOverview() {
  const { teacherAssignments } = useApp()
  const active = teacherAssignments.filter((a) => a.status === 'Active')

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <>
      <WelcomeBanner
        tone="violet"
        animation="/animations/capacity-bars.json"
        greeting={greeting}
        name={currentTeacher.name}
        subtitle="Monitor assignments and student workload before the next deadline lands."
        stats={[
          { label: 'Next deadline', value: 'Tomorrow', tone: 'text-risk' },
          { label: 'Avg class workload', value: '68%', tone: 'text-warn' },
          { label: 'Sections', value: 'A & B' },
        ]}
        actions={
          <>
            <Link to="/teacher/create" className="btn btn-primary btn-sm"><PlusCircle size={15} aria-hidden /> Create assignment</Link>
            <Link to="/teacher/students?filter=high" className="btn btn-secondary btn-sm">Review flagged students</Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active assignments" value={active.length || 12} sub="Across 2 subjects" icon={BookOpen} tone="brand" />
        <StatCard label="Total students" value="64" sub="Semester 5, sections A & B" icon={Users} tone="info" />
        <StatCard label="Submissions received" value="47" sub="Of 78 expected this week" icon={Inbox} tone="safe" />
        <StatCard label="High risk students" value="8" sub="Insufficient capacity" icon={TriangleAlert} tone="risk" />
      </div>

      {/* Workload alert — deliberately prominent */}
      <Card className="mt-5 overflow-hidden border-amber-200">
        <div className="flex flex-col gap-4 bg-amber-50/60 p-5 sm:flex-row sm:items-center sm:p-6">
          <Lottie src="/animations/alert.json" className="aspect-square w-16 shrink-0 sm:w-20" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold tracking-tight text-ink">Workload attention required</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
              8 students may not have sufficient available time to complete upcoming assignments before their deadlines.
            </p>
          </div>
          <Link to="/teacher/students?filter=high" className="btn btn-primary btn-md shrink-0">
            View students <ArrowRight size={15} />
          </Link>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="card-pad">
          <SectionHeader
            title="Assignment overview"
            subtitle="Active work and its submission progress"
            action={<Link to="/teacher/assignments" className="btn btn-secondary btn-sm">All assignments</Link>}
          />

          {active.length ? (
            <ul className="mt-5 space-y-3">
              {active.slice(0, 4).map((a) => {
                const pct = Math.round((a.submitted / a.students) * 100)
                return (
                  <li key={a.id} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-ink">{a.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-ink-muted">{a.subject} · {a.className}</p>
                      </div>
                      <Badge tone={a.deadline.toLowerCase().includes('tomorrow') ? 'risk' : 'neutral'}>
                        <Clock size={11} className="mr-1" /> {a.deadline}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {[
                        ['Students', a.students],
                        ['Submitted', a.submitted],
                        ['Pending', a.pending],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{k}</p>
                          <p className="mt-0.5 text-[15px] font-extrabold text-ink">{v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3.5">
                      <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                        <span className="text-ink-muted">Submission progress</span>
                        <span className="text-ink">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} tone={pct > 70 ? 'safe' : pct > 40 ? 'warn' : 'risk'} />
                    </div>

                    {a.riskCount > 0 && (
                      <p className="mt-3 flex items-center gap-2 text-[12.5px] font-semibold text-warn">
                        <TriangleAlert size={13} /> {a.riskCount} students flagged with insufficient capacity
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No active assignments"
              message="Create an assignment and it will appear here with live submission progress."
              action={<Link to="/teacher/create" className="btn btn-primary btn-md">Create assignment</Link>}
            />
          )}
        </Card>

        <div className="space-y-5">
          <Card className="card-pad">
            <SectionHeader title="Class capacity" subtitle="Semester 5 · Section A" />
            <DistributionBar
              segments={[
                { label: 'On track', value: classWorkload.onTrack, color: PALETTE.status.safe },
                { label: 'At risk', value: classWorkload.atRisk, color: PALETTE.status.warn },
                { label: 'Overloaded', value: classWorkload.overloaded, color: PALETTE.status.risk },
              ]}
            />
            <dl className="mt-5 space-y-3">
              {[
                ['On track', classWorkload.onTrack, PALETTE.status.safe],
                ['At risk', classWorkload.atRisk, PALETTE.status.warn],
                ['Overloaded', classWorkload.overloaded, PALETTE.status.risk],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
                    {label}
                  </dt>
                  <dd className="text-[13px] font-bold text-ink">{value} students</dd>
                </div>
              ))}
            </dl>
            <Link to="/teacher/workload" className="btn btn-secondary btn-sm mt-5 w-full">
              Workload analysis <ArrowRight size={14} />
            </Link>
          </Card>

          <ChartCard title="Weekly assignment load" subtitle="Hours of work due across the class">
            <Columns data={classWorkload.weeklyLoad.map((d) => ({ label: d.day, value: d.hours }))} height={150} unit=" h" />
          </ChartCard>
        </div>
      </div>

      <AIInsightCard
        className="mt-5"
        title="Capacity recommendation"
        body="Friday carries 14 hours of due work across your two sections — twice the weekly average. Moving the Spark DataFrame Lab to the following Monday would bring 11 flagged students back inside capacity."
        footnote="AcadSync only recommends. Deadlines and scope stay entirely under your control."
        actions={<Link to="/teacher/workload" className="btn btn-violet btn-sm">Review class workload <ArrowRight size={14} /></Link>}
      />
    </>
  )
}
