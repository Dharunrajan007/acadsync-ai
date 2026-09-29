import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Bell, LogOut, ChevronsUpDown, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Logo, Avatar, Toast } from '../components/ui'
import { useApp } from '../context/AppContext'

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-semibold transition-all ${
          isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-slate-100 hover:text-ink'
        } ${collapsed ? 'justify-center px-2' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-600" />}
          <Icon size={18} strokeWidth={2.1} className="shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && item.badge ? (
            <span className="ml-auto rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}

export default function DashboardLayout({ nav, user, roleLabel, bottomNav = [], scope }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { notifications, toast } = useApp()

  const unread = notifications[scope]?.filter((n) => n.unread).length || 0

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center border-b border-slate-200 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <Link to="/" aria-label="AcadSync AI home">
          <Logo size="sm" showText={!collapsed} />
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="btn btn-ghost hidden h-8 w-8 rounded-lg p-0 lg:inline-flex"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="btn btn-ghost mx-auto mt-3 hidden h-8 w-8 rounded-lg p-0 lg:inline-flex"
          aria-label="Expand sidebar"
        >
          <PanelLeft size={16} />
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-muted">{roleLabel}</p>
        )}
        {nav.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar initials={user.initials} name={user.name} />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-ink">{user.name}</p>
                <p className="truncate text-[11px] text-ink-muted">{user.department}</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-ghost h-8 w-8 shrink-0 rounded-lg p-0"
                aria-label="Switch role"
                title="Switch role"
              >
                <ChevronsUpDown size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:block ${
          collapsed ? 'w-[76px]' : 'w-[264px]'
        }`}
      >
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px] animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[272px] border-r border-slate-200 bg-white shadow-pop animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="btn btn-ghost absolute right-3 top-3.5 z-10 h-8 w-8 rounded-lg p-0"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="btn btn-ghost h-9 w-9 rounded-lg p-0 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="lg:hidden" aria-label="AcadSync AI home">
              <Logo size="sm" showText={false} />
            </Link>

            <div className="relative ml-auto hidden max-w-sm flex-1 sm:ml-0 sm:block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="search"
                placeholder="Search assignments, students, subjects…"
                aria-label="Search"
                className="input pl-9"
              />
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <Link
                to={`${nav[0].to.split('/').slice(0, 2).join('/')}/notifications`}
                className="btn btn-ghost relative h-9 w-9 rounded-lg p-0"
                aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-risk px-1 text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-ghost h-9 gap-2 rounded-lg px-2.5 text-[13px]"
                title="Exit to role selection"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <div className="mx-auto max-w-[1400px] animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {bottomNav.length > 0 && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            {bottomNav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                      isActive ? 'text-brand-700' : 'text-ink-muted'
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={2.1} />
                  <span className="truncate">{item.short || item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}

      <Toast toast={toast} />
    </div>
  )
}
