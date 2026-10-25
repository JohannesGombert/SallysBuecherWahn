import type { Book, BookLookupResult } from '../types'

export interface Recommendation {
  kind: 'author' | 'genre'
  seed: string // Autor:in bzw. Genre, auf dem die Empfehlung beruht
  book: BookLookupResult
}

// zu allgemeine Kategorien taugen nicht als Genre
const GENERIC = /^(fiction|nonfiction|general|roman|romane|belletristik|literatur|books?|bücher|b)$/i

const rank = (counts: Map<string, number>, n: number) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k)

/** Lieblings-Autor:innen und -Genres: aus gelesenen, gerade gelesenen und gut bewerteten Büchern. */
export function seedsFrom(books: Book[]): { authors: string[]; genres: string[] } {
  const authors = new Map<string, number>()
  const genres = new Map<string, number>()
  for (const b of books) {
    const liked = (b.rating ?? 0) >= 4
    if (b.status !== 'read' && b.status !== 'reading' && !liked) continue
    const w = 1 + (liked ? 2 : 0) + (b.status === 'read' ? 1 : 0)
    for (const a of b.authors) authors.set(a, (authors.get(a) ?? 0) + w)
    for (const c of b.categories) {
      // Google liefert z. B. „Fiction / Fantasy / Epic“ – das spezifischste Glied zählt
      const g = c.split('/').map((s) => s.trim()).filter(Boolean).pop() ?? ''
      if (g && !GENERIC.test(g)) genres.set(g, (genres.get(g) ?? 0) + w)
    }
  }
  return { authors: rank(authors, 4), genres: rank(genres, 3) }
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, '')
const keyOf = (b: { title: string; authors: string[] }) => norm(b.title).slice(0, 40) + '|' + norm(b.authors[0] ?? '')

/** Empfehlungen ohne Bücher, die schon im Grimoire stehen, und ohne Doppelte. */
export function filterKnown(items: Recommendation[], books: Book[]): Recommendation[] {
  const known = new Set<string>()
  for (const b of books) {
    known.add(keyOf(b))
    if (b.isbn) known.add(b.isbn)
  }
  const out: Recommendation[] = []
  for (const r of items) {
    const k = keyOf(r.book)
    if (known.has(k) || (r.book.isbn && known.has(r.book.isbn))) continue
    known.add(k)
    if (r.book.isbn) known.add(r.book.isbn)
    out.push(r)
  }
  return out
}

export async function fetchRecommendations(books: Book[]): Promise<{ items: Recommendation[]; source: string }> {
  const { authors, genres } = seedsFrom(books)
  if (!authors.length && !genres.length) return { items: [], source: 'none' }
  const q = new URLSearchParams({ authors: authors.join('|'), genres: genres.join('|') })
  const res = await fetch(`/api/recommend?${q}`)
  if (!res.ok) throw new Error(`Empfehlungen nicht erreichbar (${res.status})`)
  const data = (await res.json()) as { items: Recommendation[]; source: string }
  return { items: filterKnown(data.items, books), source: data.source }
}
