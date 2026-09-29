import { Link } from 'react-router-dom'
import {
  ArrowRight, TriangleAlert, AlertTriangle, Clock, CheckCircle2, ChevronRight, Sparkles,
} from 'lucide-react'
import { Card, EmptyState } from './ui'
import Lottie from './Lottie'

// The feed is capped on purpose: one thing that matters most, then at most three
// more. Anything beyond that belongs behind "View all" or search, not on Home.

const TONE = {
  risk: {
    band: 'bg-red-50/70 border-red-200',
    chip: 'bg-risk text-white',
    Icon: TriangleAlert,
    iconWrap: 'bg-white text-risk',
  },
  warn: {
    band: 'bg-amber-50/70 border-amber-200',
    chip: 'bg-warn text-white',
    Icon: AlertTriangle,
    iconWrap: 'bg-white text-warn',
  },
  info: {
    band: 'bg-blue-50/70 border-blue-200',
    chip: 'bg-info text-white',
    Icon: Clock,
    iconWrap: 'bg-white text-info',
  },
  safe: {
    band: 'bg-emerald-50/70 border-emerald-200',
    chip: 'bg-safe text-white',
    Icon: CheckCircle2,
    iconWrap: 'bg-white text-safe',
  },
  neutral: {
    band: 'bg-white border-slate-200',
    chip: 'bg-slate-200 text-ink-soft',
    Icon: Clock,
    iconWrap: 'bg-slate-100 text-ink-soft',
  },
}

/**
 * The single most important thing on screen. Deliberately large, with exactly
 * one primary action — this is the answer to "what should I do now?".
 */
export function PriorityCard({ activity, actions }) {
  if (!activity) return null
  const tone = TONE[activity.tone] || TONE.neutral
  const { Icon } = tone

  return (
    <Card className={`overflow-hidden border ${tone.band}`}>
      <div className="p-5 sm:p-6">
        {activity.urgency && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tone.chip}`}>
            <Icon size={12} strokeWidth={2.6} aria-hidden />
            {activity.urgency}
          </span>
        )}

        <div className="mt-3.5 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-ink sm:text-[24px]">
              {activity.title}
            </h2>
            {activity.subject && (
              <p className="mt-1 text-[14px] font-semibold text-ink-soft">{activity.subject}</p>
            )}
            {activity.detail && (
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{activity.detail}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link to={activity.to} className="btn btn-primary btn-md">
            {activity.actionLabel || 'Open'} <ArrowRight size={15} aria-hidden />
          </Link>
          {actions}
        </div>
      </div>
    </Card>
  )
}

/** A compact row for the handful of things that follow the priority card. */
export function ActivityCard({ activity }) {
  const tone = TONE[activity.tone] || TONE.neutral
  const { Icon } = tone

  return (
    <Link
      to={activity.to}
      className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-card"
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone.iconWrap}`}>
        <Icon size={17} strokeWidth={2.2} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-bold text-ink">{activity.title}</p>
        <p className="truncate text-[12.5px] text-ink-muted">
          {activity.subject ? `${activity.subject} · ` : ''}{activity.meta}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}

/**
 * A standing "this needs your attention" band, used where the concern is not a
 * single task but a situation (students at risk, an overloaded week).
 */
export function AttentionCard({ title, body, actionLabel, to, tone = 'warn', onAction }) {
  const cfg = TONE[tone] || TONE.warn
  const { Icon } = cfg

  return (
    <Card className={`overflow-hidden border ${cfg.band}`}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl shadow-sm ${cfg.iconWrap}`}>
          <Icon size={22} strokeWidth={2.1} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold tracking-tight text-ink">{title}</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{body}</p>
        </div>
        {to ? (
          <Link to={to} className="btn btn-primary btn-md shrink-0">
            {actionLabel} <ArrowRight size={15} aria-hidden />
          </Link>
        ) : (
          <button onClick={onAction} className="btn btn-primary btn-md shrink-0">
            {actionLabel}
          </button>
        )}
      </div>
    </Card>
  )
}

/**
 * The whole feed: greeting, the priority card, up to three secondary rows and a
 * single escape hatch to the full list.
 */
export default function HomeFeed({
  greeting,
  name,
  subtitle,
  primary,
  secondary = [],
  remaining = 0,
  viewAllTo,
  viewAllLabel = 'View all',
  quickActions,
  emptyState,
  children,
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          {name ? `${greeting}, ${name}.` : greeting}
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-muted">{subtitle}</p>
      </header>

      {primary ? (
        <PriorityCard activity={primary} actions={quickActions} />
      ) : (
        emptyState || (
          <Card>
            <EmptyState
              animation="/animations/check.json"
              title="You're all clear"
              message="No academic work needs your attention right now."
            />
          </Card>
        )
      )}

      {secondary.length > 0 && (
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-muted">Up next</h2>
            {viewAllTo && (
              <Link to={viewAllTo} className="btn btn-ghost btn-sm">
                {viewAllLabel}
                {remaining > 0 && <span className="text-ink-muted">({remaining} more)</span>}
                <ArrowRight size={14} aria-hidden />
              </Link>
            )}
          </div>
          <div className="space-y-2.5">
            {secondary.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}

      {children}
    </div>
  )
}

/** A calm, positive Home for when genuinely nothing needs attention. */
export function AllClear({ title = "You're all clear", message, action }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <Lottie src="/animations/check.json" className="aspect-square w-32" loop={false} />
        <h2 className="mt-1 text-[19px] font-extrabold tracking-tight text-ink">{title}</h2>
        <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-muted">{message}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </Card>
  )
}

/** Contextual quick actions. Rendered only when the situation calls for them. */
export function QuickActions({ actions = [] }) {
  if (!actions.length) return null
  return (
    <section className="mt-7">
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-ink-muted">Quick actions</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.to + action.label}
            to={action.to}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-brand-300 hover:bg-brand-50/40"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-ink-soft transition-colors group-hover:bg-white group-hover:text-brand-600">
              <action.icon size={16} strokeWidth={2.2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-ink">{action.label}</span>
              {action.hint && <span className="block text-[12px] text-ink-muted">{action.hint}</span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { Sparkles }
