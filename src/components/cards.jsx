import { Link } from 'react-router-dom'
import {
  Sparkles, Clock, CalendarDays, ArrowRight, User, Coffee, BookOpen,
  CheckCircle2, AlertTriangle, Info, TriangleAlert, ChevronRight,
} from 'lucide-react'
import { Card, Badge, StatusBadge, PriorityBadge, WorkloadBadge, ProgressBar, Avatar } from './ui'

// ---------------------------------------------------------------------------
// AI insight — the only place a gradient surface is used inside the app
// ---------------------------------------------------------------------------
export function AIInsightCard({ title = 'AcadSync Intelligence', body, actions, footnote, className = '' }) {
  return (
    <div className={`ai-surface relative overflow-hidden rounded-2xl border border-violetx-200/70 p-5 sm:p-6 ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-violetx-300/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/80 text-violetx-600 shadow-sm">
            <Sparkles size={15} strokeWidth={2.4} />
          </span>
          <h3 className="text-[15px] font-bold tracking-tight text-ink">{title}</h3>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft max-w-3xl">{body}</p>
        {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
        {footnote && <p className="mt-3.5 text-[11px] font-medium text-ink-muted">{footnote}</p>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Assignment card (student view)
// ---------------------------------------------------------------------------
export function AssignmentCard({ assignment, to }) {
  const a = assignment
  const overdue = a.status === 'Overdue'
  return (
    <Card hover className="card-pad flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{a.subject}</Badge>
            {a.isNew && <Badge tone="violet">New</Badge>}
          </div>
          <h3 className="mt-2.5 text-[16px] font-bold tracking-tight text-ink">{a.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-muted">
            <User size={13} /> {a.teacher}
          </p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Meta icon={CalendarDays} label="Deadline" value={a.deadlineLabel} tone={overdue ? 'risk' : undefined} />
        <Meta icon={Clock} label="Estimated" value={`${a.estimatedHours} hours`} />
        <Meta icon={BookOpen} label="Marks" value={`${a.marks} marks`} className="hidden sm:block" />
      </div>

      {a.status !== 'Not Started' && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
            <span className="text-ink-muted">Progress</span>
            <span className="tnum text-ink">{a.progress}%</span>
          </div>
          <ProgressBar value={a.progress} tone={overdue ? 'risk' : a.progress === 100 ? 'safe' : 'brand'} />
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <PriorityBadge priority={a.priority} />
        <Link to={to} className="btn btn-secondary btn-sm">
          View assignment <ArrowRight size={14} />
        </Link>
      </div>
    </Card>
  )
}

function Meta({ icon: Icon, label, value, tone, className = '' }) {
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        <Icon size={12} /> {label}
      </p>
      <p className={`mt-1 text-[13px] font-bold ${tone === 'risk' ? 'text-risk' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Timeline (today's plan)
// ---------------------------------------------------------------------------
export function Timeline({ items }) {
  return (
    <ol className="relative space-y-1">
      {items.map((item, i) => {
        const isBreak = item.type === 'break'
        const tone = isBreak ? 'neutral' : item.priority === 'High' ? 'risk' : item.priority === 'Medium' ? 'warn' : 'info'
        const dot = { risk: 'bg-risk-mark', warn: 'bg-warn-mark', info: 'bg-info-mark', neutral: 'bg-slate-300' }[tone]
        return (
          <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0 sm:gap-4">
            <div className="flex w-[52px] shrink-0 justify-end pt-0.5 sm:w-[68px]">
              <span className="text-[12px] font-bold text-ink-soft">{item.time}</span>
            </div>
            <div className="relative flex flex-col items-center">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white ${dot}`} />
              {i < items.length - 1 && <span className="absolute top-4 h-full w-px bg-slate-200" />}
            </div>
            <div
              className={`min-w-0 flex-1 rounded-xl border px-3.5 py-3 transition-colors sm:px-4 ${
                isBreak ? 'border-dashed border-slate-200 bg-slate-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`min-w-0 break-words text-[14px] font-bold ${isBreak ? 'text-ink-muted' : 'text-ink'}`}>
                  {isBreak && <Coffee size={13} className="mr-1.5 inline" />}
                  {item.title}
                </p>
                {item.priority && <Badge tone={tone} dot>{item.priority}</Badge>}
              </div>
              <p className="mt-1 break-words text-[12px] text-ink-muted">
                {item.subject ? `${item.subject} · ` : ''}
                {item.hours >= 1 ? `${item.hours} hour${item.hours > 1 ? 's' : ''}` : `${item.hours * 60} minutes`}
                {' · '}{item.time} – {item.endTime}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Deadline row
// ---------------------------------------------------------------------------
export function DeadlineRow({ title, subject, due, priority, to }) {
  const tone = priority === 'High' ? 'risk' : priority === 'Medium' ? 'warn' : 'safe'
  const dot = { risk: 'bg-risk-mark', warn: 'bg-warn-mark', safe: 'bg-safe-mark' }[tone]
  return (
    <Link
      to={to}
      className="flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink">{title}</p>
        <p className="text-[12px] text-ink-muted">{subject}</p>
      </div>
      <div className="text-right">
        <p className="text-[12px] font-bold text-ink">{due}</p>
        <p className={`text-[11px] font-semibold ${tone === 'risk' ? 'text-risk' : tone === 'warn' ? 'text-warn' : 'text-safe'}`}>
          {priority} priority
        </p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-ink-muted" />
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------
const NOTIF = {
  risk: { Icon: TriangleAlert, cls: 'bg-red-50 text-risk' },
  warn: { Icon: AlertTriangle, cls: 'bg-amber-50 text-warn' },
  info: { Icon: Info, cls: 'bg-blue-50 text-info' },
  safe: { Icon: CheckCircle2, cls: 'bg-emerald-50 text-safe' },
}

export function NotificationItem({ notification, onRead }) {
  const { Icon, cls } = NOTIF[notification.level] || NOTIF.info
  return (
    <button
      onClick={() => onRead?.(notification.id)}
      className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all hover:shadow-card ${
        notification.unread ? 'border-slate-200 bg-white' : 'border-transparent bg-slate-50/70'
      }`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${cls}`}>
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-[14px] ${notification.unread ? 'font-bold text-ink' : 'font-semibold text-ink-soft'}`}>
            {notification.title}
          </p>
          {notification.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{notification.body}</p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{notification.time}</p>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Student card (teacher view)
// ---------------------------------------------------------------------------
export function StudentCard({ student, to }) {
  const level = student.workload >= 80 ? 'high' : student.workload >= 60 ? 'moderate' : 'low'
  const tone = level === 'high' ? 'risk' : level === 'moderate' ? 'warn' : 'safe'
  return (
    <Card hover className="card-pad flex h-full flex-col">
      <div className="flex items-start gap-3.5">
        <Avatar initials={student.initials} name={student.name} tone={level === 'high' ? 'violet' : 'brand'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-ink">{student.name}</p>
          <p className="truncate text-[12px] text-ink-muted">{student.department} · {student.section}</p>
        </div>
        <WorkloadBadge level={level} />
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
          <span className="text-ink-muted">Current workload</span>
          <span className="tnum text-ink">{student.workload}%</span>
        </div>
        <ProgressBar value={student.workload} tone={tone} />
      </div>

      <dl className="mb-4 mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Available</dt>
          <dd className="tnum mt-0.5 text-[14px] font-bold text-ink">{student.availableHours} h</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Completion</dt>
          <dd className="tnum mt-0.5 text-[14px] font-bold text-ink">{student.completionRate}%</dd>
        </div>
      </dl>

      <Link to={to} className="btn btn-secondary btn-sm mt-auto w-full">
        View profile <ArrowRight size={14} />
      </Link>
    </Card>
  )
}
