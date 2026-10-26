import { useState } from 'react'
import type { Book, BookLookupResult } from '../types'
import { coverCandidates } from '../lib/covers'
import { useTheme, type Theme } from '../lib/theme'

// Ledertöne für Bücher ohne Cover (fest pro Titel), je Design: [Töne, dunkles Ende]
const LEATHER: Record<Theme, [string[], string]> = {
  nacht: [['#3b2a5e', '#1e3b63', '#5e2a33', '#24493b', '#4d3a1f', '#2c2f5e'], '#0c1431'],
  wald: [['#3d5a2e', '#5a3a22', '#2e4f45', '#6b4a24', '#4a3b2a', '#29452f'], '#0c1a13'],
}

function tone(title: string, tones: string[]) {
  let h = 0
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return tones[h % tones.length]
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
  const [tones, dark] = LEATHER[useTheme()]
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
      style={{ background: `linear-gradient(145deg, ${tone(book.title, tones)}, ${dark})` }}
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
