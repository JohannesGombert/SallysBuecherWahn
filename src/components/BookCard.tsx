import { useState } from 'react'
import type { Book } from '../types'
import { STATUS_LABELS } from '../types'
import { StarRating } from './StarRating'
import { Icon } from './Icon'
import { amazonDeUrl } from '../lib/utils'

const statusColor: Record<string, string> = {
  wishlist: 'bg-pink-500/90 text-white',
  owned: 'bg-brand-600/90 text-white',
  reading: 'bg-ember-500/95 text-white',
  read: 'bg-emerald-600/90 text-white',
}

export function BookCard({
  book,
  onClick,
  index = 0,
}: {
  book: Book
  onClick: () => void
  index?: number
}) {
  const [imgError, setImgError] = useState(false)
  const showCover = book.cover_url && !imgError
  const isUnread = book.status === 'owned'

  return (
    <div
      className="group flex animate-fade-up flex-col text-left"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <button
        onClick={onClick}
        aria-label={`${book.title} öffnen`}
        className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-200 to-brand-400 shadow-book ring-1 ring-brand-900/10 transition duration-300 [transition-timing-function:var(--ease-out)] hover:-translate-y-1.5 hover:shadow-book-lg focus-visible:outline-none active:scale-[0.98] dark:from-brand-800 dark:to-night-900 dark:ring-white/10"
      >
        {/* Buchrücken-Kante */}
        <div className="absolute inset-y-0 left-0 z-10 w-2 bg-gradient-to-r from-black/25 to-transparent" />
        {showCover ? (
          <img
            src={book.cover_url!}
            alt={`Cover von ${book.title}`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-white/90">
            <Icon name="book" className="h-9 w-9" strokeWidth={1.5} />
            <span className="line-clamp-3 font-display text-sm font-semibold leading-tight">
              {book.title}
            </span>
          </div>
        )}
        <span
          className={`absolute right-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur ${statusColor[book.status]}`}
        >
          {STATUS_LABELS[book.status]}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-0.5 px-1 pt-2.5">
        {isUnread ? (
          <a
            href={amazonDeUrl(book)}
            target="_blank"
            rel="noopener noreferrer"
            title="Bei Amazon.de ansehen"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-start gap-1 text-sm font-semibold leading-tight text-brand-700 hover:text-ember-500 hover:underline dark:text-brand-300"
          >
            <span className="line-clamp-2">{book.title}</span>
            <Icon name="cart" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          </a>
        ) : (
          <button
            onClick={onClick}
            className="line-clamp-2 text-left text-sm font-semibold leading-tight group-hover:text-brand-700 dark:group-hover:text-brand-300"
          >
            {book.title}
          </button>
        )}
        <p className="line-clamp-1 text-xs text-brand-900/45 dark:text-paper-200/45">
          {book.authors.join(', ') || 'Unbekannt'}
        </p>
        {book.rating ? (
          <div className="pt-1">
            <StarRating value={book.rating} size="sm" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
