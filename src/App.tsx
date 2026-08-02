import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'
import { fetchBooks } from './lib/booksRepo'
import type { Book, ReadingStatus } from './types'
import { STATUS_LABELS, STATUS_ORDER } from './types'
import { Auth } from './components/Auth'
import { BookCard } from './components/BookCard'
import { BookDetail } from './components/BookDetail'
import { AddBook } from './components/AddBook'
import { Icon, type IconName } from './components/Icon'
import { Logo } from './components/Logo'

type Filter = 'all' | ReadingStatus

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

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

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim()
    return books.filter((b) => {
      if (filter !== 'all' && b.status !== filter) return false
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

  const name = user?.email?.split('@')[0] ?? 'Leseratte'

  return (
    <div className="min-h-screen">
      {/* Kopfzeile */}
      <header className="sticky top-0 z-30 border-b border-white/50 bg-paper-50/70 backdrop-blur-xl dark:border-white/10 dark:bg-night-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
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
        {/* Begrüßung */}
        <div className="mb-6 animate-fade-up">
          <p className="text-sm font-medium text-ember-500">Willkommen zurück</p>
          <h2 className="font-display text-3xl font-black capitalize sm:text-4xl">
            Hallo, {name} 👋
          </h2>
          <p className="mt-1 text-brand-900/50 dark:text-paper-200/50">
            {books.length === 0
              ? 'Deine Bibliothek wartet auf ihr erstes Buch.'
              : `${books.length} ${books.length === 1 ? 'Buch' : 'Bücher'} in deiner Sammlung.`}
          </p>
        </div>

        {/* Bento-Statistik */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_ORDER.map((s) => {
            const on = filter === s
            return (
              <button
                key={s}
                onClick={() => setFilter(on ? 'all' : s)}
                className={`card relative overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                  on ? 'ring-2 ring-ember-400' : ''
                }`}
              >
                <div
                  className={`mb-2 inline-flex rounded-xl bg-gradient-to-br p-2 text-white ${STATUS_TINT[s]}`}
                >
                  <Icon name={STATUS_ICON[s]} className="h-4 w-4" />
                </div>
                <div className="font-display text-3xl font-black leading-none">
                  {counts[s] ?? 0}
                </div>
                <div className="mt-1 text-xs font-medium text-brand-900/50 dark:text-paper-200/50">
                  {STATUS_LABELS[s]}
                </div>
              </button>
            )
          })}
        </div>

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
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
