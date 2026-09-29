import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, X, CornerDownLeft, Clock3, ArrowRight, Trash2 } from 'lucide-react'
import {
  addRecentSearch, buildIndex, clearRecentSearches, getRecentSearches, groupResults, searchIndex,
} from '../lib/searchIndex'

/**
 * Universal search.
 *
 * Navigation was reduced to four items, so this is how everything else is
 * reached. It is a palette, not just a filter: destinations and actions rank
 * above records, because someone typing "availability" wants the screen.
 *
 * Opens with ⌘K / Ctrl+K, or the Search item in the nav.
 */
export default function GlobalSearch({ open, onClose, role, data }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [recent, setRecent] = useState([])

  const index = useMemo(() => buildIndex(role, data), [role, data])
  const results = useMemo(() => searchIndex(index, query), [index, query])
  const groups = useMemo(() => groupResults(results), [results])
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setRecent(getRecentSearches())
      // Autofocus after the dialog paints, or the caret lands nowhere.
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    const node = listRef.current?.querySelector('[data-active="true"]')
    node?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const go = (entry) => {
    addRecentSearch(entry)
    onClose()
    navigate(entry.to)
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((c) => Math.min(c + 1, Math.max(flat.length - 1, 0)))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
      return
    }
    if (event.key === 'Enter' && flat[cursor]) {
      event.preventDefault()
      go(flat[cursor])
    }
  }

  if (!open) return null

  let runningIndex = -1

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[10vh] sm:pt-[14vh]">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[3px] animate-fade-in" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search AcadSync"
        className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-pop animate-scale-in"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search size={18} className="shrink-0 text-ink-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search anything in AcadSync…"
            aria-label="Search anything in AcadSync"
            className="no-focus-ring h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
          />
          <button onClick={onClose} className="btn btn-ghost h-8 w-8 shrink-0 rounded-lg p-0" aria-label="Close search">
            <X size={17} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {query && flat.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-[14px] font-semibold text-ink">Nothing matches “{query}”</p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Try a subject, a person, a screen name or an action like “submit”.
              </p>
            </div>
          )}

          {!query && (
            <>
              {recent.length > 0 && (
                <section className="mb-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Recent</h3>
                    <button
                      onClick={() => { clearRecentSearches(); setRecent([]) }}
                      className="btn btn-ghost h-6 rounded-md px-1.5 text-[11px]"
                    >
                      <Trash2 size={11} aria-hidden /> Clear
                    </button>
                  </div>
                  {recent.map((entry) => (
                    <button
                      key={entry.title}
                      onClick={() => go(entry)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <Clock3 size={15} className="shrink-0 text-ink-muted" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-soft">{entry.title}</span>
                    </button>
                  ))}
                </section>
              )}

              <section>
                <h3 className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Jump to
                </h3>
                {index.filter((e) => e.type === 'destination').slice(0, 5).map((entry) => (
                  <ResultRow key={entry.id} entry={entry} active={false} onSelect={() => go(entry)} />
                ))}
              </section>
            </>
          )}

          {groups.map((group) => (
            <section key={group.name} className="mb-1">
              <h3 className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {group.name}
              </h3>
              {group.items.map((entry) => {
                runningIndex += 1
                const active = runningIndex === cursor
                const currentIndex = runningIndex
                return (
                  <ResultRow
                    key={entry.id}
                    entry={entry}
                    active={active}
                    onSelect={() => go(entry)}
                    onHover={() => setCursor(currentIndex)}
                  />
                )
              })}
            </section>
          ))}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <div className="flex items-center gap-3 text-[11px] font-medium text-ink-muted">
            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
            <span className="flex items-center gap-1"><Kbd><CornerDownLeft size={10} /></Kbd> open</span>
            <span className="flex items-center gap-1"><Kbd>esc</Kbd> close</span>
          </div>
          <span className="text-[11px] font-medium text-ink-muted">
            {query ? `${flat.length} result${flat.length === 1 ? '' : 's'}` : 'Everything is searchable'}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ResultRow({ entry, active, onSelect, onHover }) {
  const Icon = entry.icon || Search
  return (
    <button
      data-active={active}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-brand-50' : 'hover:bg-slate-50'
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
        active ? 'bg-white text-brand-600' : 'bg-slate-100 text-ink-soft'
      }`}>
        <Icon size={15} strokeWidth={2.1} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[14px] font-semibold ${active ? 'text-brand-700' : 'text-ink'}`}>
          {entry.title}
        </span>
        {entry.subtitle && (
          <span className="block truncate text-[12px] text-ink-muted">{entry.subtitle}</span>
        )}
      </span>
      {active && <ArrowRight size={14} className="shrink-0 text-brand-600" aria-hidden />}
    </button>
  )
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-slate-300 bg-white px-1 font-sans text-[10px] font-bold text-ink-muted">
      {children}
    </kbd>
  )
}
