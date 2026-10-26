import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'
import { fetchBooks } from './lib/booksRepo'
import { computeStats } from './lib/stats'
import { goalProgress, planText } from './lib/goals'
import { readSettings } from './lib/settings'
import { asTheme, setTheme } from './lib/theme'
import type { Book, ReadingStatus } from './types'
import { STATUS_LABELS, STATUS_ORDER } from './types'
import { Auth } from './components/Auth'
import { AddBook } from './components/AddBook'
import { BookDetail } from './components/BookDetail'
import { AuthorWorks } from './components/AuthorWorks'
import { BookTile } from './components/BookTile'
import { Chronicle } from './components/Chronicle'
import { Emblem, Flourish } from './components/Emblem'
import { Sky } from './components/Sky'
import { GrimoireOpening } from './components/Grimoire'
import { MoonPhase } from './components/MoonPhase'
import { Settings } from './components/Settings'
import { Recommendations } from './components/Recommendations'
import { ScrollRow } from './components/ScrollRow'
import { Sigil } from './components/Sigil'
import { STATUS_SIGIL } from './components/status'

type Filter = 'all' | ReadingStatus

export default function App() {
  const { session, user, loading: authLoading } = useAuth()
  // Design aus dem Konto übernehmen, damit es der Leseratte auf jedes Gerät folgt
  // (vor dem ersten Zeichnen, sonst blitzt kurz das alte Design auf)
  const accountTheme = user?.user_metadata?.theme
  useLayoutEffect(() => {
    if (accountTheme) setTheme(asTheme(accountTheme))
  }, [accountTheme])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Book | null>(null)
  const [adding, setAdding] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showRecs, setShowRecs] = useState(false)
  const [author, setAuthor] = useState<string | null>(null)
  const [opening, setOpening] = useState(false)
  const [nameForm, setNameForm] = useState({ open: false, fn: '', ln: '', saving: false })
  const prevSession = useRef<'unset' | 'none' | 'active'>('unset')
  const endOpening = useCallback(() => setOpening(false), [])

  // Das Grimoire öffnet sich nur beim frischen Login (nicht beim Neuladen mit Session).
  // useLayoutEffect: die Animation steht, bevor die Bibliothek zum ersten Mal gezeichnet wird.
  useLayoutEffect(() => {
    if (authLoading) return
    const now = session ? 'active' : 'none'
    const prev = prevSession.current
    prevSession.current = now
    if (prev === 'none' && now === 'active' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOpening(true)
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

  const stats = useMemo(() => computeStats(books), [books])
  const counts: Record<Filter, number> = {
    all: stats.total,
    reading: stats.reading,
    owned: stats.owned,
    wishlist: stats.wishlist,
    read: stats.read,
  }

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim()
    return books.filter((b) => {
      if (filter !== 'all' && b.status !== filter) return false
      if (!q) return true
      return b.title.toLowerCase().includes(q) || b.authors.some((a) => a.toLowerCase().includes(q))
    })
  }, [books, filter, search])

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Sky />
        <Emblem className="h-16 w-16 animate-float animate-glow" />
      </div>
    )
  }

  if (!session) return <Auth />

  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string; full_name?: string }
  const displayName =
    meta.full_name?.trim() ||
    [meta.first_name, meta.last_name].filter(Boolean).join(' ').trim() ||
    user?.email?.split('@')[0] ||
    'Leseratte'
  const hasName = Boolean(meta.first_name?.trim() || meta.full_name?.trim())
  const settings = readSettings(user?.user_metadata)
  const goal = settings.goal ? goalProgress(books, settings.goalType, settings.goalTarget) : null

  async function saveName() {
    const fn = nameForm.fn.trim()
    const ln = nameForm.ln.trim()
    if (!fn) return
    setNameForm((f) => ({ ...f, saving: true }))
    await supabase.auth.updateUser({ data: { first_name: fn, last_name: ln, full_name: `${fn} ${ln}`.trim() } })
    setNameForm({ open: false, fn: '', ln: '', saving: false })
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Alle' },
    ...STATUS_ORDER.map((s) => ({ key: s as Filter, label: STATUS_LABELS[s] })),
  ]

  return (
    <>
      <Sky />

      <header className="sticky top-0 z-30 border-b border-gold-400/15 bg-night-900/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Emblem className="h-9 w-9 shrink-0" small />
            <span className="gold-foil truncate font-display text-lg font-bold tracking-wide">Sallys BücherWahn</span>
          </div>
          <nav className="flex items-center gap-1">
            <button onClick={() => setShowStats(true)} className="btn-icon w-auto gap-2 px-3" aria-label="Chronik öffnen">
              <Sigil name="scroll" />
              <span className="hidden font-display text-[12px] font-semibold uppercase tracking-[0.14em] md:inline">Chronik</span>
            </button>
            <button onClick={() => setShowRecs(true)} className="btn-icon w-auto gap-2 px-3" aria-label="Empfehlungen öffnen">
              <Sigil name="star" />
              <span className="hidden font-display text-[12px] font-semibold uppercase tracking-[0.14em] md:inline">Empfehlungen</span>
            </button>
            <button onClick={() => setShowSettings(true)} className="btn-icon" aria-label="Einstellungen: was das Grimoire mitschreibt">
              <Sigil name="gear" />
            </button>
            <button onClick={() => supabase.auth.signOut()} className="btn-icon" aria-label="Grimoire schließen (abmelden)">
              <Sigil name="logout" />
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-10 sm:px-6">
        {/* Begrüßung + Mondphase */}
        <section className="animate-rise grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <p className="rubric">Willkommen zurück im Grimoire</p>
            <h1 className="gold-foil mt-2 break-words font-display text-4xl font-bold leading-tight sm:text-5xl">{displayName}</h1>
            <p className="mt-3 max-w-lg text-lg italic text-ivory-200">
              {books.length === 0
                ? 'Dein Grimoire wartet auf seinen ersten Band.'
                : `${books.length} ${books.length === 1 ? 'Band' : 'Bände'} · ${stats.wishlist} auf der Wunschliste`}
            </p>

            {!hasName &&
              (nameForm.open ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input className="field !w-40 !py-2" placeholder="Vorname" aria-label="Vorname" value={nameForm.fn} onChange={(e) => setNameForm((f) => ({ ...f, fn: e.target.value }))} />
                  <input className="field !w-40 !py-2" placeholder="Nachname" aria-label="Nachname" value={nameForm.ln} onChange={(e) => setNameForm((f) => ({ ...f, ln: e.target.value }))} />
                  <button onClick={saveName} className="btn-gold" disabled={nameForm.saving}>
                    {nameForm.saving ? 'Speichert …' : 'Speichern'}
                  </button>
                  <button onClick={() => setNameForm({ open: false, fn: '', ln: '', saving: false })} className="btn text-ivory-200 hover:text-ivory-50">
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button onClick={() => setNameForm((f) => ({ ...f, open: true }))} className="mt-3 min-h-[44px] italic text-gold-200 underline-offset-4 hover:underline">
                  Deinen Namen ins Grimoire schreiben
                </button>
              ))}
          </div>

          {(books.length > 0 || settings.goal) && (
            <div className="flex items-center gap-5">
              <MoonPhase pct={goal ? goal.pct : stats.pctRead} size={120} />
              <div>
                {goal ? (
                  <>
                    <p className="font-display text-3xl font-bold text-gold-200">
                      {goal.done.toLocaleString('de-DE')} <span className="text-xl text-ivory-300">/ {goal.target.toLocaleString('de-DE')}</span>
                    </p>
                    <p className="italic text-ivory-300">
                      {settings.goalType === 'books' ? 'Bücher' : 'Seiten'} im Jahresziel {goal.year}
                    </p>
                    <p className={`mt-1 text-[15px] ${goal.ahead >= 0 || goal.done >= goal.target ? 'text-moss' : 'text-flame'}`}>
                      {planText(goal, settings.goalType)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-3xl font-bold text-gold-200">{stats.pctRead} %</p>
                    <p className="italic text-ivory-300">deines Regals gelesen</p>
                  </>
                )}
                <dl className="mt-3 flex gap-5">
                  <Figure value={stats.read} label="gelesen" />
                  <Figure value={stats.ratedCount ? stats.avgRating.toFixed(1) : '–'} label="⌀ Sterne" />
                  <Figure value={stats.pagesRead.toLocaleString('de-DE')} label="Seiten" />
                </dl>
              </div>
            </div>
          )}
        </section>

        <Flourish className="mx-auto my-10 h-4 w-56" />

        {/* Suche + Kapitel-Reiter */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative lg:w-80 lg:shrink-0">
            <span className="sr-only">Im Grimoire suchen</span>
            <Sigil name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-300/70" />
            <input className="field !pl-11" placeholder="Im Grimoire suchen …" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <ScrollRow className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter">
            {tabs.map((t) => {
              const st = t.key in STATUS_SIGIL ? STATUS_SIGIL[t.key as ReadingStatus] : null
              return (
                <button key={t.key} onClick={() => setFilter(t.key)} className={`tab ${filter === t.key ? 'tab-on' : 'tab-off'}`} aria-pressed={filter === t.key}>
                  {st && <Sigil name={st.sigil} className={`h-4 w-4 ${st.color}`} />}
                  {t.label}
                  <span className="font-serif text-[15px] normal-case tracking-normal text-gold-300">{counts[t.key]}</span>
                </button>
              )
            })}
          </ScrollRow>
        </div>

        {/* Regal */}
        {loading && books.length === 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-md bg-night-700/60 ring-1 ring-gold-400/10" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="animate-rise py-16 text-center">
            <Emblem className="mx-auto h-20 w-20 animate-float opacity-90" />
            <p className="mt-5 font-display text-xl font-semibold text-gold-200">
              {books.length === 0 ? 'Dein Grimoire ist noch leer' : 'Keine Treffer'}
            </p>
            <p className="mx-auto mt-2 max-w-sm italic text-ivory-300">
              {books.length === 0
                ? 'Tippe auf die goldene Feder und schreib dein erstes Buch ein.'
                : 'Versuch eine andere Suche oder ein anderes Kapitel.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((book, i) => (
              <BookTile key={book.id} book={book} index={i} showProgress={settings.progress} onClick={() => setSelected(book)} />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setAdding(true)}
        className="btn-gold fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-30 !min-h-[56px] w-14 !px-0 sm:w-auto sm:!px-6"
        aria-label="Buch einschreiben"
      >
        <Sigil name="quill" className="h-6 w-6" />
        <span className="hidden sm:inline">Buch einschreiben</span>
      </button>

      {showStats && <Chronicle s={stats} onClose={() => setShowStats(false)} />}
      {showRecs && <Recommendations books={books} onAdded={load} onClose={() => setShowRecs(false)} />}
      {showSettings && <Settings settings={settings} onReset={load} onClose={() => setShowSettings(false)} />}

      {adding && (
        <AddBook
          settings={settings}
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
          settings={settings}
          onChange={(b) => {
            setSelected(b)
            setBooks((prev) => prev.map((x) => (x.id === b.id ? b : x)))
          }}
          onDelete={(id) => setBooks((prev) => prev.filter((x) => x.id !== id))}
          onAuthor={(a) => {
            setSelected(null)
            setAuthor(a)
          }}
          onClose={() => {
            setSelected(null)
            load() // frische Zahlen aus der DB, damit Statistik/Filter garantiert stimmen
          }}
        />
      )}

      {author && (
        <AuthorWorks
          author={author}
          books={books}
          onOpenBook={(b) => {
            setAuthor(null)
            setSelected(b)
          }}
          onAdded={load}
          onClose={() => setAuthor(null)}
        />
      )}

      {opening && <GrimoireOpening name={displayName} onDone={endOpening} />}
    </>
  )
}

function Figure({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-sm italic text-ivory-300">{label}</dt>
      <dd className="font-display text-lg font-bold text-ivory-50">{value}</dd>
    </div>
  )
}
