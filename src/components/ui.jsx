import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertTriangle, Info, TriangleAlert, Sparkles } from 'lucide-react'
import Lottie from './Lottie'

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
export function Logo({ size = 'md', showText = true, className = '' }) {
  const box = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
  const text = size === 'sm' ? 'text-[15px]' : size === 'lg' ? 'text-xl' : 'text-[17px]'
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${box} relative grid place-items-center rounded-[10px] bg-gradient-to-br from-brand-600 to-violetx-600 shadow-sm`}>
        <svg viewBox="0 0 24 24" fill="none" className="h-[58%] w-[58%] text-white">
          <path d="M12 3 2.8 7.2 12 11.4l9.2-4.2L12 3Z" fill="currentColor" opacity="0.95" />
          <path d="M6 10v4.4c0 1.9 2.7 3.4 6 3.4s6-1.5 6-3.4V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="19.4" cy="15.6" r="1.5" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className={`font-extrabold tracking-tight text-ink ${text}`}>
          AcadSync<span className="text-brand-600"> AI</span>
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------
export function Card({ className = '', children, hover = false, ...rest }) {
  return (
    <div
      className={`card ${hover ? 'transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="section-title text-balance">{title}</h2>
        {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions, animation }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-balance text-2xl sm:text-[28px] font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-[15px] text-ink-muted mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        {animation && <Lottie src={animation} className="hidden aspect-square w-16 shrink-0 sm:block" />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
const TONES = {
  safe: 'bg-emerald-50 text-safe border-emerald-200/70',
  warn: 'bg-amber-50 text-warn border-amber-200/70',
  risk: 'bg-red-50 text-risk border-red-200/70',
  info: 'bg-blue-50 text-info border-blue-200/70',
  brand: 'bg-brand-50 text-brand-700 border-brand-200/70',
  violet: 'bg-violetx-50 text-violetx-700 border-violetx-200/70',
  neutral: 'bg-slate-100 text-ink-soft border-slate-200',
}

export function Badge({ tone = 'neutral', children, icon: Icon, className = '', dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={12} strokeWidth={2.5} aria-hidden />}
      {children}
    </span>
  )
}

const WORKLOAD_TONE = { low: 'safe', safe: 'safe', moderate: 'warn', high: 'risk', insufficient: 'risk' }
const WORKLOAD_LABEL = { low: 'Low', safe: 'Safe', moderate: 'Moderate', high: 'High', insufficient: 'Insufficient' }

export function WorkloadBadge({ level, label, className = '' }) {
  const key = String(level || '').toLowerCase()
  return (
    <Badge tone={WORKLOAD_TONE[key] || 'neutral'} dot className={className}>
      {label || WORKLOAD_LABEL[key] || level}
    </Badge>
  )
}

export function PriorityBadge({ priority }) {
  const tone = priority === 'High' ? 'risk' : priority === 'Medium' ? 'warn' : 'safe'
  return <Badge tone={tone} dot>{priority} priority</Badge>
}

export function StatusBadge({ status }) {
  const map = {
    'Not Started': 'neutral',
    'In Progress': 'info',
    Completed: 'safe',
    Overdue: 'risk',
    Active: 'brand',
    Draft: 'neutral',
    Closed: 'neutral',
    Submitted: 'safe',
    Pending: 'warn',
    Late: 'risk',
  }
  return <Badge tone={map[status] || 'neutral'}>{status}</Badge>
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export function StatCard({ label, value, sub, icon: Icon, tone = 'brand', trend, className = '' }) {
  const iconTone = {
    brand: 'bg-brand-50 text-brand-600',
    violet: 'bg-violetx-50 text-violetx-600',
    safe: 'bg-emerald-50 text-safe',
    warn: 'bg-amber-50 text-warn',
    risk: 'bg-red-50 text-risk',
    info: 'bg-blue-50 text-info',
  }[tone]

  return (
    <Card hover className={`card-pad ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink-muted">{label}</p>
          <p className="tnum mt-2 text-[28px] leading-none font-extrabold tracking-tight text-ink">{value}</p>
          {sub && <p className="mt-2 text-[13px] leading-snug text-ink-muted">{sub}</p>}
          {trend && (
            <p className={`mt-2 text-[13px] font-semibold ${trend.up ? 'text-risk' : 'text-safe'}`}>
              {trend.up ? '▲' : '▼'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconTone}`} aria-hidden>
            <Icon size={18} strokeWidth={2.2} />
          </span>
        )}
      </div>
    </Card>
  )
}

export function ProgressBar({ value, tone = 'brand', className = '', height = 'h-2' }) {
  const bg = {
    brand: 'bg-brand-600',
    violet: 'bg-violetx-500',
    safe: 'bg-safe-mark',
    warn: 'bg-warn-mark',
    risk: 'bg-risk-mark',
    info: 'bg-info-mark',
  }[tone]
  return (
    <div className={`w-full ${height} rounded-full bg-slate-200/70 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${bg} transition-[width] duration-700 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
export function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 ${className}`} role="tablist">
      {tabs.map((t) => {
        const key = typeof t === 'string' ? t : t.key
        const label = typeof t === 'string' ? t : t.label
        const count = typeof t === 'string' ? undefined : t.count
        const isActive = active === key
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 h-8 text-[13px] font-semibold transition-all ${
              isActive ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {label}
            {count !== undefined && (
              <span className={`rounded-md px-1.5 text-[11px] font-bold ${isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-200/70 text-ink-muted'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal + confirmation
// ---------------------------------------------------------------------------
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} bg-white rounded-t-2xl sm:rounded-2xl shadow-pop animate-scale-in max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
            {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="btn btn-ghost h-8 w-8 p-0 shrink-0 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 p-5 sm:p-6 pt-4 border-t border-slate-100">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmationDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'primary' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary btn-md" onClick={onClose}>Cancel</button>
          <button className={`btn btn-md ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-soft leading-relaxed">{message}</p>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
export function EmptyState({ icon: Icon = Info, title, message, action, className = '', animation }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      {animation ? (
        <Lottie src={animation} className="mb-1 aspect-square w-32 sm:w-36" />
      ) : (
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-ink-muted mb-4">
          <Icon size={24} strokeWidth={1.8} aria-hidden />
        </span>
      )}
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {message && <p className="text-sm text-ink-muted mt-1.5 max-w-sm leading-relaxed">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-200/60 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_1.4s_infinite]" />
    </div>
  )
}

export function LoadingCard({ lines = 3 }) {
  return (
    <Card className="card-pad space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </Card>
  )
}

export function InlineAlert({ tone = 'info', title, children, action, className = '' }) {
  const cfg = {
    info: { cls: 'bg-blue-50/70 border-blue-200 text-info', Icon: Info },
    warn: { cls: 'bg-amber-50/70 border-amber-200 text-warn', Icon: AlertTriangle },
    risk: { cls: 'bg-red-50/70 border-red-200 text-risk', Icon: TriangleAlert },
    safe: { cls: 'bg-emerald-50/70 border-emerald-200 text-safe', Icon: Check },
  }[tone]
  const { Icon } = cfg
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${cfg.cls} ${className}`}>
      <Icon size={18} className="mt-0.5 shrink-0" strokeWidth={2.2} />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-bold text-ink">{title}</p>}
        <div className="text-[13px] text-ink-soft leading-relaxed mt-0.5">{children}</div>
      </div>
      {action}
    </div>
  )
}

export function Toast({ toast }) {
  if (!toast) return null
  const tone = {
    success: 'border-emerald-200 text-safe',
    info: 'border-blue-200 text-info',
    warn: 'border-amber-200 text-warn',
    error: 'border-red-200 text-risk',
  }[toast.tone] || 'border-emerald-200 text-safe'

  return createPortal(
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-up px-4 w-full sm:w-auto max-w-md">
      <div className={`flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 shadow-pop ${tone}`}>
        <Check size={16} strokeWidth={3} className="shrink-0" />
        <p className="text-sm font-semibold text-ink">{toast.message}</p>
      </div>
    </div>,
    document.body
  )
}

export function Avatar({ initials, name, size = 'md', tone = 'brand' }) {
  const cls = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-[13px]', lg: 'h-12 w-12 text-sm' }[size]
  const bg = {
    brand: 'bg-brand-100 text-brand-700',
    violet: 'bg-violetx-100 text-violetx-700',
    neutral: 'bg-slate-200 text-ink-soft',
  }[tone]
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-bold ${cls} ${bg}`} title={name}>
      {initials}
    </span>
  )
}

export function AIBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-violetx-200 bg-violetx-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violetx-700 ${className}`}>
      <Sparkles size={12} strokeWidth={2.5} />
      AcadSync Insight
    </span>
  )
}
