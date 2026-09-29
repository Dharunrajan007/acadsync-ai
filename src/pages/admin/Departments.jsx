import { Building2, Users, School, ClipboardList } from 'lucide-react'
import { Card, PageHeader, Badge, ProgressBar } from '../../components/ui'
import { ChartCard, BarList, PALETTE } from '../../components/charts'
import { departments } from '../../data/mockData'

export default function AdminDepartments() {
  const tone = (w) => (w >= 80 ? 'risk' : w >= 65 ? 'warn' : 'safe')

  return (
    <>
      <PageHeader title="Departments" subtitle="Workload standing and assignment activity per department." />

      <div className="grid gap-4 sm:grid-cols-2">
        {departments.map((d) => (
          <Card key={d.id} hover className="card-pad">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 size={20} strokeWidth={2.1} />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold tracking-tight text-ink">{d.name}</h3>
                  <p className="text-[12.5px] text-ink-muted">{d.subjects} subjects offered</p>
                </div>
              </div>
              <Badge tone={tone(d.avgWorkload)} dot>{d.avgWorkload}% avg load</Badge>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-slate-100 py-4">
              {[
                [Users, 'Students', d.students],
                [School, 'Teachers', d.teachers],
                [ClipboardList, 'Active work', d.activeAssignments],
              ].map(([Icon, k, v]) => (
                <div key={k}>
                  <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                    <Icon size={11} /> {k}
                  </dt>
                  <dd className="mt-0.5 text-[17px] font-extrabold text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                <span className="text-ink-muted">Average student workload</span>
                <span className="text-ink">{d.avgWorkload}%</span>
              </div>
              <ProgressBar value={d.avgWorkload} tone={tone(d.avgWorkload)} />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Students per department" subtitle="Enrolment across the institution">
          <BarList data={departments.map((d) => ({ label: d.name, value: d.students }))} />
        </ChartCard>
        <ChartCard title="Average workload by department" subtitle="Percentage of declared capacity used">
          <BarList
            data={departments.map((d) => ({
              label: d.name,
              value: d.avgWorkload,
              color: d.avgWorkload >= 80 ? PALETTE.status.risk : d.avgWorkload >= 65 ? PALETTE.status.warn : PALETTE.status.safe,
            }))}
            unit="%"
          />
        </ChartCard>
      </div>
    </>
  )
}
