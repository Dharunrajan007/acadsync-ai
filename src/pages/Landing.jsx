import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, X, ArrowRight, Clock, CalendarDays, Sparkles, ShieldCheck, BarChart3,
  Users, BookOpen, GraduationCap, LineChart, Layers, Bell, ClipboardList, FlaskConical, Check,
} from 'lucide-react'
import { Logo, Badge, Card, ProgressBar } from '../components/ui'
import Lottie from '../components/Lottie'

const FEATURES = [
  { icon: Clock, title: 'Real availability, not guesswork', body: 'Students declare the hours they can genuinely work. Every plan is built inside those hours instead of assuming a free evening.' },
  { icon: BarChart3, title: 'Capacity before assignment', body: 'Teachers see how much room a class actually has before the work is published, broken down student by student.' },
  { icon: CalendarDays, title: 'A timeline that fits', body: 'Assignments are placed into available blocks with estimated effort, so a deadline becomes a schedule.' },
  { icon: Sparkles, title: 'Workload insight', body: 'Clear, explainable signals about deadline risk and overload — presented as guidance, never as an automatic decision.' },
  { icon: ShieldCheck, title: 'Teachers stay in control', body: 'AcadSync recommends. It never moves a deadline, rescopes work, or edits a student assignment on its own.' },
  { icon: LineChart, title: 'Institution-wide visibility', body: 'Administrators see workload trends, deadline congestion and assignment density across every department.' },
]

