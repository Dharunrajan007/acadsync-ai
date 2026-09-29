import SettingsPage from '../shared/SettingsPage'
import { Card, SectionHeader, InlineAlert } from '../../components/ui'
import { currentAdmin } from '../../data/mockData'
import ModelInfoCard from '../../components/ModelInfoCard'

export default function AdminSystemSettings() {
  const extra = (
    <div className="space-y-5">
      <ModelInfoCard />
    <Card className="card-pad">
      <SectionHeader title="Workload thresholds" subtitle="How the platform classifies student load" />
      <div className="mt-5 space-y-4">
        {[
          ['Moderate workload threshold', '60%', 'Students above this are shown as moderate.'],
          ['High workload threshold', '80%', 'Students above this are flagged to teachers.'],
          ['Minimum capacity buffer', '1.5 hours', 'Slack below this counts as moderate capacity.'],
        ].map(([label, value, hint]) => (
          <div key={label} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">{hint}</p>
            </div>
            <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-bold text-ink">{value}</span>
          </div>
        ))}
      </div>
      <InlineAlert tone="info" className="mt-5">
        Threshold editing is not wired up in this prototype — the values above are the constants the mock capacity
        analysis uses.
      </InlineAlert>
    </Card>
    </div>
  )

  return <SettingsPage user={currentAdmin} roleLabel="Administrator" extra={extra} />
}
