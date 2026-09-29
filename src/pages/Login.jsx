import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, ShieldCheck, ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { Logo, Badge } from '../components/ui'
import Lottie from '../components/Lottie'
import { useApp } from '../context/AppContext'

const ROLES = [
  {
    key: 'student',
    icon: GraduationCap,
    title: 'Student',
    description: 'Manage assignments, schedules and academic workload.',
    cta: 'Continue as Student',
    to: '/student',
    accent: 'from-brand-500 to-brand-700',
    ring: 'hover:border-brand-300',
    tint: 'bg-brand-50 text-brand-600',
    points: ['Personalised timeline', 'Availability planner', 'Workload intelligence'],
  },
  {
    key: 'teacher',
    icon: BookOpen,
    title: 'Teacher',
    description: 'Assign work and understand student workload capacity.',
    cta: 'Continue as Teacher',
    to: '/teacher',
    accent: 'from-violetx-500 to-violetx-700',
    ring: 'hover:border-violetx-300',
    tint: 'bg-violetx-50 text-violetx-600',
    points: ['Capacity analysis', 'Class workload view', 'Submission review'],
  },
  {
    key: 'admin',
    icon: ShieldCheck,
    title: 'Administrator',
    description: 'Manage academic systems and monitor workload insights.',
    cta: 'Continue as Admin',
    to: '/admin',
    accent: 'from-emerald-500 to-emerald-700',
    ring: 'hover:border-emerald-300',
    tint: 'bg-emerald-50 text-safe',
    points: ['Institution analytics', 'Deadline congestion', 'Department oversight'],
  },
]

export default function Login() {
  const navigate = useNavigate()
  const { setRole } = useApp()

  const enter = (role) => {
    setRole(role.key)
    navigate(role.to)
  }

  return (
    <div className="hero-surface relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-50" aria-hidden />

      <header className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="AcadSync AI home"><Logo /></Link>
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} aria-hidden /> Back to home
        </Link>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 pb-12 pt-4 sm:px-6">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          {/* Left — identity and the animation */}
          <div className="animate-fade-up text-center lg:text-left">
            <Badge tone="violet">Demo mode · Frontend prototype</Badge>
            <h1 className="mt-5 text-[32px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
              Welcome to AcadSync AI
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
              Select how you want to continue. Each role opens a different view of the same workload data.
            </p>

            <div className="relative mt-2">
              <div
                className="absolute inset-x-8 inset-y-10 rounded-[40%] bg-gradient-to-br from-brand-500/15 via-violetx-500/12 to-transparent blur-3xl"
                aria-hidden
              />
              <Lottie
                className="relative mx-auto aspect-square w-full max-w-[360px] lg:mx-0"
                label="Coursework moving between teachers and a student"
              />
            </div>

            <div className="mx-auto flex max-w-md items-start gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 text-left lg:mx-0">
              <Info size={17} className="mt-0.5 shrink-0 text-info" aria-hidden />
              <p className="text-[13px] leading-relaxed text-ink-muted">
                <span className="font-bold text-ink">No credentials required.</span> Selecting a role takes you
                straight in. Nothing is stored and no account is created.
              </p>
            </div>
          </div>

          {/* Right — the three role cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {ROLES.map((role, i) => (
              <button
                key={role.key}
                onClick={() => enter(role)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`group animate-fade-up card relative flex h-full items-start gap-4 overflow-hidden p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:p-6 ${role.ring}`}
              >
                <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${role.accent} opacity-0 transition-opacity group-hover:opacity-100`} />

                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${role.tint}`}>
                  <role.icon size={23} strokeWidth={2.1} aria-hidden />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[18px] font-extrabold tracking-tight text-ink">{role.title}</span>
                  <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-muted">{role.description}</span>

                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {role.points.map((p) => (
                      <span key={p} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-ink-soft">
                        {p}
                      </span>
                    ))}
                  </span>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-700">
                    {role.cta}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
