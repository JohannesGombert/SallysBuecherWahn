import type { Book } from '../types'
import { STATUS_LABELS } from '../types'
import { StarRating } from './StarRating'

const statusColor: Record<string, string> = {
  wishlist: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  owned: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  reading: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  read: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
}

export function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card group flex flex-col overflow-hidden p-0 text-left transition hover:-translate-y-1 hover:shadow-book"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-brand-100 dark:bg-brand-900/40">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 text-center text-4xl">
            📖
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[book.status]}`}
        >
          {STATUS_LABELS[book.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {book.title}
        </h3>
        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
          {book.authors.join(', ') || 'Unbekannt'}
        </p>
        {book.rating ? (
          <div className="mt-auto pt-1">
            <StarRating value={book.rating} size="sm" />
          </div>
        ) : null}
      </div>
    </button>
  )
}
