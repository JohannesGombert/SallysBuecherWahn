import { useState } from 'react'
import type { BookLookupResult, ReadingStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { lookupIsbn, searchBooks, isValidIsbn } from '../lib/bookApi'
import { addBook } from '../lib/booksRepo'
import { BarcodeScanner } from './BarcodeScanner'
import { Icon } from './Icon'

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
      setInfo(`Kein Treffer für ISBN ${raw}. Versuch die manuelle Suche.`)
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
      className="fixed inset-0 z-40 flex items-end justify-center bg-night-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card flex max-h-[92vh] w-full max-w-lg animate-fade-up flex-col rounded-b-none rounded-t-3xl p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Buch hinzufügen</h2>
          <button onClick={onClose} className="btn-ghost !rounded-full !px-3" aria-label="Schließen">
            <Icon name="close" />
          </button>
        </div>

        <button onClick={() => setScanning(true)} className="btn-accent mb-3 w-full !py-3.5">
          <Icon name="camera" />
          Barcode scannen
        </button>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/35 dark:text-white/30"
            />
            <input
              className="input !pl-10"
              placeholder="Titel, Autor oder ISBN …"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-ghost" disabled={loading}>
            Suchen
          </button>
        </form>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-brand-900/45 dark:text-paper-200/45">Hinzufügen als:</span>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`chip !px-3 !py-1 !text-xs ${status === s ? 'chip-on' : 'chip-off'}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {info && <p className="mb-2 text-sm text-brand-900/55 dark:text-paper-200/55">{info}</p>}
        {loading && <p className="mb-2 text-sm font-medium text-ember-500">Lädt …</p>}

        <div className="-mx-2 flex-1 space-y-2 overflow-y-auto px-2">
          {results.map((book, i) => {
            const key = `${book.isbn ?? book.title}-${i}`
            const added = addedKeys.has(key)
            return (
              <div
                key={key}
                className="flex gap-3 rounded-2xl bg-white/60 p-2.5 ring-1 ring-brand-900/5 dark:bg-white/5 dark:ring-white/10"
              >
                <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand-200 to-brand-400 dark:from-brand-800 dark:to-night-900">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/80">
                      <Icon name="book" className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{book.title}</p>
                  <p className="line-clamp-1 text-xs text-brand-900/45 dark:text-paper-200/45">
                    {book.authors.join(', ') || 'Unbekannt'}
                  </p>
                  {book.published_date && (
                    <p className="text-xs text-brand-900/35 dark:text-paper-200/35">
                      {book.published_date}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAdd(book, key)}
                  disabled={added}
                  className={`${added ? 'btn-ghost' : 'btn-primary'} !rounded-full !px-3`}
                  aria-label={added ? 'Hinzugefügt' : 'Hinzufügen'}
                >
                  <Icon name={added ? 'check' : 'plus'} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
