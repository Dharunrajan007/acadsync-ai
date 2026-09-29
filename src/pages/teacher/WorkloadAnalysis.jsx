import { TriangleAlert, AlertTriangle, CheckCircle2, Gauge } from 'lucide-react'
import { Card, PageHeader, StatCard, Badge, SectionHeader, ProgressBar } from '../../components/ui'
import { AIInsightCard } from '../../components/cards'
import { ChartCard, Columns, DonutChart, BarList, PALETTE } from '../../components/charts'
import { classWorkload } from '../../data/teacherData'

const LEVEL_TONE = { High: 'risk', Medium: 'warn', Low: 'safe' }

export default function TeacherWorkloadAnalysis() {
  const distribution = [
    { label: 'On track', value: classWorkload.onTrack, color: PALETTE.status.safe },
    { label: 'At risk', value: classWorkload.atRisk, color: PALETTE.status.warn },
    { label: 'Overloaded', value: classWorkload.overloaded, color: PALETTE.status.risk },
  ]

  return (
    <>
      <PageHeader
        animation="/animations/capacity-bars.json"
        title="Class Workload Intelligence"
        subtitle="How much academic load your classes are carrying, and where it concentrates."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average student workload" value={`${classWorkload.averageWorkload}%`} sub="Semester 5, both sections" icon={Gauge} tone="brand" />
        <StatCard label="Students overloaded" value={classWorkload.overloaded} sub="Above 80% of capacity" icon={TriangleAlert} tone="risk" />
        <StatCard label="Students at risk" value={classWorkload.atRisk} sub="Between 60% and 80%" icon={AlertTriangle} tone="warn" />
        <StatCard label="Students on track" value={classWorkload.onTrack} sub="Comfortable margin" icon={CheckCircle2} tone="safe" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Student capacity distribution" subtitle="Across the 64 students you teach">
          <DonutChart data={distribution} centerLabel="Students" centerValue={64} />
        </ChartCard>

        <Card className="card-pad">
          <SectionHeader title="Workload by subject" subtitle="Average pending hours per student" />
          <ul className="mt-5 space-y-4">
            {classWorkload.bySubject.map((s) => (
              <li key={s.subject}>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-ink">{s.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-ink-soft">{s.hours} h</span>
                    <Badge tone={LEVEL_TONE[s.level]}>{s.level}</Badge>
                  </div>
                </div>
                <ProgressBar value={s.percent} tone={LEVEL_TONE[s.level]} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <ChartCard title="Weekly assignment load" subtitle="Hours of work due each day across your classes">
          <Columns data={classWorkload.weeklyLoad.map((d) => ({ label: d.day, value: d.hours }))} height={210} unit=" h" />
        </ChartCard>

        <ChartCard title="Assignments due per day" subtitle="Count of deadlines landing on each day">
          <BarList data={classWorkload.weeklyLoad.map((d) => ({ label: d.day, value: d.assignments }))} unit=" due" />
        </ChartCard>
      </div>

      <AIInsightCard
        className="mt-5"
        title="Workload analysis"
        body="Thursday and Friday together carry 25 of the 48 hours due this week. Machine Learning alone accounts for 5.4 average pending hours per student — the highest of any subject you teach. Moving the next deadline to Monday would flatten the peak without changing scope."
        footnote="Derived from declared availability and assignment estimates across all subjects, not only yours."
      />
    </>
  )
}
