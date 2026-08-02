import { useState } from 'react'
import type { BookLookupResult, ReadingStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { lookupIsbn, searchBooks, isValidIsbn } from '../lib/bookApi'
import { addBook } from '../lib/booksRepo'
import { BarcodeScanner } from './BarcodeScanner'

interface Props {
  onAdded: () => void
  onClose: () => void
}

export function AddBook({ onAdded, onClose }: Props) {
  const [scanning, setScanning] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookLookupResult[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<ReadingStatus>('owned')
  const [info, setInfo] = useState<string | null>(null)
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set())

  async function handleScan(raw: string) {
    setScanning(false)
    setLoading(true)
    setInfo(`ISBN erkannt: ${raw} – suche Buch …`)
    const book = await lookupIsbn(raw)
    setLoading(false)
    if (book) {
      setResults([book])
      setInfo(null)
    } else {
      setInfo(`Kein Treffer für ISBN ${raw}. Versuche die manuelle Suche.`)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setInfo(null)
    const res = isValidIsbn(query)
      ? [await lookupIsbn(query)].filter(Boolean as any)
      : await searchBooks(query)
    setResults(res as BookLookupResult[])
    if (res.length === 0) setInfo('Keine Bücher gefunden.')
    setLoading(false)
  }

  async function handleAdd(book: BookLookupResult, key: string) {
    await addBook(book, status)
    setAddedKeys((prev) => new Set(prev).add(key))
    onAdded()
  }

  if (scanning) {
    return <BarcodeScanner onDetected={handleScan} onClose={() => setScanning(false)} />
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card flex max-h-[92vh] w-full max-w-lg flex-col rounded-b-none rounded-t-3xl p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Buch hinzufügen</h2>
          <button onClick={onClose} className="btn-ghost">
            Schließen
          </button>
        </div>

        <button onClick={() => setScanning(true)} className="btn-primary mb-3 w-full">
          📷 Barcode scannen
        </button>

        <form onSubmit={handleSearch} className="mb-3 flex gap-2">
          <input
            className="input"
            placeholder="Titel, Autor oder ISBN …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-ghost" disabled={loading}>
            Suchen
          </button>
        </form>

        {/* Status für neue Bücher */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Hinzufügen als:</span>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-2.5 py-1 font-semibold transition ${
                status === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {info && <p className="mb-2 text-sm text-slate-500">{info}</p>}
        {loading && <p className="mb-2 text-sm text-brand-600">Lädt …</p>}

        <div className="-mx-2 flex-1 space-y-2 overflow-y-auto px-2">
          {results.map((book, i) => {
            const key = `${book.isbn ?? book.title}-${i}`
            const added = addedKeys.has(key)
            return (
              <div key={key} className="flex gap-3 rounded-xl bg-slate-50 p-2 dark:bg-white/5">
                <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-brand-100 dark:bg-brand-900/40">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">📖</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{book.title}</p>
                  <p className="line-clamp-1 text-xs text-slate-500">
                    {book.authors.join(', ') || 'Unbekannt'}
                  </p>
                  {book.published_date && (
                    <p className="text-xs text-slate-400">{book.published_date}</p>
                  )}
                </div>
                <button
                  onClick={() => handleAdd(book, key)}
                  disabled={added}
                  className={added ? 'btn-ghost' : 'btn-primary'}
                >
                  {added ? '✓' : '+'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
