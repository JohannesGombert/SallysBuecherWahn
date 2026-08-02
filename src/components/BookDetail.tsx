import { useState } from 'react'
import type { Book, ReadingStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { StarRating } from './StarRating'
import { updateBook, deleteBook } from '../lib/booksRepo'

interface Props {
  book: Book
  onChange: (book: Book) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function BookDetail({ book, onChange, onDelete, onClose }: Props) {
  const [notes, setNotes] = useState(book.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function patch(p: Partial<Book>) {
    onChange({ ...book, ...p })
    await updateBook(book.id, p)
  }

  async function saveNotes() {
    setSaving(true)
    await patch({ notes })
    setSaving(false)
  }

  async function handleDelete() {
    await deleteBook(book.id)
    onDelete(book.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-3xl p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          <div className="h-40 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-brand-100 shadow-book dark:bg-brand-900/40">
            {book.cover_url ? (
              <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">📖</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold leading-tight">
              {book.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {book.authors.join(', ') || 'Unbekannt'}
            </p>
            {book.publisher && (
              <p className="mt-1 text-xs text-slate-400">
                {book.publisher}
                {book.published_date ? ` · ${book.published_date}` : ''}
              </p>
            )}
            {book.page_count ? (
              <p className="text-xs text-slate-400">{book.page_count} Seiten</p>
            ) : null}
            <div className="mt-2">
              <StarRating value={book.rating} onChange={(r) => patch({ rating: r })} />
            </div>
          </div>
        </div>

        {/* Status-Wechsel */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((s: ReadingStatus) => (
              <button
                key={s}
                onClick={() => patch({ status: s })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  book.status === s
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {book.description && (
          <div className="mt-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Beschreibung
            </p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {book.description}
            </p>
          </div>
        )}

        <div className="mt-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Meine Notizen
          </p>
          <textarea
            className="input min-h-24 resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Gedanken, Lieblingszitate, Merkzettel …"
          />
          {saving && <p className="mt-1 text-xs text-slate-400">Gespeichert ✓</p>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-500">Wirklich löschen?</span>
              <button onClick={handleDelete} className="btn bg-red-500 text-white">
                Ja, löschen
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost">
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-red-500 hover:underline"
            >
              Buch löschen
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
