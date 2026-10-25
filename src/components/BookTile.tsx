import type { Book } from '../types'
import { STATUS_LABELS } from '../types'
import { BookCover } from './BookCover'
import { Sigil } from './Sigil'
import { StarRating } from './StarRating'
import { STATUS_SIGIL } from './status'

export function BookTile({ book, index, onClick }: { book: Book; index: number; onClick: () => void }) {
  const st = STATUS_SIGIL[book.status]
  return (
    <button
      onClick={onClick}
      // self-start: Buttons zentrieren ihren Inhalt sonst senkrecht → Cover springen
      className="group animate-rise self-start text-left"
      style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md rounded-r-lg bg-night-700 shadow-[0_18px_30px_-14px_rgba(0,0,0,0.9)] ring-1 ring-gold-400/25 transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_40px_-14px_rgba(0,0,0,0.9),0_0_28px_-6px_rgba(240,217,154,0.45)] group-hover:ring-gold-300/70">
        <BookCover book={book} />
        {/* Buchrücken-Kante */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/45 to-transparent" />
        <span
          className={`absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-night-900/85 ring-1 ring-gold-400/40 backdrop-blur ${st.color}`}
          title={STATUS_LABELS[book.status]}
        >
          <Sigil name={st.sigil} className="h-4 w-4" />
          <span className="sr-only">{STATUS_LABELS[book.status]}</span>
        </span>
      </div>
      <p className="mt-3 line-clamp-2 font-medium leading-snug text-ivory-50 transition group-hover:text-gold-200">
        {book.title}
      </p>
      <p className="line-clamp-1 text-[15px] italic text-ivory-300">{book.authors.join(', ') || 'Unbekannt'}</p>
      {(book.rating ?? 0) > 0 && (
        <div className="mt-1">
          <StarRating value={book.rating} size="sm" />
        </div>
      )}
    </button>
  )
}
