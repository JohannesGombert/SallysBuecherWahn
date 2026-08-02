import type { BookLookupResult } from '../types'

/** Entfernt Bindestriche/Leerzeichen aus einer ISBN. */
export function cleanIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, '').toUpperCase()
}

/** Prüft, ob ein String eine plausible ISBN-10 oder ISBN-13 ist. */
export function isValidIsbn(raw: string): boolean {
  const isbn = cleanIsbn(raw)
  return isbn.length === 10 || isbn.length === 13
}

function upgradeCover(url: string | undefined): string | null {
  if (!url) return null
  // Google liefert http + zoom=1; wir holen eine größere, sichere Variante.
  return url.replace('http://', 'https://').replace('zoom=1', 'zoom=2')
}

// Optionaler Google-Books-API-Key (empfohlen für stabile Trefferquote auf
// Mobilfunk). In .env als VITE_GOOGLE_BOOKS_KEY hinterlegen.
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY as string | undefined
const keyParam = GOOGLE_KEY ? `&key=${GOOGLE_KEY}` : ''

/** Versucht Google Books zuerst, dann Open Library als Fallback. */
export async function lookupIsbn(rawIsbn: string): Promise<BookLookupResult | null> {
  const isbn = cleanIsbn(rawIsbn)
  if (!isbn) return null

  const google = await lookupGoogle(isbn).catch(() => null)
  if (google) return google

  const ol = await lookupOpenLibrary(isbn).catch(() => null)
  if (ol) return ol

  // Letzter Versuch: Google-Freitextsuche nach der ISBN (findet manchmal mehr)
  const fallback = await searchBooks(isbn).catch(() => [])
  return fallback[0] ?? null
}

async function lookupGoogle(isbn: string): Promise<BookLookupResult | null> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=DE${keyParam}`,
  )
  if (!res.ok) return null
  const data = await res.json()
  const item = data.items?.[0]?.volumeInfo
  if (!item) return null

  return {
    isbn,
    title: item.title ?? 'Unbekannter Titel',
    authors: item.authors ?? [],
    cover_url: upgradeCover(item.imageLinks?.thumbnail),
    description: item.description ?? null,
    publisher: item.publisher ?? null,
    published_date: item.publishedDate ?? null,
    page_count: item.pageCount ?? null,
    categories: item.categories ?? [],
  }
}

async function lookupOpenLibrary(isbn: string): Promise<BookLookupResult | null> {
  const res = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  )
  if (!res.ok) return null
  const data = await res.json()
  const item = data[`ISBN:${isbn}`]
  if (!item) return null

  return {
    isbn,
    title: item.title ?? 'Unbekannter Titel',
    authors: (item.authors ?? []).map((a: { name: string }) => a.name),
    cover_url: item.cover?.large ?? item.cover?.medium ?? null,
    description:
      typeof item.notes === 'string'
        ? item.notes
        : item.notes?.value ?? null,
    publisher: item.publishers?.[0]?.name ?? null,
    published_date: item.publish_date ?? null,
    page_count: item.number_of_pages ?? null,
    categories: (item.subjects ?? []).slice(0, 5).map((s: { name: string }) => s.name),
  }
}

/** Freitextsuche (Titel/Autor) über Google Books, liefert mehrere Treffer. */
export async function searchBooks(query: string): Promise<BookLookupResult[]> {
  if (!query.trim()) return []
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query,
    )}&maxResults=20&country=DE${keyParam}`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.items ?? []).map((raw: any): BookLookupResult => {
    const item = raw.volumeInfo ?? {}
    const isbn13 = item.industryIdentifiers?.find(
      (i: { type: string; identifier: string }) => i.type === 'ISBN_13',
    )?.identifier
    const isbn10 = item.industryIdentifiers?.find(
      (i: { type: string; identifier: string }) => i.type === 'ISBN_10',
    )?.identifier
    return {
      isbn: isbn13 ?? isbn10 ?? null,
      title: item.title ?? 'Unbekannter Titel',
      authors: item.authors ?? [],
      cover_url: upgradeCover(item.imageLinks?.thumbnail),
      description: item.description ?? null,
      publisher: item.publisher ?? null,
      published_date: item.publishedDate ?? null,
      page_count: item.pageCount ?? null,
      categories: item.categories ?? [],
    }
  })
}
