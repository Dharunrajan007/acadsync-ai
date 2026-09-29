import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Sliders, LogOut, Info } from 'lucide-react'
import { Card, PageHeader, SectionHeader, Avatar, InlineAlert, Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'

function Toggle({ label, description, defaultOn = true, onToggle }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{label}</p>
        {description && <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => { setOn(!on); onToggle?.(!on) }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function SettingsPage({ user, roleLabel, extra }) {
  const navigate = useNavigate()
  const { showToast } = useApp()

  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences for this workspace. Changes are simulated in the prototype." />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="card-pad">
          <SectionHeader title="Profile" />
          <div className="mt-5 flex items-center gap-4">
            <Avatar initials={user.initials} name={user.name} size="lg" />
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-ink">{user.name}</p>
              <p className="text-[13px] text-ink-muted">{user.email}</p>
              <Badge tone="brand" className="mt-2">{roleLabel}</Badge>
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5">
            {[
              ['Department', user.department],
              ['Identifier', user.rollNo || user.designation || '—'],
              ['Class', user.className || user.semester || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <dt className="text-[13px] font-semibold text-ink-muted">{k}</dt>
                <dd className="text-[13.5px] font-semibold text-ink text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <button className="btn btn-secondary btn-md mt-6 w-full" onClick={() => showToast('Profile editing is not part of this prototype', 'info')}>
            <User size={15} /> Edit profile
          </button>
        </Card>

        <div className="space-y-5">
          <Card className="card-pad">
            <SectionHeader title="Notifications" subtitle="Choose what AcadSync should tell you about" />
            <div className="mt-3 divide-y divide-slate-100">
              <Toggle label="Deadline reminders" description="A reminder the day before each deadline." onToggle={() => showToast('Preference saved', 'info')} />
              <Toggle label="Workload alerts" description="When a day exceeds your available capacity." onToggle={() => showToast('Preference saved', 'info')} />
              <Toggle label="Capacity insights" description="Weekly summary of your workload trend." defaultOn={false} onToggle={() => showToast('Preference saved', 'info')} />
              <Toggle label="Email digest" description="A daily digest at 8:00 AM." defaultOn={false} onToggle={() => showToast('Preference saved', 'info')} />
            </div>
          </Card>

          <Card className="card-pad">
            <SectionHeader title="Workspace" subtitle="How this workspace behaves" />
            <div className="mt-3 divide-y divide-slate-100">
              <Toggle label="Show AcadSync insights" description="Display the workload insight panels across the app." onToggle={() => showToast('Preference saved', 'info')} />
              <Toggle label="Compact density" description="Tighter spacing in tables and lists." defaultOn={false} onToggle={() => showToast('Preference saved', 'info')} />
              <Toggle label="Start week on Monday" onToggle={() => showToast('Preference saved', 'info')} />
            </div>
          </Card>

          {extra}

          <InlineAlert tone="info" title="Prototype notice">
            There is no account system and nothing is persisted — preferences reset when you reload. Workload
            predictions come from the AcadSync ML service when it is running; when it is not, the app falls back
            to the transparent rule-based capacity calculation and says so on screen.
          </InlineAlert>

          <Card className="card-pad">
            <SectionHeader title="Session" />
            <button className="btn btn-secondary btn-md mt-4 w-full sm:w-auto" onClick={() => navigate('/login')}>
              <LogOut size={15} /> Exit to role selection
            </button>
          </Card>
        </div>
      </div>
    </>
  )
}
