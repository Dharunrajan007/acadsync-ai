import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Info, Sparkles } from 'lucide-react'
import { Card, PageHeader, Tabs, Badge, EmptyState, InlineAlert } from '../../components/ui'
import { Timeline as DayTimeline, AIInsightCard } from '../../components/cards'
import { todayPlan, weekTimeline, monthTimeline, monthlyExceptions } from '../../data/mockData'

const SUBJECT_TONE = {
  'Machine Learning': { bar: '#7642DA', bg: 'bg-violetx-50', border: 'border-violetx-200', text: 'text-violetx-700' },
  'Database Management Systems': { bar: '#2A72CC', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-info' },
  'Java Programming': { bar: '#C3820B', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-warn' },
  'Python Programming': { bar: '#10906B', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-safe' },
  'Big Data Analytics': { bar: '#D14343', bg: 'bg-red-50', border: 'border-red-200', text: 'text-risk' },
  default: { bar: '#4444D6', bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700' },
}
const toneFor = (s) => SUBJECT_TONE[s] || SUBJECT_TONE.default

export default function StudentTimeline() {
  const [view, setView] = useState('week')

  return (
    <>
      <PageHeader
        title="My Academic Timeline"
        subtitle="Your assignments organised around your available time."
        actions={
          <Tabs
            tabs={[{ key: 'day', label: 'Day' }, { key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }]}
            active={view}
            onChange={setView}
          />
        }
      />

      <AIInsightCard
        className="mb-5"
        title="Timeline note"
        body="Friday carries 6 hours of planned work against 3 hours of availability. Moving the Big Data lab to Saturday morning brings every day inside capacity."
        footnote="Suggestion only — nothing is rescheduled automatically."
      />

      {view === 'day' && <DayView />}
      {view === 'week' && <WeekView />}
      {view === 'month' && <MonthView />}
    </>
  )
}

function DayView() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card className="card-pad">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Wednesday, September 3</h2>
            <p className="mt-1 text-sm text-ink-muted">Available 5:00 PM – 9:00 PM · 4 hours</p>
          </div>
          <Badge tone="warn" dot>3.5 h scheduled</Badge>
        </div>
        <DayTimeline items={todayPlan} />
      </Card>

      <div className="space-y-5">
        <Card className="card-pad">
          <h3 className="section-title">Available blocks</h3>
          <ul className="mt-4 space-y-3">
            {[
              { from: '5:00 PM', to: '7:00 PM', used: '2 h used', full: true },
              { from: '7:00 PM', to: '9:00 PM', used: '1.5 h used', full: false },
            ].map((b) => (
              <li key={b.from} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-ink">{b.from} – {b.to}</p>
                  <Badge tone={b.full ? 'warn' : 'safe'}>{b.full ? 'Full' : 'Space left'}</Badge>
                </div>
                <p className="mt-1 text-[13px] text-ink-muted">{b.used}</p>
              </li>
            ))}
          </ul>
        </Card>

        <InlineAlert tone="info" title="How this timeline is built">
          Assignments are placed inside your declared availability, ordered by deadline and estimated effort.
          Update your availability and the plan re-flows.
        </InlineAlert>
      </div>
    </div>
  )
}

function WeekView() {
  const HOURS = [16, 17, 18, 19, 20, 21, 22]
  const fmt = (h) => (h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`)

  return (
    <>
      {/* Desktop grid */}
      <Card className="hidden overflow-hidden lg:block">
        <div className="grid grid-cols-[86px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/70">
          <div className="px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Time</div>
          {weekTimeline.map((d) => (
            <div key={d.day} className="border-l border-slate-200 px-3 py-3">
              <p className="text-[13px] font-bold text-ink">{d.day}</p>
              <p className="text-[11px] text-ink-muted">{d.date} · {d.capacityHours} h free</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[86px_repeat(7,1fr)]">
          <div>
            {HOURS.map((h) => (
              <div key={h} className="h-14 border-b border-slate-100 px-3 pt-1 text-[11px] font-semibold text-ink-muted last:border-b-0">
                {fmt(h)}
              </div>
            ))}
          </div>

          {weekTimeline.map((day) => (
            <div key={day.day} className="relative border-l border-slate-200">
              {HOURS.map((h) => (
                <div key={h} className="h-14 border-b border-slate-100 last:border-b-0" />
              ))}
              {day.capacityHours === 0 && (
                <div className="absolute inset-0 grid place-items-center bg-slate-50/70">
                  <span className="rotate-[-4deg] rounded-md bg-white px-2 py-1 text-[11px] font-bold text-ink-muted shadow-sm">
                    Unavailable
                  </span>
                </div>
              )}
              {day.blocks.map((b) => {
                const tone = toneFor(b.subject)
                const top = (b.from - 16) * 56
                const height = (b.to - b.from) * 56 - 4
                return (
                  <div
                    key={b.id}
                    className={`absolute left-1 right-1 overflow-hidden rounded-lg border ${tone.border} ${tone.bg} px-2 py-1.5 transition-shadow hover:shadow-card`}
                    style={{ top: `${top + 2}px`, height: `${height}px` }}
                    title={`${b.title} · ${b.to - b.from} h`}
                  >
                    <span className="absolute inset-y-1 left-0 w-1 rounded-full" style={{ background: tone.bar }} />
                    <p className="ml-2 truncate text-[11.5px] font-bold text-ink">{b.title}</p>
                    <p className={`ml-2 truncate text-[10.5px] font-semibold ${tone.text}`}>{b.to - b.from} h · {b.priority}</p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Mobile / tablet stacked */}
      <div className="space-y-4 lg:hidden">
        {weekTimeline.map((day) => {
          const planned = day.blocks.reduce((s, b) => s + (b.to - b.from), 0)
          const over = planned > day.capacityHours
          return (
            <Card key={day.day} className="card-pad">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold text-ink">{day.day}</p>
                  <p className="text-[12px] text-ink-muted">{day.date} · {day.available}</p>
                </div>
                <Badge tone={day.capacityHours === 0 ? 'neutral' : over ? 'risk' : 'safe'}>
                  {day.capacityHours === 0 ? 'Unavailable' : `${planned} / ${day.capacityHours} h`}
                </Badge>
              </div>

              {day.blocks.length ? (
                <ul className="mt-4 space-y-2.5">
                  {day.blocks.map((b) => {
                    const tone = toneFor(b.subject)
                    return (
                      <li key={b.id} className={`relative overflow-hidden rounded-xl border ${tone.border} ${tone.bg} py-3 pl-4 pr-3`}>
                        <span className="absolute inset-y-2 left-0 w-1 rounded-full" style={{ background: tone.bar }} />
                        <p className="text-[13.5px] font-bold text-ink">{b.title}</p>
                        <p className="mt-0.5 text-[12px] text-ink-muted">
                          {b.subject} · {b.to - b.from} h · {b.priority} priority
                        </p>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-[13px] text-ink-muted">
                  {day.capacityHours === 0 ? 'Marked unavailable' : 'No work scheduled — free block'}
                </p>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}

function MonthView() {
  const first = 1 // September 2026 starts on a Tuesday in this prototype
  const pad = Array.from({ length: first }, (_, i) => i)
  const exception = (d) => monthlyExceptions.find((e) => e.date === d)

  const loadTone = (load) =>
    load === 0 ? 'bg-slate-50 text-ink-muted' : load <= 2 ? 'bg-emerald-50 text-safe' : load <= 4 ? 'bg-amber-50 text-warn' : 'bg-red-50 text-risk'

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <Card className="card-pad">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">September 2026</h2>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { c: 'bg-emerald-500', l: 'Light' },
              { c: 'bg-amber-500', l: 'Moderate' },
              { c: 'bg-red-500', l: 'Heavy' },
            ].map((k) => (
              <span key={k.l} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                <span className={`h-2.5 w-2.5 rounded-[3px] ${k.c}`} /> {k.l}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="pb-1 text-center text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              {d.slice(0, 1)}<span className="hidden sm:inline">{d.slice(1)}</span>
            </div>
          ))}
          {pad.map((p) => <div key={`pad-${p}`} />)}
          {monthTimeline.map((d) => {
            const ex = exception(d.date)
            return (
              <div
                key={d.date}
                title={ex ? ex.note : `${d.load} hours of work planned`}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-center transition-all hover:scale-[1.04] ${
                  ex ? 'border-dashed border-slate-300 bg-slate-100/80' : `border-transparent ${loadTone(d.load)}`
                }`}
              >
                <span className="text-[12px] font-bold text-ink">{d.date}</span>
                {ex ? (
                  <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-muted">
                    {ex.type === 'reduced' ? `${ex.hours} h` : ex.type === 'holiday' ? 'Holiday' : 'Off'}
                  </span>
                ) : (
                  <span className="mt-0.5 text-[9.5px] font-semibold">{d.load ? `${d.load} h` : '—'}</span>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="card-pad">
          <h3 className="section-title">Heaviest days</h3>
          <ul className="mt-4 space-y-3">
            {[...monthTimeline].sort((a, b) => b.load - a.load).slice(0, 4).map((d) => (
              <li key={d.date} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-[13.5px] font-semibold text-ink">September {d.date}</span>
                <Badge tone={d.load >= 5 ? 'risk' : 'warn'}>{d.load} hours</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="card-pad">
          <h3 className="section-title">Availability exceptions</h3>
          <ul className="mt-4 space-y-3">
            {monthlyExceptions.map((e) => (
              <li key={e.date} className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">September {e.date}</p>
                  <p className="text-[12px] text-ink-muted">{e.note}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/student/availability" className="btn btn-secondary btn-sm mt-4 w-full">Manage availability</Link>
        </Card>
      </div>
    </div>
  )
}
