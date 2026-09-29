import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, Bell, ChevronUp, ArrowLeft } from 'lucide-react'
import { Logo, Toast } from '../components/ui'
import GlobalSearch from '../components/GlobalSearch'
import { ProfileMenu } from '../components/menus'
import { useApp } from '../context/AppContext'

/**
 * The application shell.
 *
 * Navigation is four items — Home, Search, Notifications, Profile — on every
 * breakpoint. Everything the old sidebar listed is still in the app; it is now
 * reached through search, through Profile, or contextually from the screen it
 * belongs to. Cutting the nav is what makes Home readable.
 */
export default function AppLayout({ role, roleLabel, user, homePath, searchData, profileSections, jumpTo = [] }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { notifications, toast } = useApp()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const unread = notifications[role]?.filter((n) => n.unread).length || 0
  const isHome = pathname === homePath

  useEffect(() => {
    setProfileOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  // Cmd/Ctrl+K opens search from anywhere — the fastest route to any feature.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const navItems = [
    { key: 'home', label: 'Home', icon: Home, to: homePath, end: true },
    { key: 'search', label: 'Search', icon: Search, onClick: () => setSearchOpen(true) },
    { key: 'alerts', label: 'Notifications', icon: Bell, to: `${homePath}/notifications`, badge: unread },
  ]

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center px-5">
          <Link to={homePath} aria-label="AcadSync AI home"><Logo size="sm" /></Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2" aria-label="Primary">
          <div className="space-y-1">
            {navItems.map((item) => <RailItem key={item.key} item={item} />)}
          </div>

          {/* Direct links to the screens people return to daily. Search and
              Profile still reach everything; this is a shortcut, not the map. */}
          {jumpTo.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="px-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                Jump to
              </p>
              <div className="space-y-0.5">
                {jumpTo.map((item) => <RailItem key={item.to} item={{ ...item, label: item.label, to: item.to }} compact />)}
              </div>
            </div>
          )}
        </nav>

        <div className="relative p-3">
          <ProfileMenu
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            user={user}
            roleLabel={roleLabel}
            sections={profileSections}
          />
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-100"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-[12px] font-bold text-brand-700">
              {user.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-ink">{user.name}</span>
              <span className="block truncate text-[11px] text-ink-muted">{roleLabel}</span>
            </span>
            <ChevronUp size={15} className={`shrink-0 text-ink-muted transition-transform ${profileOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[236px]">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            {isHome ? (
              <Link to={homePath} aria-label="AcadSync AI home"><Logo size="sm" showText={false} /></Link>
            ) : (
              <button onClick={() => navigate(-1)} className="btn btn-ghost h-9 w-9 rounded-lg p-0" aria-label="Go back">
                <ArrowLeft size={19} />
              </button>
            )}
            <p className="flex-1 truncate text-[15px] font-bold text-ink">
              {isHome ? 'AcadSync AI' : ''}
            </p>
            <button
              onClick={() => setSearchOpen(true)}
              className="btn btn-ghost h-9 w-9 rounded-lg p-0"
              aria-label="Search"
            >
              <Search size={19} />
            </button>
          </div>
        </header>

        {/* Desktop search affordance — search is a first-class feature, not a filter */}
        <div className="sticky top-0 z-20 hidden border-b border-slate-200 bg-white/85 px-6 backdrop-blur-md lg:block">
          <div className="mx-auto flex h-16 max-w-4xl items-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-full max-w-md items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3 text-left transition-colors hover:border-slate-400"
            >
              <Search size={16} className="shrink-0 text-ink-muted" aria-hidden />
              <span className="flex-1 text-[14px] text-ink-muted">Search anything in AcadSync…</span>
              <kbd className="hidden shrink-0 rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] font-bold text-ink-muted sm:inline">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          <div className="mx-auto max-w-[1180px] animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => <TabItem key={item.key} item={item} />)}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
              profileOpen ? 'text-brand-700' : 'text-ink-muted'
            }`}
          >
            <span className="grid h-[19px] w-[19px] place-items-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-700">
              {user.initials}
            </span>
            Profile
          </button>
        </div>

        {profileOpen && (
          <div className="absolute inset-x-0 bottom-full mb-2 px-4">
            <div className="relative">
              <ProfileMenu
                open
                onClose={() => setProfileOpen(false)}
                user={user}
                roleLabel={roleLabel}
                sections={profileSections}
              />
            </div>
          </div>
        )}
      </nav>

      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        role={role}
        data={searchData}
      />
      <Toast toast={toast} />
    </div>
  )
}

function RailItem({ item, compact = false }) {
  const Icon = item.icon
  const classes = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-lg px-3 transition-all ${
      compact ? 'py-2 text-[13.5px] font-medium' : 'py-2.5 text-[14.5px] font-semibold'
    } ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-slate-100 hover:text-ink'}`

  if (item.onClick) {
    return (
      <button onClick={item.onClick} className={classes({ isActive: false }) + ' w-full text-left'}>
        <Icon size={19} strokeWidth={2.1} className="shrink-0" aria-hidden />
        {item.label}
      </button>
    )
  }

  return (
    <NavLink to={item.to} end={item.end} className={classes}>
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-600" />}
          <Icon size={compact ? 16 : 19} strokeWidth={2.1} className="shrink-0" aria-hidden />
          {item.label}
          {item.badge > 0 && (
            <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-risk px-1.5 text-[10px] font-bold text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function TabItem({ item }) {
  const Icon = item.icon
  const inner = (isActive) => (
    <>
      <span className="relative">
        <Icon size={19} strokeWidth={2.1} aria-hidden />
        {item.badge > 0 && (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-risk px-1 text-[9px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </span>
      <span className="truncate">{item.label}</span>
    </>
  )

  if (item.onClick) {
    return (
      <button
        onClick={item.onClick}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold text-ink-muted"
      >
        {inner(false)}
      </button>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
          isActive ? 'text-brand-700' : 'text-ink-muted'
        }`
      }
    >
      {({ isActive }) => inner(isActive)}
    </NavLink>
  )
}
