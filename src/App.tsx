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

type Filter = 'all' | ReadingStatus

export default function App() {
  const { session, loading: authLoading } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Book | null>(null)
  const [adding, setAdding] = useState(false)
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark',
  )

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
      <div className="flex min-h-screen items-center justify-center text-brand-500">
        Lädt …
      </div>
    )
  }

  if (!session) return <Auth />

  return (
    <div className="min-h-screen">
      {/* Kopfzeile */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-brand-50/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h1 className="font-display text-lg font-bold text-brand-700 dark:text-brand-300">
              Sallys BücherWahn
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="btn-ghost !px-3"
              aria-label="Design wechseln"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => supabase.auth.signOut()} className="btn-ghost">
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        {/* Statistik */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`card p-4 text-left transition ${
                filter === s ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-300">
                {counts[s] ?? 0}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {STATUS_LABELS[s]}
              </div>
            </button>
          ))}
        </div>

        {/* Suche + Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="input sm:max-w-xs"
            placeholder="🔍 In meiner Bibliothek suchen …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
              Alle ({counts.all})
            </FilterChip>
            {STATUS_ORDER.map((s) => (
              <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
                {STATUS_LABELS[s]}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Regal */}
        {loading ? (
          <p className="py-16 text-center text-slate-400">Lädt deine Bücher …</p>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-3 text-5xl">🪄</div>
            <p className="text-slate-500 dark:text-slate-400">
              {books.length === 0
                ? 'Noch keine Bücher – füge dein erstes hinzu!'
                : 'Keine Treffer für diese Auswahl.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => setSelected(book)} />
            ))}
          </div>
        )}
      </main>

      {/* Schwebender Aktionsknopf */}
      <button
        onClick={() => setAdding(true)}
        className="btn-primary fixed bottom-6 right-6 z-30 !rounded-full !px-6 !py-4 text-base shadow-book"
      >
        + Buch
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? 'bg-brand-600 text-white'
          : 'bg-white/70 text-slate-600 hover:bg-white dark:bg-white/10 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
