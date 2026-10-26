import { useState } from 'react'
import type { Book, ReadingStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { updateBook, deleteBook } from '../lib/booksRepo'
import { amazonDeUrl } from '../lib/utils'
import { today, type TrackingSettings } from '../lib/settings'
import { readingPct as pct } from '../lib/goals'
import { BookCover } from './BookCover'
import { CoverPicker } from './CoverPicker'
import { Sheet } from './Sheet'
import { ScrollRow } from './ScrollRow'
import { Sigil } from './Sigil'
import { StarRating } from './StarRating'
import { STATUS_SIGIL } from './status'

interface Props {
  book: Book
  settings: TrackingSettings
  onChange: (book: Book) => void
  onDelete: (id: string) => void
  onAuthor: (name: string) => void
  onClose: () => void
}

export function BookDetail({ book, settings, onChange, onDelete, onAuthor, onClose }: Props) {
  const [notes, setNotes] = useState(book.notes ?? '')
  const [page, setPage] = useState(book.current_page != null ? String(book.current_page) : '')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)

  async function patch(p: Partial<Book>) {
    const prev = book
    onChange({ ...book, ...p }) // optimistisch
    setError(null)
    try {
      await updateBook(book.id, p)
    } catch (e: any) {
      console.error('updateBook fehlgeschlagen:', e)
      onChange(prev) // bei Fehler zurücksetzen
      setError(e?.message ?? 'Konnte nicht gespeichert werden.')
      setTimeout(() => setError(null), 5000)
    }
  }

  // Status wechseln; mit eingeschaltetem Tracking Auslese-Datum und Lesestand mitführen
  function setStatus(status: ReadingStatus) {
    const p: Partial<Book> = { status }
    if (settings.finishedDate) {
      if (status === 'read' && !book.finished_at) p.finished_at = today()
      if (status !== 'read' && book.finished_at) p.finished_at = null
    }
    if (settings.progress && status === 'read' && book.page_count) {
      p.current_page = book.page_count
      setPage(String(book.page_count))
    }
    patch(p)
  }

  function savePage() {
    const raw = page.trim()
    let n: number | null = raw === '' ? null : Math.floor(Number(raw))
    if (n != null && (!Number.isFinite(n) || n < 0)) n = 0
    if (n != null && book.page_count) n = Math.min(n, book.page_count)
    setPage(n == null ? '' : String(n))
    if (n !== book.current_page) patch({ current_page: n })
  }

  async function saveNotes() {
    if (notes === (book.notes ?? '')) return
    await patch({ notes })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function handleDelete() {
    try {
      await deleteBook(book.id)
      onDelete(book.id)
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Konnte nicht gelöscht werden.')
    }
  }

  return (
    <Sheet title="Aus deinem Grimoire" onClose={onClose}>
      <div className="flex gap-5 pt-2">
        <div className="w-32 shrink-0">
          <div className="h-48 overflow-hidden rounded-md rounded-r-lg shadow-[0_20px_40px_-16px_rgba(0,0,0,0.9),0_0_30px_-10px_rgba(240,217,154,0.35)] ring-1 ring-gold-400/40">
            <BookCover key={book.cover_url ?? ''} book={book} />
          </div>
          <button
            onClick={() => setPicking((p) => !p)}
            className="mt-1 min-h-[44px] w-full text-[15px] italic text-gold-200 underline-offset-4 hover:underline"
            aria-expanded={picking}
          >
            {picking ? 'Auswahl schließen' : 'Cover ändern'}
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.6rem] font-semibold leading-tight text-ivory-50">{book.title}</h3>
          <p className="mt-1 italic text-ivory-200">
            {book.authors.length === 0
              ? 'Unbekannt'
              : book.authors.map((a, i) => (
                  <span key={a}>
                    {i > 0 && ', '}
                    <button
                      onClick={() => onAuthor(a)}
                      className="italic text-gold-200 underline decoration-gold-400/40 underline-offset-4 transition hover:decoration-gold-300"
                      aria-label={`Alle Werke von ${a}`}
                    >
                      {a}
                    </button>
                  </span>
                ))}
          </p>
          <p className="mt-1 text-[15px] text-ivory-300">
            {[book.publisher, book.published_date, book.page_count ? `${book.page_count} Seiten` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="mt-2">
            <StarRating value={book.rating} onChange={(r) => patch({ rating: r })} />
          </div>
        </div>
      </div>

      {picking && (
        <CoverPicker
          book={book}
          onPick={(url) => {
            patch({ cover_url: url })
            setPicking(false)
          }}
        />
      )}

      <a href={amazonDeUrl(book)} target="_blank" rel="noopener noreferrer" className="btn-quiet mt-4 w-full">
        <Sigil name="cart" className="h-4 w-4" />
        Bei Amazon.de ansehen
        <Sigil name="external" className="h-4 w-4" />
      </a>

      <p className="rubric mb-2 mt-6">Status</p>
      <ScrollRow className="scrollbar-none -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {STATUS_ORDER.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`tab ${book.status === s ? 'tab-on' : 'tab-off'}`} aria-pressed={book.status === s}>
            <Sigil name={STATUS_SIGIL[s].sigil} className={`h-4 w-4 ${STATUS_SIGIL[s].color}`} />
            {STATUS_LABELS[s]}
          </button>
        ))}
      </ScrollRow>
      {error && <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-danger">{error}</p>}

      {settings.finishedDate && book.status === 'read' && (
        <label className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rubric">Ausgelesen am</span>
          <input
            type="date"
            className="field !w-auto !py-2 [color-scheme:dark]"
            value={book.finished_at ?? ''}
            max={today()}
            onChange={(e) => patch({ finished_at: e.target.value || null })}
          />
        </label>
      )}

      {settings.progress && book.status === 'reading' && (
        <div className="mt-5">
          <label className="flex flex-wrap items-center gap-3">
            <span className="rubric">Lesestand</span>
            <span className="flex items-center gap-2 text-ivory-200">
              Seite
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={book.page_count ?? undefined}
                className="field !w-24 !py-2 text-center"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                onBlur={savePage}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
              {book.page_count ? `von ${book.page_count}` : null}
            </span>
          </label>
          {book.page_count ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300 transition-all"
                  style={{ width: `${pct(book.current_page, book.page_count)}%` }}
                />
              </div>
              <span className="w-12 text-right font-display text-gold-200">{pct(book.current_page, book.page_count)} %</span>
            </div>
          ) : (
            <p className="mt-2 text-sm italic text-ivory-300">Ohne Seitenzahl des Buchs gibt es keine Prozentanzeige.</p>
          )}
        </div>
      )}

      {book.description && (
        <>
          <p className="rubric mb-2 mt-6">Klappentext</p>
          <p className="drop-cap leading-relaxed text-ivory-200">{book.description}</p>
        </>
      )}

      <label className="mt-6 block">
        <span className="rubric mb-2 block">Randnotizen</span>
        <textarea
          className="field min-h-28 resize-y leading-relaxed"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="Gedanken, Lieblingszitate, Merkzettel …"
        />
      </label>
      <p className="h-6 pt-1 text-sm text-moss" aria-live="polite">
        {saved && 'Notiz gesichert'}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gold-400/15 pt-5">
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="italic text-danger">Wirklich aus dem Grimoire tilgen?</span>
            <button onClick={handleDelete} className="btn border border-danger/60 text-danger hover:bg-danger/10">
              Ja, tilgen
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn text-ivory-200 hover:text-ivory-50">
              Abbrechen
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="inline-flex min-h-[44px] items-center gap-2 text-danger/90 transition hover:text-danger">
            <Sigil name="trash" className="h-4 w-4" /> Buch löschen
          </button>
        )}
        <button onClick={onClose} className="btn-gold">
          Fertig
        </button>
      </div>
    </Sheet>
  )
}
