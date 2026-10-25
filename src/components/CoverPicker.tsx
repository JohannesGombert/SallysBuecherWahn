import { useEffect, useState } from 'react'
import type { Book } from '../types'
import { searchBooks } from '../lib/bookApi'
import { isbnCoverSources, NO_COVER } from '../lib/covers'
import { BookCover } from './BookCover'

/** Alle gefundenen Cover-Varianten zur Wahl, plus eigene Bild-Adresse oder Ledereinband. */
export function CoverPicker({ book, onPick }: { book: Book; onPick: (url: string) => void }) {
  const [options, setOptions] = useState<string[]>(() =>
    unique([book.cover_url !== NO_COVER ? book.cover_url : null, ...isbnCoverSources(book.isbn, true)]),
  )
  const [searching, setSearching] = useState(true)
  const [own, setOwn] = useState('')

  // weitere Ausgaben desselben Buchs (andere Verlage, Taschenbuch …) bringen oft flache Cover mit
  useEffect(() => {
    let alive = true
    searchBooks([book.title, book.authors[0]].filter(Boolean).join(' '))
      .then((res) => alive && setOptions((o) => unique([...o, ...res.slice(0, 12).map((r) => r.cover_url)])))
      .finally(() => alive && setSearching(false))
    return () => {
      alive = false
    }
  }, [book.title, book.authors])

  const ownValid = /^https:\/\/\S+$/.test(own.trim())

  return (
    <div className="mt-4 rounded-xl border border-gold-400/20 bg-night-950/40 p-4">
      <p className="rubric mb-3">Cover wählen</p>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {options.map((url) => (
          <Option key={url} url={url} active={book.cover_url === url} onPick={onPick} />
        ))}
        <button
          onClick={() => onPick(NO_COVER)}
          className={`aspect-[2/3] overflow-hidden rounded-sm ring-2 transition ${book.cover_url === NO_COVER ? 'ring-gold-300' : 'ring-transparent hover:ring-gold-400/50'}`}
          aria-label="Ledereinband statt Bild"
        >
          <BookCover book={{ ...book, cover_url: NO_COVER }} compact />
        </button>
      </div>
      {searching && <p className="mt-3 animate-pulse text-sm italic text-ivory-300">Weitere Ausgaben werden gesucht …</p>}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (ownValid) onPick(own.trim())
        }}
      >
        <label className="flex-1">
          <span className="sr-only">Eigene Bild-Adresse</span>
          <input className="field !py-2 text-[15px]" type="url" placeholder="Eigene Bild-Adresse (https://…)" value={own} onChange={(e) => setOwn(e.target.value)} />
        </label>
        <button type="submit" className="btn-quiet" disabled={!ownValid}>
          Übernehmen
        </button>
      </form>
    </div>
  )
}

function Option({ url, active, onPick }: { url: string; active: boolean; onPick: (url: string) => void }) {
  const [broken, setBroken] = useState(false)
  if (broken) return null
  return (
    <button
      onClick={() => onPick(url)}
      className={`aspect-[2/3] overflow-hidden rounded-sm bg-night-700 ring-2 transition ${active ? 'ring-gold-300' : 'ring-transparent hover:ring-gold-400/50'}`}
      aria-label="Dieses Cover verwenden"
      aria-pressed={active}
    >
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
        // Amazon liefert statt 404 ein 1×1-Pixel-GIF
        onLoad={(e) => e.currentTarget.naturalWidth <= 1 && setBroken(true)}
      />
    </button>
  )
}

function unique(urls: (string | null | undefined)[]): string[] {
  return [...new Set(urls.filter((u): u is string => Boolean(u)))]
}
