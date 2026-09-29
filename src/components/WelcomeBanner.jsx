import Lottie from './Lottie'

/**
 * The greeting band at the top of each workspace. It carries the one number that
 * matters most for that role, so the first thing on screen is a status rather
 * than decoration — the animation sits beside it, never in place of it.
 */
export default function WelcomeBanner({ greeting, name, subtitle, stats = [], actions, tone = 'brand', animation }) {
  const wash = {
    brand: 'from-brand-50 via-white to-violetx-50/60',
    violet: 'from-violetx-50 via-white to-brand-50/60',
    safe: 'from-emerald-50/70 via-white to-brand-50/50',
  }[tone]

  return (
    <div className={`relative mb-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r ${wash} shadow-card`}>
      <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violetx-300/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[30px]">
            {greeting}, {name}.
          </h1>
          <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-ink-soft">{subtitle}</p>

          {stats.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-t border-slate-200/70 pt-5">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{s.label}</dt>
                  <dd className={`tnum mt-1 text-[22px] font-extrabold leading-none tracking-tight ${s.tone || 'text-ink'}`}>
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {actions && <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>}
        </div>

        <Lottie src={animation} className="mx-auto aspect-square w-40 shrink-0 sm:w-48 lg:mx-0 lg:w-52" />
      </div>
    </div>
  )
}
