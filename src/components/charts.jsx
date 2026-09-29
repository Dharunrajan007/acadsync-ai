import { useState } from 'react'
import { Card } from './ui'

// Palette — validated for colour-vision deficiency separation and contrast.
export const PALETTE = {
  series: ['#4444D6', '#0E9BA8', '#7642DA', '#C3820B', '#10906B', '#D14343'],
  status: { safe: '#10906B', warn: '#C3820B', risk: '#D14343', info: '#2A72CC' },
  primary: '#4444D6',
  secondary: '#0E9BA8',
  grid: '#E7E9F0',
  axis: '#8A90A2',
}

export function ChartCard({ title, subtitle, legend, action, children, className = '' }) {
  return (
    <Card className={`card-pad ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-[15px] font-bold tracking-tight text-ink">{title}</h3>
          {subtitle && <p className="text-[13px] text-ink-muted mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
      {legend && <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">{legend}</div>}
    </Card>
  )
}

export function LegendItem({ color, label, shape = 'square' }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink-soft">
      <span
        className={shape === 'line' ? 'h-0.5 w-4 rounded-full' : 'h-2.5 w-2.5 rounded-[3px]'}
        style={{ background: color }}
      />
      {label}
    </span>
  )
}

function Tooltip({ x, y, children }) {
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg whitespace-nowrap"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Grouped columns — required vs available hours
// ---------------------------------------------------------------------------
export function CapacityColumns({ data, height = 200 }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.flatMap((d) => [d.required, d.available]), 1)

  return (
    <div className="relative">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((d, i) => {
          const over = d.required > d.available
          return (
            <div
              key={d.day}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex h-full items-end justify-center gap-[3px]">
                <div
                  className="w-full max-w-[16px] rounded-t-[4px] transition-all duration-500"
                  style={{ height: `${(d.available / max) * 100}%`, background: PALETTE.secondary, opacity: hover === null || hover === i ? 1 : 0.45 }}
                  title={`Available ${d.available} h`}
                />
                <div
                  className="w-full max-w-[16px] rounded-t-[4px] transition-all duration-500"
                  style={{
                    height: `${(d.required / max) * 100}%`,
                    background: over ? PALETTE.status.risk : PALETTE.primary,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                  title={`Required ${d.required} h`}
                />
              </div>
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg whitespace-nowrap">
                  {d.day} · {d.required} h needed / {d.available} h free
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((d) => (
          <div key={d.day} className="flex-1 text-center text-[11px] font-semibold text-ink-muted">
            {d.day}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Simple magnitude columns (single hue)
// ---------------------------------------------------------------------------
export function Columns({ data, height = 180, color = PALETTE.primary, unit = '', valueKey = 'value', labelKey = 'label' }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={d[labelKey]}
            className="relative flex h-full flex-1 flex-col justify-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="mb-1.5 text-center text-[11px] font-bold text-ink-soft">{d[valueKey]}</span>
            <div
              className="mx-auto w-full max-w-[34px] rounded-t-[4px] transition-all duration-500"
              style={{ height: `${(d[valueKey] / max) * 88}%`, background: color, opacity: hover === null || hover === i ? 1 : 0.5 }}
            />
            {hover === i && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg whitespace-nowrap">
                {d[labelKey]} · {d[valueKey]}{unit}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d) => (
          <div key={d[labelKey]} className="flex-1 truncate text-center text-[11px] font-semibold text-ink-muted">
            {d[labelKey]}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Horizontal bars for ranked categories
// ---------------------------------------------------------------------------
export function BarList({ data, unit = '', color = PALETTE.primary, showValue = true }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label} className="group">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-[13px] font-semibold text-ink truncate">{d.label}</span>
            {showValue && <span className="text-[13px] font-bold text-ink-soft shrink-0">{d.value}{unit}</span>}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color || color }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Line chart — trend over time
// ---------------------------------------------------------------------------
export function LineChart({ data, height = 220, color = PALETTE.primary, unit = '%' }) {
  const [hover, setHover] = useState(null)
  const values = data.map((d) => d.value)
  const max = Math.max(...values) * 1.12
  const min = Math.min(...values) * 0.85
  const range = max - min || 1
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((d.value - min) / range) * 100,
    ...d,
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L100,100 L0,100 Z`

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-[calc(100%-22px)] w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={PALETTE.grid} strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        ))}
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineFill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 2.6 : 1.8}
            fill="#fff"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="cursor-pointer"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover !== null && (
        <Tooltip x={pts[hover].x} y={(pts[hover].y / 100) * 88}>
          {pts[hover].label} · {pts[hover].value}{unit}
        </Tooltip>
      )}
      <div className="mt-1.5 flex justify-between">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`text-[10px] font-semibold ${i % 2 === 0 || data.length <= 6 ? 'text-ink-muted' : 'text-transparent sm:text-ink-muted'}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Donut — part-to-whole for status categories
// ---------------------------------------------------------------------------
export function DonutChart({ data, size = 190, centerLabel, centerValue }) {
  const [hover, setHover] = useState(null)
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 42
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          {data.map((d, i) => {
            const len = (d.value / total) * c
            const dash = `${Math.max(len - 1.6, 0)} ${c - Math.max(len - 1.6, 0)}`
            const el = (
              <circle
                key={d.label}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={hover === i ? 14 : 12}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            )
            offset += len
            return el
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[26px] font-extrabold leading-none tracking-tight text-ink">
              {hover !== null ? data[hover].value : centerValue ?? total}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {hover !== null ? data[hover].label : centerLabel || 'Total'}
            </p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {data.map((d, i) => (
          <li
            key={d.label}
            className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors ${hover === i ? 'bg-slate-50' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="text-[13px] font-bold text-ink">
              {d.value}
              <span className="ml-1.5 text-[11px] font-semibold text-ink-muted">{Math.round((d.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Capacity ring — single headline number
// ---------------------------------------------------------------------------
export function CapacityIndicator({ value, label, size = 190, tone }) {
  const level = tone || (value >= 80 ? 'risk' : value >= 60 ? 'warn' : 'safe')
  const color = PALETTE.status[level]
  const r = 44
  const c = 2 * Math.PI * r

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EDEFF5" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[38px] font-extrabold leading-none tracking-tight text-ink">{value}%</p>
          {label && (
            <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stacked capacity bar — safe / moderate / insufficient distribution
// ---------------------------------------------------------------------------
export function DistributionBar({ segments, height = 'h-3' }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1
  return (
    <div className={`flex w-full gap-[2px] overflow-hidden rounded-full ${height}`}>
      {segments.map((s) => (
        <div
          key={s.label}
          className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
          style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
          title={`${s.label}: ${s.value}`}
        />
      ))}
    </div>
  )
}
