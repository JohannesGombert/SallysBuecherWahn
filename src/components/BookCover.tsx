import { useState } from 'react'
import type { Book, BookLookupResult } from '../types'

// Ledertöne für Bücher ohne Cover (fest pro Titel)
const LEATHER = ['#3b2a5e', '#1e3b63', '#5e2a33', '#24493b', '#4d3a1f', '#2c2f5e']

function tone(title: string) {
  let h = 0
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return LEATHER[h % LEATHER.length]
}

/** Cover-Bild oder ein geprägter Ledereinband mit Titel als Ersatz. */
export function BookCover({
  book,
  className = '',
  compact = false,
}: {
  book: Pick<Book | BookLookupResult, 'title' | 'authors' | 'cover_url'>
  className?: string
  compact?: boolean
}) {
  // Cover-Links können tot sein (404) – dann den Ledereinband zeigen
  const [failed, setFailed] = useState(false)
  if (book.cover_url && !failed) {
    return (
      <img
        src={book.cover_url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center ${className}`}
      style={{ background: `linear-gradient(145deg, ${tone(book.title)}, #0c1431)` }}
    >
      {!compact && <span className="h-px w-8 bg-gold-400/60" />}
      <span className={`line-clamp-4 font-display font-semibold leading-snug text-gold-200 ${compact ? 'text-[8px]' : 'text-[13px]'}`}>
        {book.title}
      </span>
      {!compact && (
        <>
          <span className="h-px w-8 bg-gold-400/60" />
          <span className="line-clamp-1 text-xs italic text-ivory-200/70">{book.authors[0]}</span>
        </>
      )}
    </div>
  )
}
