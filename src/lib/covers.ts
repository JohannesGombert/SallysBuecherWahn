// Gespeicherter Wert für „bewusst kein Bild, Ledereinband zeigen“
export const NO_COVER = 'leder:'

type CoverBook = { cover_url: string | null; isbn: string | null }

/** Automatische Cover-Quellen per ISBN (ohne das gespeicherte Cover). */
export function isbnCoverSources(isbn: string | null, extra = false): string[] {
  const clean = isbn?.replace(/[^0-9Xx]/g, '')
  if (!clean) return []
  const urls = [`https://covers.openlibrary.org/b/isbn/${clean}-L.jpg?default=false`]
  // Hugendubel nur in der Auswahl: zeigt meist dasselbe Verlagsbild wie Amazon
  if (extra && clean.length === 13) urls.push(`https://www.hugendubel.info/annotstream/${clean}/COP`)
  // Amazon hat Cover für fast alle deutschen Ausgaben (Schlüssel ist die ISBN-10)
  const isbn10 = toIsbn10(clean)
  if (isbn10) urls.push(`https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`)
  return urls
}

/** Reihenfolge fürs Anzeigen: gespeichertes Cover, dann ISBN-Quellen. */
export function coverCandidates(book: CoverBook): string[] {
  if (book.cover_url === NO_COVER) return []
  return [...new Set([book.cover_url, ...isbnCoverSources(book.isbn)].filter((u): u is string => Boolean(u)))]
}

export function toIsbn10(isbn: string): string | null {
  if (isbn.length === 10) return isbn.toUpperCase()
  if (isbn.length !== 13 || !isbn.startsWith('978')) return null
  const core = isbn.slice(3, 12)
  const sum = [...core].reduce((s, d, i) => s + (10 - i) * Number(d), 0)
  const check = (11 - (sum % 11)) % 11
  return core + (check === 10 ? 'X' : String(check))
}
