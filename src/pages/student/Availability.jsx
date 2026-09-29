import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, CalendarOff, Clock, CalendarDays, Check } from 'lucide-react'
import {
  Card, PageHeader, Badge, Modal, EmptyState, InlineAlert, Tabs, ConfirmationDialog,
} from '../../components/ui'
import { useApp } from '../../context/AppContext'

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const fmt = (t) => {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}${m ? `:${String(m).padStart(2, '0')}` : ''} ${period}`
}
const hoursOf = (slots) => slots.reduce((s, x) => s + (toMinutes(x.end) - toMinutes(x.start)) / 60, 0)

export default function StudentAvailability() {
  const { availability, addSlot, updateSlot, removeSlot, toggleDayUnavailable, exceptions, setException, showToast } = useApp()
  const [view, setView] = useState('weekly')
  const [editor, setEditor] = useState(null) // { day, slot? }
  const [confirm, setConfirm] = useState(null)

  const totalHours = useMemo(
    () => availability.reduce((s, d) => s + (d.unavailable ? 0 : hoursOf(d.slots)), 0),
    [availability]
  )

  return (
    <>
      <PageHeader
        animation="/animations/clock.json"
        title="My Working Availability"
        subtitle="Help AcadSync understand when you can realistically work."
        actions={
          <Tabs
            tabs={[{ key: 'weekly', label: 'Weekly' }, { key: 'monthly', label: 'Monthly' }]}
            active={view}
            onChange={setView}
          />
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="card-pad">
          <p className="text-[13px] font-semibold text-ink-muted">Weekly available time</p>
          <p className="mt-2 text-[28px] font-extrabold leading-none text-ink">{totalHours} hours</p>
          <p className="mt-2 text-[13px] text-ink-muted">Across {availability.filter((d) => !d.unavailable && d.slots.length).length} days</p>
        </Card>
        <Card className="card-pad">
          <p className="text-[13px] font-semibold text-ink-muted">Pending work this week</p>
          <p className="mt-2 text-[28px] font-extrabold leading-none text-ink">14 hours</p>
          <p className="mt-2 text-[13px] text-ink-muted">Across 5 assignments</p>
        </Card>
        <Card className="card-pad">
          <p className="text-[13px] font-semibold text-ink-muted">Remaining capacity</p>
          <p className={`mt-2 text-[28px] font-extrabold leading-none ${totalHours - 14 < 0 ? 'text-risk' : 'text-safe'}`}>
            {(totalHours - 14).toFixed(1)} hours
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">After planned assignments</p>
        </Card>
      </div>

      {view === 'weekly' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {availability.map((day) => {
            const hrs = hoursOf(day.slots)
            return (
              <Card key={day.day} className="card-pad">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[16px] font-bold tracking-tight text-ink">{day.day}</h3>
                    {day.unavailable ? (
                      <Badge tone="neutral" dot>Unavailable</Badge>
                    ) : (
                      <Badge tone={hrs >= 3 ? 'safe' : hrs > 0 ? 'warn' : 'neutral'} dot>
                        {hrs ? `${hrs} hours free` : 'No hours set'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        toggleDayUnavailable(day.day)
                        showToast(day.unavailable ? `${day.day} marked available` : `${day.day} marked unavailable`, 'info')
                      }}
                      className="btn btn-ghost btn-sm"
                      title={day.unavailable ? 'Mark as available' : 'Mark day unavailable'}
                    >
                      <CalendarOff size={14} />
                      <span className="hidden sm:inline">{day.unavailable ? 'Make available' : 'Mark off'}</span>
                    </button>
                    <button
                      onClick={() => setEditor({ day: day.day, slot: null })}
                      className="btn btn-secondary btn-sm"
                      disabled={day.unavailable}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>

                {day.unavailable ? (
                  <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center text-[13px] font-medium text-ink-muted">
                    No work will be scheduled on {day.day}.
                  </p>
                ) : day.slots.length ? (
                  <ul className="mt-4 space-y-2.5">
                    {day.slots.map((slot) => (
                      <li key={slot.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                        <Clock size={16} className="shrink-0 text-brand-600" />
                        <span className="flex-1 text-[14px] font-bold text-ink">
                          {fmt(slot.start)} – {fmt(slot.end)}
                        </span>
                        <span className="text-[12px] font-semibold text-ink-muted">
                          {((toMinutes(slot.end) - toMinutes(slot.start)) / 60).toFixed(1)} h
                        </span>
                        <button
                          onClick={() => setEditor({ day: day.day, slot })}
                          className="btn btn-ghost h-8 w-8 rounded-lg p-0"
                          aria-label={`Edit ${day.day} slot`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm({ day: day.day, slot })}
                          className="btn btn-ghost h-8 w-8 rounded-lg p-0 text-risk"
                          aria-label={`Remove ${day.day} slot`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-[13px] text-ink-muted">
                    No working periods yet — add one to let AcadSync plan around it.
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <MonthlyAvailability exceptions={exceptions} setException={setException} showToast={showToast} />
      )}

      <InlineAlert tone="info" title="Why this matters" className="mt-5">
        Teachers see aggregated capacity, never your individual reasons. Availability is the only input that
        makes a workload estimate realistic.
      </InlineAlert>

      <SlotEditor
        key={editor ? `${editor.day}-${editor.slot?.id || 'new'}` : 'closed'}
        editor={editor}
        onClose={() => setEditor(null)}
        onSave={(start, end) => {
          if (editor.slot) {
            updateSlot(editor.day, editor.slot.id, { start, end })
            showToast('Working period updated')
          } else {
            addSlot(editor.day, start, end)
            showToast('Working period added')
          }
          setEditor(null)
        }}
      />

      <ConfirmationDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          removeSlot(confirm.day, confirm.slot.id)
          showToast('Working period removed', 'info')
          setConfirm(null)
        }}
        title="Remove this working period?"
        message={confirm ? `${confirm.day}, ${fmt(confirm.slot.start)} – ${fmt(confirm.slot.end)} will no longer be used for planning.` : ''}
        confirmLabel="Remove"
        tone="danger"
      />
    </>
  )
}

function SlotEditor({ editor, onClose, onSave }) {
  const [start, setStart] = useState(editor?.slot?.start || '18:00')
  const [end, setEnd] = useState(editor?.slot?.end || '20:00')
  const invalid = toMinutes(end) <= toMinutes(start)

  return (
    <Modal
      open={!!editor}
      onClose={onClose}
      title={editor?.slot ? 'Edit working period' : 'Add working period'}
      subtitle={editor ? `${editor.day} · used to place assignments in your timeline` : ''}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary btn-md" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-md" disabled={invalid} onClick={() => onSave(start, end)}>
            <Check size={15} /> Save period
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="slot-start">Start time</label>
          <input id="slot-start" type="time" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="slot-end">End time</label>
          <input id="slot-end" type="time" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      {invalid ? (
        <p className="mt-3 text-[13px] font-semibold text-risk">The end time must be after the start time.</p>
      ) : (
        <p className="hint mt-3">That is {((toMinutes(end) - toMinutes(start)) / 60).toFixed(1)} hours of working time.</p>
      )}
    </Modal>
  )
}

function MonthlyAvailability({ exceptions, setException, showToast }) {
  const [selected, setSelected] = useState(null)
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const exFor = (d) => exceptions.find((e) => e.date === d)

  const apply = (type, hours) => {
    setException(selected, type ? { type, hours } : null)
    showToast(type ? `September ${selected} updated` : `September ${selected} reset to normal`, 'info')
    setSelected(null)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <Card className="card-pad">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">September 2026</h2>
            <p className="mt-1 text-sm text-ink-muted">Select a date to override your usual weekly availability.</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="pb-1 text-center text-[11px] font-bold uppercase text-ink-muted">{d}</div>
          ))}
          <div />
          {days.map((d) => {
            const ex = exFor(d)
            const tone = !ex
              ? 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
              : ex.type === 'reduced'
                ? 'border-amber-200 bg-amber-50 text-warn'
                : ex.type === 'holiday'
                  ? 'border-blue-200 bg-blue-50 text-info'
                  : 'border-red-200 bg-red-50 text-risk'
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg border transition-all hover:scale-[1.04] ${tone}`}
              >
                <span className="text-[12px] font-bold text-ink">{d}</span>
                {ex && (
                  <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide">
                    {ex.type === 'reduced' ? `${ex.hours} h` : ex.type === 'holiday' ? 'Hol' : 'Off'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
          {[
            { c: 'bg-red-500', l: 'Unavailable' },
            { c: 'bg-amber-500', l: 'Reduced hours' },
            { c: 'bg-blue-500', l: 'Holiday' },
          ].map((k) => (
            <span key={k.l} className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
              <span className={`h-2.5 w-2.5 rounded-[3px] ${k.c}`} /> {k.l}
            </span>
          ))}
        </div>
      </Card>

      <Card className="card-pad">
        <h2 className="section-title">Exceptions this month</h2>
        {exceptions.length ? (
          <ul className="mt-4 space-y-3">
            {[...exceptions].sort((a, b) => a.date - b.date).map((e) => (
              <li key={e.date} className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-ink-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold text-ink">September {e.date}</p>
                  <p className="text-[12px] text-ink-muted">
                    {e.note || (e.type === 'reduced' ? `Only ${e.hours} hours available` : e.type === 'holiday' ? 'Institution holiday' : 'Unavailable')}
                  </p>
                </div>
                <button
                  onClick={() => { setException(e.date, null); showToast('Exception removed', 'info') }}
                  className="btn btn-ghost h-8 w-8 rounded-lg p-0 text-risk"
                  aria-label={`Remove exception for September ${e.date}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState animation="/animations/check.json" title="No exceptions" message="Your weekly pattern applies to every day this month." />
        )}
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`September ${selected}`}
        subtitle="Override your usual availability for this date"
        size="sm"
      >
        <div className="space-y-2">
          {[
            { label: 'Unavailable all day', type: 'unavailable' },
            { label: 'Only 2 hours available', type: 'reduced', hours: 2 },
            { label: 'Only 1 hour available', type: 'reduced', hours: 1 },
            { label: 'Holiday', type: 'holiday' },
          ].map((o) => (
            <button
              key={o.label}
              onClick={() => apply(o.type, o.hours)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-[14px] font-semibold text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-50/50"
            >
              {o.label}
            </button>
          ))}
          <button
            onClick={() => apply(null)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-[14px] font-semibold text-ink-muted transition-colors hover:bg-slate-50"
          >
            Reset to normal availability
          </button>
        </div>
      </Modal>
    </div>
  )
}
