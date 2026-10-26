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

// Google-Books-Schlüssel für Abfragen direkt aus dem Browser (VITE_GOOGLE_BOOKS_KEY).
// Er steht im ausgelieferten Code und ist in der Google-Konsole auf die Website beschränkt.
// Vom Server (Cloudflare) aus antwortet Google kaum zuverlässig, aus dem Browser schon.
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY as string | undefined
const keyParam = GOOGLE_KEY ? `&key=${GOOGLE_KEY}` : ''
export const hasGoogleKey = Boolean(GOOGLE_KEY)

/**
 * Fragt zuerst unseren Server-Proxy (Cloudflare-Pages-Function: Google Books → DNB),
 * dann direkte Browser-Fallbacks (für lokale Entwicklung ohne Functions).
 */
export async function lookupIsbn(rawIsbn: string): Promise<BookLookupResult | null> {
  const isbn = cleanIsbn(rawIsbn)
  if (!isbn) return null

  const proxied = await lookupProxy(isbn).catch(() => null)
  if (proxied) return proxied

  const google = await lookupGoogle(isbn).catch(() => null)
  if (google) return google

  const ol = await lookupOpenLibrary(isbn).catch(() => null)
  if (ol) return ol

  // Letzter Versuch: Google-Freitextsuche nach der ISBN (findet manchmal mehr)
  const fallback = await searchBooks(isbn).catch(() => [])
  return fallback[0] ?? null
}

async function lookupProxy(isbn: string): Promise<BookLookupResult | null> {
  const res = await fetch(`/api/isbn?isbn=${isbn}`)
  if (!res.ok) return null
  const data = await res.json()
  return data && data.title ? (data as BookLookupResult) : null
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

/** Freitextsuche (Titel/Autor): Google Books, sonst Open Library. Liefert mehrere Treffer. */
export async function searchBooks(query: string): Promise<BookLookupResult[]> {
  if (!query.trim()) return []
  const google = await searchGoogle(query).catch(() => [])
  if (google.length) return google
  // Google Books drosselt ohne API-Key gern (429) – dann Open Library fragen
  return searchOpenLibrary(query).catch(() => [])
}

async function searchOpenLibrary(query: string): Promise<BookLookupResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20` +
      '&fields=title,author_name,isbn,cover_i,first_publish_year,publisher,number_of_pages_median,subject',
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs ?? []).map((d: any): BookLookupResult => {
    const isbns: string[] = d.isbn ?? []
    // deutsche Ausgabe bevorzugen, sonst irgendeine ISBN-13
    const isbn = isbns.find((i) => i.startsWith('9783')) ?? isbns.find((i) => i.length === 13) ?? isbns[0] ?? null
    return {
      isbn,
      title: d.title ?? 'Unbekannter Titel',
      authors: d.author_name ?? [],
      cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
      description: null,
      publisher: d.publisher?.[0] ?? null,
      published_date: d.first_publish_year ? String(d.first_publish_year) : null,
      page_count: d.number_of_pages_median ?? null,
      categories: (d.subject ?? []).slice(0, 5),
    }
  })
}

async function searchGoogle(query: string): Promise<BookLookupResult[]> {
  return googleVolumes(query).catch(() => [])
}

/** Google-Books-Suche aus dem Browser; wirft bei Fehlern, damit Aufrufer ausweichen können. */
export async function googleVolumes(query: string, params = 'maxResults=20&country=DE'): Promise<BookLookupResult[]> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&${params}${keyParam}`,
  )
  if (!res.ok) throw new Error(`Google ${res.status}`)
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
