import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'

/**
 * Contextual menu behind a "•••" trigger.
 *
 * Rarely-used actions live here rather than as permanent buttons, which is what
 * keeps the surrounding screens quiet. Nothing is removed by moving it here —
 * it is one click away, at the place where it applies.
 */
export function ContextMenu({ items = [], label = 'More actions', align = 'right', trigger }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event) => {
      if (wrapperRef.current?.contains(event.target)) return
      // Same reasoning as ProfileMenu: never close on mousedown for a click that
      // landed inside another menu, or the target unmounts before it is clicked.
      if (event.target.closest?.('[role="menu"]')) return
      setOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="btn btn-ghost h-9 w-9 rounded-lg p-0"
      >
        {trigger || <MoreHorizontal size={18} />}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-1.5 min-w-[212px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop animate-scale-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={`divider-${index}`} className="my-1.5 border-t border-slate-100" />
            ) : (
              <MenuItem key={item.label} item={item} onDone={() => setOpen(false)} />
            )
          )}
        </div>
      )}
    </div>
  )
}

function MenuItem({ item, onDone }) {
  const Icon = item.icon
  const className = `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] font-medium transition-colors ${
    item.tone === 'danger' ? 'text-risk hover:bg-red-50' : 'text-ink-soft hover:bg-slate-100 hover:text-ink'
  }`

  if (item.to) {
    return (
      <Link to={item.to} role="menuitem" onClick={onDone} className={className}>
        {Icon && <Icon size={15} className="shrink-0" aria-hidden />}
        {item.label}
      </Link>
    )
  }

  return (
    <button
      role="menuitem"
      onClick={() => { item.onClick?.(); onDone() }}
      className={className}
    >
      {Icon && <Icon size={15} className="shrink-0" aria-hidden />}
      {item.label}
    </button>
  )
}

/**
 * The profile panel — the app's "More" area.
 *
 * Everything a user needs occasionally rather than daily lives behind this:
 * account, academic profile, availability, preferences, help, sign out.
 */
export function ProfileMenu({ open, onClose, user, roleLabel, sections = [], footer }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      if (panelRef.current?.contains(event.target)) return

      // The layout mounts this panel twice — once in the desktop rail, once in
      // the mobile sheet — and only one is visible at a time. Without this check
      // the hidden instance treats a click inside the visible one as "outside",
      // closes both on mousedown, and the link is unmounted before mouseup. No
      // click event ever fires, so navigation silently never happens.
      if (event.target.closest?.('[role="menu"], [aria-haspopup="menu"]')) return

      onClose()
    }

    const onKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Profile and more"
      className="absolute bottom-full left-0 z-40 mb-2 w-[264px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-pop animate-scale-in"
    >
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-[13px] font-bold text-brand-700">
          {user.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold text-ink">{user.name}</p>
          <p className="truncate text-[12px] text-ink-muted">{roleLabel}</p>
        </div>
      </div>

      {sections.map((section, index) => (
        <div key={section.title || index}>
          {index > 0 && <div className="my-1.5 border-t border-slate-100" />}
          {section.title && (
            <p className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
              {section.title}
            </p>
          )}
          {section.items.map((item) => (
            <MenuItem key={item.label} item={item} onDone={onClose} />
          ))}
        </div>
      ))}

      {footer}
    </div>
  )
}
