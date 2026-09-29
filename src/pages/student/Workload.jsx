import { Link } from 'react-router-dom'
import { Clock, Layers, Gauge, ArrowRight, TriangleAlert, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, PageHeader, StatCard, Badge, WorkloadBadge, SectionHeader } from '../../components/ui'
import { AIInsightCard } from '../../components/cards'
import { ChartCard, CapacityIndicator, CapacityColumns, BarList, LegendItem, PALETTE } from '../../components/charts'
import { weeklyWorkload, subjectDistribution, deadlineRisks } from '../../data/mockData'

const RISK_META = {
  high: { tone: 'risk', Icon: TriangleAlert, label: 'High risk' },
  moderate: { tone: 'warn', Icon: AlertTriangle, label: 'Moderate risk' },
  low: { tone: 'safe', Icon: CheckCircle2, label: 'Low risk' },
}

export default function StudentWorkload() {
  const available = 18
  const pending = 14
  const remaining = available - pending

  return (
    <>
      <PageHeader
        animation="/animations/capacity-bars.json"
        title="Workload Intelligence"
        subtitle="How much work you are carrying, measured against the time you actually have."
      />

      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <Card className="card-pad flex flex-col items-center justify-center lg:w-[300px]">
          <p className="text-[13px] font-semibold text-ink-muted">Workload score</p>
          <CapacityIndicator value={72} label="Moderate workload" />
          <p className="mt-2 max-w-[240px] text-center text-[13px] leading-relaxed text-ink-muted">
            You are using 72% of your available working time this week.
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Available time" value={`${available} hours`} sub="Declared this week" icon={Clock} tone="info" />
          <StatCard label="Pending work" value={`${pending} hours`} sub="Across 5 assignments" icon={Layers} tone="violet" />
          <StatCard
            label="Remaining capacity"
            value={`${remaining} hours`}
            sub={remaining > 0 ? 'Buffer before overload' : 'Over capacity'}
            icon={Gauge}
            tone={remaining >= 4 ? 'safe' : remaining > 0 ? 'warn' : 'risk'}
          />
          <div className="sm:col-span-3">
            <ChartCard
              title="Daily capacity against required work"
              subtitle="Friday is the pressure point this week"
              legend={
                <>
                  <LegendItem color={PALETTE.secondary} label="Available" />
                  <LegendItem color={PALETTE.primary} label="Required" />
                  <LegendItem color={PALETTE.status.risk} label="Over capacity" />
                </>
              }
            >
              <CapacityColumns data={weeklyWorkload} height={190} />
            </ChartCard>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Workload by subject"
          subtitle="Estimated hours of pending work"
          action={<Badge tone="neutral">{subjectDistribution.reduce((s, d) => s + d.hours, 0)} hours total</Badge>}
        >
          <BarList
            data={subjectDistribution.map((s) => ({ label: s.subject, value: s.hours, color: s.color }))}
            unit=" h"
          />
        </ChartCard>

        <Card className="card-pad">
          <SectionHeader title="Deadline risk" subtitle="Where the schedule is tightest" />
          <ul className="mt-5 space-y-3">
            {deadlineRisks.map((r) => {
              const meta = RISK_META[r.level]
              return (
                <li key={r.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-bold text-ink">{r.title}</p>
                      <p className="text-[12px] text-ink-muted">Due {r.due}</p>
                    </div>
                    <Badge tone={meta.tone} icon={meta.Icon}>{meta.label}</Badge>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">{r.reason}</p>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <AIInsightCard
        className="mt-5"
        title="Capacity recommendation"
        body="You have sufficient time to complete all assignments this week, but your Friday workload is significantly higher than any other day. Consider completing the Database Lab before Thursday."
        footnote="Calculated from declared availability, pending estimates and deadline order. No work is rescheduled automatically."
        actions={
          <>
            <Link to="/student/timeline" className="btn btn-violet btn-sm">Open timeline <ArrowRight size={14} /></Link>
            <Link to="/student/availability" className="btn btn-ghost btn-sm">Adjust availability</Link>
          </>
        }
      />

      <Card className="card-pad mt-5">
        <SectionHeader title="How this is calculated" subtitle="Nothing hidden — the arithmetic is simple on purpose" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { n: '1', t: 'Available time', b: 'The sum of the working periods you declared, minus any exceptions for the week.' },
            { n: '2', t: 'Pending work', b: 'Estimated hours from each unfinished assignment, adjusted for the progress you have recorded.' },
            { n: '3', t: 'Risk', b: 'Work due before a deadline compared with the availability remaining before that deadline.' },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-slate-200 p-4">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-[12px] font-bold text-brand-700">{s.n}</span>
              <p className="mt-3 text-[14px] font-bold text-ink">{s.t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{s.b}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
