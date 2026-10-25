import { useState } from 'react'
import type { BookLookupResult, ReadingStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { lookupIsbn, searchBooks, isValidIsbn } from '../lib/bookApi'
import { addBook } from '../lib/booksRepo'
import { today, type TrackingSettings } from '../lib/settings'
import { BarcodeScanner } from './BarcodeScanner'
import { BookCover } from './BookCover'
import { Sheet } from './Sheet'
import { Sigil } from './Sigil'
import { STATUS_SIGIL } from './status'

interface Props {
  settings: TrackingSettings
  onAdded: () => void
  onClose: () => void
}

export function AddBook({ settings, onAdded, onClose }: Props) {
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
    setInfo(`ISBN ${raw} erkannt – die Archive werden befragt …`)
    const book = await lookupIsbn(raw)
    setLoading(false)
    if (book) {
      setResults([book])
      setInfo(null)
    } else {
      setInfo(`Kein Buch zur ISBN ${raw} gefunden. Versuch die Suche.`)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setInfo(null)
    const res = isValidIsbn(query)
      ? [await lookupIsbn(query)].filter((b): b is BookLookupResult => Boolean(b))
      : await searchBooks(query)
    setResults(res)
    if (res.length === 0) setInfo('Keine Bücher gefunden.')
    setLoading(false)
  }

  async function handleAdd(book: BookLookupResult, key: string) {
    try {
      const read = status === 'read'
      await addBook(book, status, {
        ...(read && settings.finishedDate ? { finished_at: today() } : {}),
        ...(read && settings.progress && book.page_count ? { current_page: book.page_count } : {}),
      })
      setAddedKeys((prev) => new Set(prev).add(key))
      onAdded()
    } catch (e: any) {
      setInfo(`Konnte nicht eingeschrieben werden: ${e?.message ?? e}`)
    }
  }

  if (scanning) {
    return <BarcodeScanner onDetected={handleScan} onClose={() => setScanning(false)} />
  }

  return (
    <Sheet title="Ein Buch einschreiben" onClose={onClose}>
      <button onClick={() => setScanning(true)} className="btn-gold mt-2 w-full">
        <Sigil name="camera" />
        Barcode scannen
      </button>

      <div className="my-5 flex items-center gap-3 text-sm italic text-ivory-300">
        <span className="h-px flex-1 bg-gold-400/20" />
        oder im Archiv suchen
        <span className="h-px flex-1 bg-gold-400/20" />
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Titel, Autor oder ISBN</span>
          <Sigil name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-300/70" />
          <input className="field !pl-11" placeholder="Titel, Autor oder ISBN …" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="submit" className="btn-quiet" disabled={loading}>
          Suchen
        </button>
      </form>

      <p className="rubric mb-2 mt-5">Einschreiben als</p>
      <div className="scrollbar-none -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {STATUS_ORDER.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`tab ${status === s ? 'tab-on' : 'tab-off'}`} aria-pressed={status === s}>
            <Sigil name={STATUS_SIGIL[s].sigil} className={`h-4 w-4 ${STATUS_SIGIL[s].color}`} />
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {info && <p className="mt-4 italic text-ivory-200">{info}</p>}
        {loading && <p className="mt-4 animate-pulse italic text-gold-200">Die Seiten werden befragt …</p>}
      </div>

      <ul className="mt-4 space-y-2.5">
        {results.map((book, i) => {
          const key = `${book.isbn ?? book.title}-${i}`
          const added = addedKeys.has(key)
          return (
            <li key={key} className="animate-rise flex items-center gap-3 rounded-xl border border-gold-400/15 bg-night-950/40 p-2.5">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-sm ring-1 ring-gold-400/25">
                <BookCover book={book} compact />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium leading-snug">{book.title}</p>
                <p className="line-clamp-1 text-[15px] italic text-ivory-300">{book.authors.join(', ') || 'Unbekannt'}</p>
                {book.published_date && <p className="text-sm text-ivory-300/80">{book.published_date}</p>}
              </div>
              <button
                onClick={() => handleAdd(book, key)}
                disabled={added}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                  added ? 'bg-moss/15 text-moss' : 'btn-gold !min-h-0 !px-0'
                }`}
                aria-label={added ? 'Eingeschrieben' : `${book.title} einschreiben`}
              >
                <Sigil name={added ? 'check' : 'plus'} />
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
