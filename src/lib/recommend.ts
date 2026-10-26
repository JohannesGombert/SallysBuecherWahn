import type { Book, BookLookupResult } from '../types'
import { googleVolumes, hasGoogleKey } from './bookApi'

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

/** Alle Werke einer Autorin aus dem Katalog, ohne Doppelte (Ausgaben) und ohne eigene Bücher. */
export async function fetchWorks(author: string, books: Book[], isbn?: string | null): Promise<Recommendation[]> {
  // die ISBN eines eigenen Buchs bestimmt die Person eindeutig (gegen Namensgleiche)
  const q = new URLSearchParams({ works: author, ...(isbn ? { isbn } : {}) })
  const res = await fetch(`/api/recommend?${q}`)
  if (!res.ok) throw new Error(`Werke nicht erreichbar (${res.status})`)
  const data = (await res.json()) as { items: Recommendation[]; source: string }
  // kennt die Nationalbibliothek die Person nicht, Google aus dem Browser fragen (voller Name muss passen)
  if (data.source !== 'dnb' && hasGoogleKey) {
    const name = author.toLowerCase()
    const google = await googleVolumes(`inauthor:"${author}"`, 'langRestrict=de&printType=books&maxResults=40&country=DE').catch(() => [])
    const own = google.filter((b) => b.authors.some((a) => a.toLowerCase() === name))
    if (own.length) return filterKnown(own.map((book) => ({ kind: 'author' as const, seed: author, book })), books)
  }
  return filterKnown(data.items, books)
}

const NEWEST = 'orderBy=newest&langRestrict=de&printType=books&maxResults=20&country=DE'
const yearOf = (d: string | null) => Number(d?.match(/\d{4}/)?.[0] ?? 0)

/** Neuerscheinungen (letzte 2 Jahre) einer Autorin oder eines Genres direkt bei Google. */
async function googleNewest(kind: Recommendation['kind'], seed: string): Promise<Recommendation[]> {
  const minYear = new Date().getFullYear() - 2
  const last = seed.toLowerCase().split(' ').pop() ?? ''
  const books = await googleVolumes(kind === 'author' ? `inauthor:"${seed}"` : `subject:"${seed}"`, NEWEST)
  return books
    .filter((b) => yearOf(b.published_date) >= minYear)
    .filter((b) => kind !== 'author' || b.authors.some((a) => a.toLowerCase().includes(last)))
    .slice(0, 6)
    .map((book) => ({ kind, seed, book }))
}

export async function fetchRecommendations(books: Book[]): Promise<{ items: Recommendation[]; source: string }> {
  const { authors, genres } = seedsFrom(books)
  if (!authors.length && !genres.length) return { items: [], source: 'none' }
  const seeds = [
    ...authors.map((s) => ({ kind: 'author' as const, s })),
    ...genres.map((s) => ({ kind: 'genre' as const, s })),
  ]
  // zuerst Google aus dem Browser; was dort fehlt oder scheitert, holt der Server (Open Library)
  const google = hasGoogleKey ? await Promise.all(seeds.map((x) => googleNewest(x.kind, x.s).catch(() => []))) : []
  const missing = seeds.filter((_, i) => !google[i]?.length)
  let server: { items: Recommendation[]; source: string } = { items: [], source: 'google' }
  if (missing.length) {
    const q = new URLSearchParams({
      authors: missing.filter((x) => x.kind === 'author').map((x) => x.s).join('|'),
      genres: missing.filter((x) => x.kind === 'genre').map((x) => x.s).join('|'),
    })
    const res = await fetch(`/api/recommend?${q}`)
    if (!res.ok && !google.some((g) => g.length)) throw new Error(`Empfehlungen nicht erreichbar (${res.status})`)
    if (res.ok) server = await res.json()
  }
  return { items: filterKnown([...google.flat(), ...server.items], books), source: server.source }
}
