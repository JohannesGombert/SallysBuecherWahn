import { useEffect, useRef, useState } from 'react'
import type { Book } from '../types'
import { addBook } from '../lib/booksRepo'
import { fetchRecommendations, type Recommendation } from '../lib/recommend'
import { amazonDeUrl } from '../lib/utils'
import { BookCover } from './BookCover'
import { Sheet } from './Sheet'
import { Sigil } from './Sigil'

/** „Die Sterne empfehlen“: Neuerscheinungen der Lieblingsautor:innen und -genres. */
export function Recommendations({ books, onAdded, onClose }: { books: Book[]; onAdded: () => void; onClose: () => void }) {
  const [items, setItems] = useState<Recommendation[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  // nur beim Öffnen laden; spätere Änderungen an books (z. B. vorgemerkt) nicht neu abfragen
  const atOpen = useRef(books)

  useEffect(() => {
    let alive = true
    fetchRecommendations(atOpen.current)
      .then((r) => alive && setItems(r.items))
      .catch((e) => alive && setError(e?.message ?? 'Die Sterne schweigen gerade.'))
    return () => {
      alive = false
    }
  }, [])

  async function wish(r: Recommendation, key: string) {
    try {
      await addBook(r.book, 'wishlist')
      setAdded((s) => new Set(s).add(key))
      onAdded()
    } catch (e: any) {
      setError(`Konnte nicht vorgemerkt werden: ${e?.message ?? e}`)
    }
  }

  const byAuthor = items?.filter((r) => r.kind === 'author') ?? []
  const byGenre = items?.filter((r) => r.kind === 'genre') ?? []

  return (
    <Sheet title="Die Sterne empfehlen" onClose={onClose} wide>
      <p className="pt-1 italic text-ivory-200">
        Neuerscheinungen der letzten zwei Jahre, passend zu den Büchern, die du gelesen hast und magst.
      </p>

      {error && <p className="mt-5 text-danger">{error}</p>}
      {!items && !error && <p className="mt-6 animate-pulse italic text-gold-200">Die Sterne werden befragt …</p>}

      {items && items.length === 0 && (
        <p className="mt-6 italic text-ivory-300">
          {books.some((b) => b.status === 'read' || (b.rating ?? 0) >= 4)
            ? 'Gerade gibt es keine neuen Bücher deiner Autor:innen und Genres. Schau bald wieder vorbei.'
            : 'Lies und bewerte ein paar Bücher, dann können dir die Sterne etwas empfehlen.'}
        </p>
      )}

      {byAuthor.length > 0 && <Group title="Neu von deinen Autor:innen" items={byAuthor} added={added} onWish={wish} />}
      {byGenre.length > 0 && <Group title="Neu in deinen Genres" items={byGenre} added={added} onWish={wish} />}
    </Sheet>
  )
}

export function Group({
  title,
  items,
  added,
  onWish,
  reason = true,
}: {
  title: string
  items: Recommendation[]
  added: Set<string>
  onWish: (r: Recommendation, key: string) => void
  reason?: boolean // „Weil du … liest“ anzeigen
}) {
  return (
    <section className="mt-6">
      <h3 className="rubric mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((r, i) => {
          const key = `${r.book.isbn ?? r.book.title}-${i}`
          const done = added.has(key)
          const year = r.book.published_date?.match(/\d{4}/)?.[0]
          return (
            <li key={key} className="animate-rise flex gap-3 rounded-xl border border-gold-400/15 bg-night-950/40 p-2.5">
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm ring-1 ring-gold-400/25">
                <BookCover book={r.book} compact />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium leading-snug">{r.book.title}</p>
                <p className="line-clamp-1 text-[15px] italic text-ivory-300">
                  {r.book.authors.join(', ') || 'Unbekannt'}
                  {year ? ` · ${year}` : ''}
                </p>
                {reason && (
                  <p className="mt-1 text-sm text-gold-200/90">
                    {r.kind === 'author' ? `Weil du ${r.seed} liest` : `Neu in ${r.seed}`}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => onWish(r, key)}
                    disabled={done}
                    className={`btn !min-h-[38px] !px-3 !text-[11px] ${done ? 'text-moss' : 'border border-gold-400/35 text-gold-200 hover:bg-gold-400/10'}`}
                  >
                    <Sigil name={done ? 'check' : 'comet'} className="h-4 w-4" />
                    {done ? 'Vorgemerkt' : 'Auf die Wunschliste'}
                  </button>
                  <a
                    href={amazonDeUrl(r.book)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn !min-h-[38px] !px-3 !text-[11px] text-ivory-200 hover:text-gold-200"
                  >
                    <Sigil name="cart" className="h-4 w-4" /> Amazon
                  </a>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