const STEPS = [
  { n: '01', icon: Clock, title: 'Student sets availability', body: 'Weekly working hours, plus the days when life gets in the way.' },
  { n: '02', icon: BookOpen, title: 'Teachers assign academic work', body: 'With an honest estimate of how long the work should take.' },
  { n: '03', icon: BarChart3, title: 'System analyses workload capacity', body: 'Available time, existing pending work and the new assignment, compared.' },
  { n: '04', icon: CalendarDays, title: 'Students follow a personalised timeline', body: 'The work laid out across the hours they actually have.' },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="AcadSync AI home"><Logo /></Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a href="#features" className="text-[14px] font-semibold text-ink-soft transition-colors hover:text-ink">Features</a>
            <a href="#how" className="text-[14px] font-semibold text-ink-soft transition-colors hover:text-ink">How It Works</a>
            <a href="#about" className="text-[14px] font-semibold text-ink-soft transition-colors hover:text-ink">About</a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="btn btn-ghost btn-md">Login</Link>
            <Link to="/login" className="btn btn-primary btn-md">Get Started <ArrowRight size={15} /></Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="btn btn-ghost h-9 w-9 rounded-lg p-0 md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden animate-fade-in">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink-soft hover:bg-slate-100">Features</a>
              <a href="#how" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink-soft hover:bg-slate-100">How It Works</a>
              <a href="#about" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink-soft hover:bg-slate-100">About</a>
            </nav>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/login" className="btn btn-secondary btn-md w-full">Login</Link>
              <Link to="/login" className="btn btn-primary btn-md w-full">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero-surface relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute inset-0 grid-lines opacity-[0.55]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
            <div className="animate-fade-up">
              <Badge tone="violet" icon={Sparkles}>Intelligent Academic Workload Management</Badge>
              <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[46px] lg:text-[54px]">
                Academic work shouldn&apos;t feel like chaos.
              </h1>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
                Multiple assignments. Different deadlines. Limited time. AcadSync AI helps students and
                educators understand workload, manage time, and plan academic work intelligently.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className="btn btn-primary btn-lg">Explore Platform <ArrowRight size={17} /></Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Login</Link>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200/80 pt-7">
                {[
                  { k: '500', v: 'Students tracked' },
                  { k: '42', v: 'Teachers coordinated' },
                  { k: '86', v: 'Active assignments' },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="text-[24px] font-extrabold tracking-tight text-ink">{s.k}</dt>
                    <dd className="mt-0.5 text-[12px] font-semibold text-ink-muted">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="risk">The problem</Badge>
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px]">
              One student. Multiple teachers. One overloaded schedule.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
              Every teacher assigns reasonable work. Nobody sees the total. The student absorbs the difference.
            </p>
          </div>

          <ProblemDiagram />

          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center sm:p-8">
            <p className="text-[18px] font-bold leading-snug tracking-tight text-ink sm:text-[22px]">
              “But who knows how much work the student already has?”
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">
              Four reasonable assignments become nine hours of work against four hours of available time.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-b border-slate-200/70 bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <Badge tone="brand">How it works</Badge>
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px]">
              Four steps from scattered deadlines to a workable plan
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Card key={s.n} hover className="card-pad relative">
                <span className="text-[13px] font-extrabold tracking-wider text-brand-600">{s.n}</span>
                <span className="mt-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <s.icon size={20} strokeWidth={2.1} />
                </span>
                <h3 className="mt-4 text-[16px] font-bold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{s.body}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={16} className="absolute -right-3.5 top-1/2 hidden text-slate-300 lg:block" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coordination band */}
      <section className="scroll-mt-20 border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <HeroMockup />
            </div>

            <div className="order-1 lg:order-2">
              <Badge tone="brand">Coordination layer</Badge>
              <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px]">
                Every assignment already moves through the same student
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
                Departments, subjects and teachers plan independently — but the work all lands in one
                schedule. AcadSync makes that shared destination visible before the work is published,
                not after a student has already fallen behind.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  { t: 'One shared view of capacity', b: 'Availability and pending work are summed across every subject, not counted per teacher.' },
                  { t: 'Checked before publishing', b: 'The capacity check runs on a draft, so a deadline can still change without anyone being notified.' },
                  { t: 'Decisions stay with people', b: 'AcadSync surfaces the conflict and the options. The teacher chooses what happens next.' },
                ].map((f) => (
                  <li key={f.t} className="flex gap-3.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                      <Check size={13} strokeWidth={3} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[15px] font-bold text-ink">{f.t}</p>
                      <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{f.b}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link to="/login" className="btn btn-primary btn-lg mt-8">
                Explore Platform <ArrowRight size={17} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <Badge tone="violet">Platform</Badge>
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px]">
              Not an assignment tracker. A coordination layer.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
              AcadSync sits between the people assigning work and the person doing it, and makes the total visible to both.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} hover className="card-pad">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violetx-50 text-violetx-600">
                  <f.icon size={19} strokeWidth={2.1} />
                </span>
                <h3 className="mt-4 text-[16px] font-bold tracking-tight text-ink">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles / about */}
      <section id="about" className="scroll-mt-20 border-b border-slate-200/70 bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <Badge tone="brand">About</Badge>
              <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px]">
                Built around three points of view
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
                The same workload data, presented differently to each person who needs it. Students get clarity,
                teachers get context before they assign, administrators get the ecosystem view.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
                This build is a frontend prototype. Every screen is explorable with realistic mock data —
                there is no backend, and no real machine-learning model is running behind the insights.
              </p>
              <Link to="/login" className="btn btn-primary btn-lg mt-7">Explore the prototype <ArrowRight size={17} /></Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { icon: GraduationCap, role: 'Students', body: 'Know exactly what is due, how long it takes, and when it fits.', tone: 'bg-brand-50 text-brand-600' },
                { icon: Users, role: 'Teachers', body: 'See the class capacity before publishing, then decide.', tone: 'bg-violetx-50 text-violetx-600' },
                { icon: ShieldCheck, role: 'Administrators', body: 'Track workload trends and deadline congestion institution-wide.', tone: 'bg-emerald-50 text-safe' },
              ].map((r) => (
                <Card key={r.role} hover className="card-pad flex items-start gap-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${r.tone}`}>
                    <r.icon size={20} strokeWidth={2.1} />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-bold tracking-tight text-ink">{r.role}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{r.body}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="ai-surface rounded-2xl border border-violetx-200/70 p-8 text-center sm:p-12">
            <h2 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
              See the whole workload, not just your part of it.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Open the prototype and step through the student, teacher and administrator experience.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg mt-7">Get Started <ArrowRight size={17} /></Link>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
            <Logo size="sm" />
            <p className="text-[13px] text-ink-muted">Frontend prototype · Demo data only · © 2026 AcadSync AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero visual — the animation, framed by two live-looking product chips so the
// section still reads as software rather than as a stock illustration.
// ---------------------------------------------------------------------------
function HeroVisual() {
  return (
    <div className="relative animate-fade-up [animation-delay:120ms]">
      <div
        className="absolute inset-x-4 inset-y-8 rounded-[40%] bg-gradient-to-br from-brand-500/15 via-violetx-500/12 to-transparent blur-3xl"
        aria-hidden
      />

      <Lottie
        className="relative mx-auto aspect-square w-full max-w-[460px]"
        label="Coursework moving between teachers and a student across a connected campus"
      />

      {/* capacity chip */}
      <div className="absolute -bottom-2 left-0 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lift backdrop-blur-sm sm:left-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Capacity analysis</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-safe">42 safe</span>
          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-warn">10 moderate</span>
          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-risk">8 at risk</span>
        </div>
      </div>

      {/* insight chip */}
      <div className="absolute -top-1 right-0 hidden max-w-[230px] items-start gap-2 rounded-xl border border-violetx-200/70 bg-white/95 p-3 shadow-lift backdrop-blur-sm sm:flex">
        <Sparkles size={13} className="mt-0.5 shrink-0 text-violetx-600" aria-hidden />
        <p className="text-[11px] leading-snug text-ink-soft">
          <span className="font-bold text-ink">Friday is over capacity</span> — 6 h of work against 3 h free.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Product mockup — a static composition of the real product surfaces
// ---------------------------------------------------------------------------
function HeroMockup() {
  const week = [
    { d: 'Mon', req: 2, cap: 4 },
    { d: 'Tue', req: 4, cap: 3 },
    { d: 'Wed', req: 5, cap: 4 },
    { d: 'Thu', req: 2, cap: 2 },
    { d: 'Fri', req: 6, cap: 3 },
  ]
  const max = 6

  return (
    <div className="relative animate-fade-up [animation-delay:120ms]">
      <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-brand-500/10 to-violetx-500/10 blur-xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-2 text-[11px] font-semibold text-ink-muted">Student workspace · Workload</span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-ink">Good morning, Dharun</p>
              <p className="text-[11px] text-ink-muted">Here is what your workload looks like today.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-warn">
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> Moderate
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { l: "Today's work", v: '3', s: 'tasks' },
              { l: 'Pending', v: '7', s: 'assignments' },
              { l: 'Free time', v: '4.5', s: 'hours' },
            ].map((c) => (
              <div key={c.l} className="rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-semibold text-ink-muted">{c.l}</p>
                <p className="mt-1 text-[19px] font-extrabold leading-none text-ink">{c.v}</p>
                <p className="mt-1 text-[10px] text-ink-muted">{c.s}</p>
              </div>
            ))}
          </div>

          {/* insight */}
          <div className="ai-surface flex items-start gap-2.5 rounded-xl border border-violetx-200/70 p-3.5">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-violetx-600" />
            <p className="text-[11.5px] leading-relaxed text-ink-soft">
              <span className="font-bold text-ink">AcadSync Insight ·</span> Friday needs 6 hours against 3 available.
              Completing the Database Lab before Thursday clears the peak.
            </p>
          </div>

          {/* chart */}
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold text-ink">Weekly capacity</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[9.5px] font-semibold text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px] bg-[#0E9BA8]" /> Available
                </span>
                <span className="flex items-center gap-1.5 text-[9.5px] font-semibold text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px] bg-[#4444D6]" /> Required
                </span>
              </div>
            </div>
            <div className="flex h-[84px] items-end gap-2.5">
              {week.map((w) => (
                <div key={w.d} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-full w-full items-end justify-center gap-[3px]">
                    <div className="w-2.5 rounded-t-[3px] bg-[#0E9BA8]" style={{ height: `${(w.cap / max) * 100}%` }} />
                    <div
                      className="w-2.5 rounded-t-[3px]"
                      style={{ height: `${(w.req / max) * 100}%`, background: w.req > w.cap ? '#D14343' : '#4444D6' }}
                    />
                  </div>
                  <span className="text-[9.5px] font-semibold text-ink-muted">{w.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* timeline strip */}
          <div className="space-y-2">
            {[
              { t: '6:00 PM', n: 'Machine Learning Assignment', h: '1.5 h', tone: 'bg-risk' },
              { t: '7:30 PM', n: 'Database Lab', h: '1 h', tone: 'bg-warn' },
            ].map((r) => (
              <div key={r.t} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${r.tone}`} />
                <span className="w-[54px] shrink-0 text-[10px] font-bold text-ink-muted">{r.t}</span>
                <span className="flex-1 truncate text-[11.5px] font-semibold text-ink">{r.n}</span>
                <span className="text-[10px] font-bold text-ink-muted">{r.h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* floating capacity chip */}
      <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lift sm:block">
        <p className="text-[10px] font-semibold text-ink-muted">Capacity analysis</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-safe">42 safe</span>
          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-warn">10 moderate</span>
          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-risk">8 at risk</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Problem diagram — four teachers converging on one student
// ---------------------------------------------------------------------------
function ProblemDiagram() {
  const teachers = [
    { name: 'Teacher A', work: '2 hour assignment', hours: 2, icon: BookOpen },
    { name: 'Teacher B', work: '3 hour assignment', hours: 3, icon: Layers },
    { name: 'Teacher C', work: 'Project submission', hours: 2.5, icon: ClipboardList },
    { name: 'Teacher D', work: 'Lab work', hours: 1.5, icon: FlaskConical },
  ]

  return (
    <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {teachers.map((t) => (
          <div key={t.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-card">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-ink-soft">
              <t.icon size={17} strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-ink">{t.name}</p>
              <p className="text-[12px] text-ink-muted">{t.work}</p>
            </div>
            <span className="shrink-0 rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">+{t.hours} h</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center" aria-hidden>
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-1">
          {[0, 1, 2, 3].map((i) => <ArrowRight key={i} size={18} className="text-slate-300" />)}
        </div>
        <div className="rotate-90 lg:hidden"><ArrowRight size={22} className="text-slate-300" /></div>
      </div>

      <div className="rounded-2xl border border-risk/25 bg-red-50/40 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-ink shadow-sm">
            <GraduationCap size={21} strokeWidth={2.1} />
          </span>
          <div>
            <p className="text-[15px] font-extrabold tracking-tight text-ink">One student</p>
            <p className="text-[12px] text-ink-muted">Dharun · B.Tech AI &amp; Data Science</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3">
          <div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[12px] font-semibold text-ink-muted">Total assigned work</dt>
              <dd className="text-[13px] font-extrabold text-risk">9 hours</dd>
            </div>
            <ProgressBar value={100} tone="risk" className="mt-1.5" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[12px] font-semibold text-ink-muted">Available this week</dt>
              <dd className="text-[13px] font-extrabold text-ink">4 hours</dd>
            </div>
            <ProgressBar value={44} tone="brand" className="mt-1.5" />
          </div>
        </dl>

        <p className="mt-5 rounded-lg border border-risk/20 bg-white px-3 py-2.5 text-[12.5px] font-semibold text-risk">
          Deficit of 5 hours before the first deadline.
        </p>
      </div>
    </div>
  )
}
