import { TrendingUp, Users, CalendarClock, Gauge } from 'lucide-react'
import { Card, PageHeader, StatCard, Badge, SectionHeader } from '../../components/ui'
import { AIInsightCard } from '../../components/cards'
import { ChartCard, LineChart, BarList, DonutChart, Columns } from '../../components/charts'
import {
  workloadTrend, assignmentsBySubject, workloadDistribution, deadlineCongestion, adminSummary,
} from '../../data/adminData'

const CONGESTION_TONE = { high: 'risk', moderate: 'warn', low: 'safe' }
const CONGESTION_LABEL = { high: 'High congestion', moderate: 'Moderate', low: 'Low' }

export default function AdminWorkloadAnalytics() {
  const latest = workloadTrend[workloadTrend.length - 1].value
  const previous = workloadTrend[workloadTrend.length - 2].value

  return (
    <>
      <PageHeader
        animation="/animations/capacity-bars.json"
        title="Academic Workload Analytics"
        subtitle="Trends, distribution and deadline pressure across the institution."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average workload"
          value={`${latest}%`}
          sub="Academic week 37"
          icon={Gauge}
          tone="brand"
          trend={{ up: latest > previous, value: `${Math.abs(latest - previous)} points vs last week` }}
        />
        <StatCard label="Overloaded students" value={adminSummary.overloadedStudents} sub="Above 80% capacity" icon={Users} tone="risk" />
        <StatCard label="Peak deadline day" value="Sep 10" sub="12 assignments due" icon={CalendarClock} tone="warn" />
        <StatCard label="Workload trend" value={latest > previous ? 'Rising' : 'Easing'} sub="Eight-week view" icon={TrendingUp} tone="violet" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title="Workload trend" subtitle="Average student workload by academic week">
          <LineChart data={workloadTrend} height={250} unit="%" />
        </ChartCard>

        <ChartCard title="Student capacity" subtitle="Distribution across all 500 students">
          <DonutChart data={workloadDistribution} centerLabel="Students" centerValue={adminSummary.totalStudents} size={170} />
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <ChartCard title="Assignment distribution" subtitle="Active assignments by subject">
          <BarList data={assignmentsBySubject} />
        </ChartCard>

        <Card className="card-pad">
          <SectionHeader title="Deadline congestion" subtitle="Dates where too many assignments land together" />
          <div className="mt-5">
            <Columns
              data={deadlineCongestion.map((d) => ({ label: d.date.replace('September ', 'Sep '), value: d.assignments }))}
              height={160}
              unit=" due"
            />
          </div>
          <ul className="mt-6 space-y-2.5">
            {deadlineCongestion.filter((d) => d.level !== 'low').map((d) => (
              <li key={d.date} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-[14px] font-bold text-ink">{d.date}</p>
                  <p className="text-[12px] text-ink-muted">{d.assignments} assignments due · {d.departments} departments</p>
                </div>
                <Badge tone={CONGESTION_TONE[d.level]} dot>{CONGESTION_LABEL[d.level]}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <AIInsightCard
        className="mt-5"
        title="Workload analysis"
        body="Average student workload has risen 22 points over eight weeks, with the sharpest increase in the last fortnight. September 10 carries 12 assignments from 4 departments — roughly three times the daily average. Staggering two of those deadlines would relieve an estimated 140 students."
        footnote="Aggregated across departments from declared availability and assignment estimates."
      />
    </>
  )
}
