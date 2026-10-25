import { useState } from 'react'
import type { Book, BookLookupResult } from '../types'

// Ledertöne für Bücher ohne Cover (fest pro Titel)
const LEATHER = ['#3b2a5e', '#1e3b63', '#5e2a33', '#24493b', '#4d3a1f', '#2c2f5e']

function tone(title: string) {
  let h = 0
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return LEATHER[h % LEATHER.length]
}

function coverCandidates(book: { cover_url: string | null; isbn: string | null }): string[] {
  const isbn = book.isbn?.replace(/[^0-9Xx]/g, '')
  const urls = [book.cover_url]
  if (isbn) {
    urls.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`)
    // Amazon hat Cover für fast alle deutschen Ausgaben (Schlüssel ist die ISBN-10)
    const isbn10 = toIsbn10(isbn)
    if (isbn10) urls.push(`https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`)
  }
  return [...new Set(urls.filter((u): u is string => Boolean(u)))]
}

export function toIsbn10(isbn: string): string | null {
  if (isbn.length === 10) return isbn.toUpperCase()
  if (isbn.length !== 13 || !isbn.startsWith('978')) return null
  const core = isbn.slice(3, 12)
  const sum = [...core].reduce((s, d, i) => s + (10 - i) * Number(d), 0)
  const check = (11 - (sum % 11)) % 11
  return core + (check === 10 ? 'X' : String(check))
}

/** Cover-Bild oder ein geprägter Ledereinband mit Titel als Ersatz. */
export function BookCover({
  book,
  className = '',
  compact = false,
}: {
  book: Pick<Book | BookLookupResult, 'title' | 'authors' | 'cover_url' | 'isbn'>
  className?: string
  compact?: boolean
}) {
  // Quellen der Reihe nach; tote Links (404) werden übersprungen, zuletzt Ledereinband.
  const [failed, setFailed] = useState<string[]>([])
  const src = coverCandidates(book).find((u) => !failed.includes(u))
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed((f) => [...f, src])}
        // Amazon liefert statt 404 ein 1×1-Pixel-GIF
        onLoad={(e) => e.currentTarget.naturalWidth <= 1 && setFailed((f) => [...f, src])}
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
