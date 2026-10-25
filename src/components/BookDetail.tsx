import { useState } from 'react'
import type { Book } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { updateBook, deleteBook } from '../lib/booksRepo'
import { amazonDeUrl } from '../lib/utils'
import { BookCover } from './BookCover'
import { CoverPicker } from './CoverPicker'
import { Sheet } from './Sheet'
import { Sigil } from './Sigil'
import { StarRating } from './StarRating'
import { STATUS_SIGIL } from './status'

interface Props {
  book: Book
  onChange: (book: Book) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function BookDetail({ book, onChange, onDelete, onClose }: Props) {
  const [notes, setNotes] = useState(book.notes ?? '')
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
          <p className="mt-1 italic text-ivory-200">{book.authors.join(', ') || 'Unbekannt'}</p>
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
      <div className="scrollbar-none -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {STATUS_ORDER.map((s) => (
          <button key={s} onClick={() => patch({ status: s })} className={`tab ${book.status === s ? 'tab-on' : 'tab-off'}`} aria-pressed={book.status === s}>
            <Sigil name={STATUS_SIGIL[s].sigil} className={`h-4 w-4 ${STATUS_SIGIL[s].color}`} />
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-danger">{error}</p>}

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
