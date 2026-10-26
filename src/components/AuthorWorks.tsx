import { useEffect, useRef, useState } from 'react'
import type { Book, ReadingStatus } from '../types'
import { addBook } from '../lib/booksRepo'
import { fetchWorks, type Recommendation } from '../lib/recommend'
import { BookCover } from './BookCover'
import { Group } from './Recommendations'
import { Sheet } from './Sheet'

/** Alle Werke einer Autorin: zuerst die im eigenen Grimoire, dann weitere aus dem Katalog. */
export function AuthorWorks({
  author,
  books,
  onOpenBook,
  onAdded,
  onClose,
}: {
  author: string
  books: Book[]
  onOpenBook: (b: Book) => void
  onAdded: () => void
  onClose: () => void
}) {
  const [items, setItems] = useState<Recommendation[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<Map<string, ReadingStatus>>(new Map())
  // nur beim Öffnen laden; vorgemerkte Bücher sollen nicht aus der Liste springen
  const atOpen = useRef(books)
  const mine = books.filter((b) => b.authors.includes(author))

  useEffect(() => {
    let alive = true
    const isbn = atOpen.current.find((b) => b.authors.includes(author) && b.isbn)?.isbn
    fetchWorks(author, atOpen.current, isbn)
      .then((r) => alive && setItems(r))
      .catch((e) => alive && setError(e?.message ?? 'Die Werke lassen sich gerade nicht finden.'))
    return () => {
      alive = false
    }
  }, [author])

  async function add(r: Recommendation, key: string, status: ReadingStatus) {
    try {
      await addBook(r.book, status)
      setAdded((m) => new Map(m).set(key, status))
      onAdded()
    } catch (e: any) {
      setError(`Konnte nicht eingeschrieben werden: ${e?.message ?? e}`)
    }
  }

  return (
    <Sheet title="Werke von" onClose={onClose} wide>
      <h3 className="pt-1 font-display text-2xl font-semibold text-gold-200">{author}</h3>

      {mine.length > 0 && (
        <section className="mt-5">
          <h4 className="rubric mb-3">In deinem Grimoire</h4>
          <ul className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {mine.map((b) => (
              <li key={b.id} className="w-20 shrink-0">
                <button onClick={() => onOpenBook(b)} className="block w-full text-left" aria-label={`${b.title} öffnen`}>
                  <span className="block h-[120px] overflow-hidden rounded-sm ring-1 ring-gold-400/25 transition hover:ring-gold-300/70">
                    <BookCover book={b} compact />
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-snug text-ivory-200">{b.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p className="mt-5 text-danger">{error}</p>}
      {!items && !error && <p className="mt-6 animate-pulse italic text-gold-200">Die Bibliothek wird durchsucht …</p>}
      {items && items.length === 0 && (
        <p className="mt-6 italic text-ivory-300">Keine weiteren deutschsprachigen Werke gefunden.</p>
      )}
      {items && items.length > 0 && (
        <Group title="Weitere Werke" items={items} added={added} onAdd={add} reason={false} />
      )}
    </Sheet>
  )
}
