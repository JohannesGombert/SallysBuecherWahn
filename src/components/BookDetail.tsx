import { useState } from 'react'
import type { Book, ReadingStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { StarRating } from './StarRating'
import { Icon } from './Icon'
import { updateBook, deleteBook } from '../lib/booksRepo'
import { amazonDeUrl } from '../lib/utils'

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
    await patch({ notes })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function handleDelete() {
    await deleteBook(book.id)
    onDelete(book.id)
    onClose()
  }

  return (
    <div
      className="overlay-in fixed inset-0 z-40 flex items-end justify-center bg-night-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[92vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-b-none rounded-t-3xl p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex justify-end">
          <button onClick={onClose} className="btn-ghost !rounded-full !px-3" aria-label="Schließen">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex gap-5">
          <div className="h-44 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-200 to-brand-400 shadow-book ring-1 ring-brand-900/10 dark:from-brand-800 dark:to-night-900">
            {book.cover_url ? (
              <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/80">
                <Icon name="book" className="h-10 w-10" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold leading-tight">{book.title}</h2>
            <p className="mt-1 text-sm text-brand-900/55 dark:text-paper-200/55">
              {book.authors.join(', ') || 'Unbekannt'}
            </p>
            {book.publisher && (
              <p className="mt-1 text-xs text-brand-900/40 dark:text-paper-200/40">
                {book.publisher}
                {book.published_date ? ` · ${book.published_date}` : ''}
              </p>
            )}
            {book.page_count ? (
              <p className="text-xs text-brand-900/40 dark:text-paper-200/40">
                {book.page_count} Seiten
              </p>
            ) : null}
            <div className="mt-3">
              <StarRating value={book.rating} onChange={(r) => patch({ rating: r })} />
            </div>
            {book.status === 'owned' && (
              <a
                href={amazonDeUrl(book)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-3 !py-2 text-xs"
              >
                <Icon name="cart" className="h-4 w-4" />
                Bei Amazon.de ansehen
                <Icon name="external" className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-900/40 dark:text-paper-200/40">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((s: ReadingStatus) => (
              <button
                key={s}
                onClick={() => patch({ status: s })}
                className={`chip ${book.status === s ? 'chip-on' : 'chip-off'}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          {error && (
            <p className="mt-2 rounded-lg bg-ember-500/15 px-2 py-1 text-xs text-ember-700 dark:text-ember-300">
              ⚠️ {error}
            </p>
          )}
        </div>

        {book.description && (
          <div className="mt-6">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-900/40 dark:text-paper-200/40">
              Beschreibung
            </p>
            <p className="text-sm leading-relaxed text-brand-900/70 dark:text-paper-200/70">
              {book.description}
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-900/40 dark:text-paper-200/40">
            Meine Notizen
          </p>
          <textarea
            className="input min-h-24 resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Gedanken, Lieblingszitate, Merkzettel …"
          />
          {saved && (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Icon name="check" className="h-3.5 w-3.5" /> Gespeichert
            </p>
          )}
        </div>

        <div className="mt-7 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-ember-600">Wirklich löschen?</span>
              <button onClick={handleDelete} className="btn bg-ember-600 text-white hover:bg-ember-700">
                Ja, löschen
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost">
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-ember-600 hover:text-ember-700 hover:underline"
            >
              <Icon name="trash" className="h-4 w-4" /> Buch löschen
            </button>
          )}
          <button onClick={onClose} className="btn-primary">
            Fertig
          </button>
        </div>
      </div>
    </div>
  )
}
