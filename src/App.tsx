import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'
import { fetchBooks } from './lib/booksRepo'
import type { Book, ReadingStatus } from './types'
import { STATUS_LABELS, STATUS_ORDER, SHELF_STATUSES } from './types'
import { Auth } from './components/Auth'
import { BookCard } from './components/BookCard'
import { BookDetail } from './components/BookDetail'
import { StarRating } from './components/StarRating'
import { AddBook } from './components/AddBook'
import { Icon, type IconName } from './components/Icon'
import { Logo } from './components/Logo'
import { BookOpenTransition } from './components/BookOpenTransition'
import { BookFrame } from './components/BookFrame'
import { ProgressRing } from './components/ProgressRing'
import { useRef } from 'react'

type Filter = 'all' | 'shelf' | ReadingStatus

const STATUS_ICON: Record<ReadingStatus, IconName> = {
  reading: 'book',
  owned: 'stack',
  wishlist: 'sparkle',
  read: 'check',
}

const STATUS_TINT: Record<ReadingStatus, string> = {
  reading: 'from-ember-400 to-ember-600',
  owned: 'from-brand-500 to-brand-700',
  wishlist: 'from-pink-400 to-pink-600',
  read: 'from-emerald-400 to-emerald-600',
}

export default function App() {
  const { session, user, loading: authLoading } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Book | null>(null)
  const [adding, setAdding] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [entering, setEntering] = useState(false)
  const [nameForm, setNameForm] = useState({ open: false, fn: '', ln: '', saving: false })
  const prevSession = useRef<'unset' | 'none' | 'active'>('unset')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  // Buch-Aufschlag nur beim frischen Login (nicht beim Reload mit Session)
  useEffect(() => {
    if (authLoading) return
    const now = session ? 'active' : 'none'
    const prev = prevSession.current
    prevSession.current = now
    if (prev === 'none' && now === 'active') {
      setEntering(true)
      const t = setTimeout(() => setEntering(false), 1650)
      return () => clearTimeout(t)
    }
  }, [session, authLoading])

  async function load() {
    setLoading(true)
    try {
      setBooks(await fetchBooks())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) load()
  }, [session])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: books.length }
    for (const s of STATUS_ORDER) c[s] = books.filter((b) => b.status === s).length
    return c
  }, [books])

  const stats = useMemo(() => {
    const read = books.filter((b) => b.status === 'read').length
    const shelf = books.filter((b) => SHELF_STATUSES.includes(b.status)).length
    const rated = books.filter((b) => (b.rating ?? 0) > 0)
    const avg = rated.length
      ? rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length
      : 0
    const pagesRead = books
      .filter((b) => b.status === 'read')
      .reduce((s, b) => s + (b.page_count ?? 0), 0)
    return {
      shelf,
      read,
      pct: shelf ? Math.round((read / shelf) * 100) : 0,
      avg,
      ratedCount: rated.length,
      pagesRead,
    }
  }, [books])

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim()
    return books.filter((b) => {
      if (filter === 'shelf') {
        if (!SHELF_STATUSES.includes(b.status)) return false
      } else if (filter !== 'all' && b.status !== filter) {
        return false
      }
      if (!q) return true
      return (
        b.title.toLowerCase().includes(q) ||
        b.authors.some((a) => a.toLowerCase().includes(q))
      )
    })
  }, [books, filter, search])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Logo className="h-12 w-12 animate-float" />
      </div>
    )
  }

  if (!session) return <Auth />

  const meta = (user?.user_metadata ?? {}) as {
    first_name?: string
    last_name?: string
    full_name?: string
  }
  const displayName =
    meta.full_name?.trim() ||
    [meta.first_name, meta.last_name].filter(Boolean).join(' ').trim() ||
    user?.email?.split('@')[0] ||
    'Leseratte'
  const hasName = Boolean(meta.first_name?.trim() || meta.full_name?.trim())

  async function saveName() {
    const fn = nameForm.fn.trim()
    const ln = nameForm.ln.trim()
    if (!fn) return
    setNameForm((f) => ({ ...f, saving: true }))
    await supabase.auth.updateUser({
      data: { first_name: fn, last_name: ln, full_name: `${fn} ${ln}`.trim() },
    })
    setNameForm({ open: false, fn: '', ln: '', saving: false })
  }

  return (
    <>
      {entering && <BookOpenTransition />}
    <BookFrame>
      {/* Kopfzeile (Teil der Buchseite) */}
      <header className="relative z-20 border-b border-brand-900/10 bg-paper-100/60 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 sm:rounded-tl-3xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <h1 className="font-display text-lg font-bold text-brand-800 dark:text-paper-100">
              Sallys BücherWahn
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="btn-ghost !rounded-full !px-3"
              aria-label={dark ? 'Helles Design' : 'Dunkles Design'}
            >
              <Icon name={dark ? 'sun' : 'moon'} />
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="btn-ghost !rounded-full !px-3"
              aria-label="Abmelden"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8">
        {/* Hero-Bühne */}
        <div className="hero-band mb-8 animate-fade-up">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember-300/90">
                Willkommen zurück
              </p>
              <h2 className="mt-1 font-display text-4xl font-black leading-tight sm:text-5xl">
                Hallo, {displayName}
              </h2>
              <p className="mt-2 max-w-md text-white/60">
                {books.length === 0
                  ? 'Deine Bibliothek wartet auf ihr erstes Buch.'
                  : `${books.length} ${books.length === 1 ? 'Buch' : 'Bücher'} · ${stats.shelf} im Regal · ${counts.wishlist ?? 0} auf der Wunschliste`}
              </p>

              {/* Name festlegen (für Konten ohne hinterlegten Namen) */}
              {!hasName &&
                (nameForm.open ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-ember-400 sm:max-w-[9rem]"
                      placeholder="Vorname"
                      value={nameForm.fn}
                      onChange={(e) => setNameForm((f) => ({ ...f, fn: e.target.value }))}
                    />
                    <input
                      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-ember-400 sm:max-w-[9rem]"
                      placeholder="Nachname"
                      value={nameForm.ln}
                      onChange={(e) => setNameForm((f) => ({ ...f, ln: e.target.value }))}
                    />
                    <button onClick={saveName} className="btn-accent !py-2" disabled={nameForm.saving}>
                      {nameForm.saving ? 'Speichert …' : 'Speichern'}
                    </button>
                    <button
                      onClick={() => setNameForm({ open: false, fn: '', ln: '', saving: false })}
                      className="btn !bg-white/10 !text-white hover:!bg-white/20"
                    >
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNameForm((f) => ({ ...f, open: true }))}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ember-300 hover:text-ember-200 hover:underline"
                  >
                    ✎ Namen festlegen
                  </button>
                ))}
            </div>

            {books.length > 0 && (
              <div className="flex shrink-0 items-center gap-4">
                <ProgressRing value={stats.pct} sublabel="Regal gelesen" />
                <div className="hidden flex-col gap-3 sm:flex">
                  <HeroMetric value={stats.read} label="gelesen" />
                  <HeroMetric value={stats.ratedCount ? stats.avg.toFixed(1) : '–'} label="⌀ Sterne" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bento-Statistik: Im Regal (Gruppe) + Lese-Status + Wunschliste */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { key: 'shelf', label: 'Im Regal', icon: 'stack', tint: 'from-brand-500 to-brand-700', count: stats.shelf },
              { key: 'read', label: STATUS_LABELS.read, icon: STATUS_ICON.read, tint: STATUS_TINT.read, count: counts.read ?? 0 },
              { key: 'reading', label: STATUS_LABELS.reading, icon: STATUS_ICON.reading, tint: STATUS_TINT.reading, count: counts.reading ?? 0 },
              { key: 'wishlist', label: STATUS_LABELS.wishlist, icon: STATUS_ICON.wishlist, tint: STATUS_TINT.wishlist, count: counts.wishlist ?? 0 },
            ] as { key: Filter; label: string; icon: IconName; tint: string; count: number }[]
          ).map((c) => {
            const on = filter === c.key
            return (
              <button
                key={c.key}
                onClick={() => setFilter(on ? 'all' : c.key)}
                className={`card relative overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                  on ? 'ring-2 ring-ember-400' : ''
                }`}
              >
                <div className={`mb-2 inline-flex rounded-xl bg-gradient-to-br p-2 text-white ${c.tint}`}>
                  <Icon name={c.icon} className="h-4 w-4" />
                </div>
                <div className="font-display text-3xl font-black leading-none">{c.count}</div>
                <div className="mt-1 text-xs font-medium text-brand-900/50 dark:text-paper-200/50">
                  {c.label}
                </div>
              </button>
            )
          })}
        </div>

        {/* Statistik */}
        {books.length > 0 && (
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {/* Durchschnittsbewertung */}
            <div className="card p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-900/45 dark:text-paper-200/45">
                ⌀ Bewertung
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-black">
                  {stats.ratedCount ? stats.avg.toFixed(1) : '–'}
                </span>
                <span className="text-xs text-brand-900/45 dark:text-paper-200/45">von 5</span>
              </div>
              <div className="mt-2">
                <StarRating value={Math.round(stats.avg)} size="sm" />
              </div>
              <p className="mt-2 text-xs text-brand-900/45 dark:text-paper-200/45">
                {stats.ratedCount
                  ? `${stats.ratedCount} ${stats.ratedCount === 1 ? 'Buch' : 'Bücher'} bewertet`
                  : 'Noch nichts bewertet'}
              </p>
            </div>

            {/* Gelesene Seiten */}
            <div className="card p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-900/45 dark:text-paper-200/45">
                Gelesene Seiten
              </span>
              <div className="mt-2 font-display text-2xl font-black">
                {stats.pagesRead.toLocaleString('de-DE')}
              </div>
              <p className="mt-2 text-xs text-brand-900/45 dark:text-paper-200/45">
                aus deinen gelesenen Büchern
              </p>
            </div>
          </div>
        )}

        {/* Suche + Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/35 dark:text-white/30"
            />
            <input
              className="input !pl-10"
              placeholder="In meiner Bibliothek suchen …"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`chip ${filter === 'all' ? 'chip-on' : 'chip-off'}`}
            >
              Alle ({counts.all})
            </button>
            <button
              onClick={() => setFilter('shelf')}
              className={`chip ${filter === 'shelf' ? 'chip-on' : 'chip-off'}`}
            >
              Im Regal ({stats.shelf})
            </button>
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`chip ${filter === s ? 'chip-on' : 'chip-off'}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Regal */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-2xl bg-brand-200/50 dark:bg-white/5"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="animate-fade-up py-16 text-center">
            <Logo className="mx-auto h-16 w-16 animate-float opacity-80" />
            <p className="mt-4 font-display text-lg font-semibold">
              {books.length === 0 ? 'Dein Regal ist noch leer' : 'Keine Treffer'}
            </p>
            <p className="mt-1 text-sm text-brand-900/50 dark:text-paper-200/50">
              {books.length === 0
                ? 'Tippe unten auf „Buch hinzufügen" und scanne dein erstes Buch.'
                : 'Versuch eine andere Suche oder einen anderen Filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => setSelected(book)} />
            ))}
          </div>
        )}
      </main>
    </BookFrame>

      {/* Schwebender Aktionsknopf */}
      <button
        onClick={() => setAdding(true)}
        className="btn-accent fixed bottom-6 right-6 z-30 !rounded-2xl !px-5 !py-4 text-base"
      >
        <Icon name="plus" className="h-5 w-5" />
        <span className="hidden sm:inline">Buch hinzufügen</span>
      </button>

      {adding && (
        <AddBook
          onAdded={load}
          onClose={() => {
            setAdding(false)
            load()
          }}
        />
      )}
      {selected && (
        <BookDetail
          book={selected}
          onChange={(b) => {
            setSelected(b)
            setBooks((prev) => prev.map((x) => (x.id === b.id ? b : x)))
          }}
          onDelete={(id) => setBooks((prev) => prev.filter((x) => x.id !== id))}
          onClose={() => {
            setSelected(null)
            load() // frische Zahlen aus der DB, damit Statistik/Filter garantiert stimmen
          }}
        />
      )}
    </>
  )
}

function HeroMetric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur">
      <div className="font-display text-xl font-black leading-none text-white">{value}</div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/55">
        {label}
      </div>
    </div>
  )
}
