import type { Book, ReadingStatus } from '../types'
import { SHELF_STATUSES } from '../types'

// Kennzahlen über die ganze Bibliothek (Logik aus dem bisherigen Statistik-Panel).
export function computeStats(books: Book[]) {
  const total = books.length
  const by = (st: ReadingStatus) => books.filter((b) => b.status === st).length
  const read = by('read')
  const reading = by('reading')
  const owned = by('owned')
  const wishlist = by('wishlist')
  const shelf = books.filter((b) => SHELF_STATUSES.includes(b.status)).length

  const rated = books.filter((b) => (b.rating ?? 0) > 0)
  const avgRating = rated.length ? rated.reduce((a, b) => a + (b.rating ?? 0), 0) / rated.length : 0
  const ratingDist: Record<number, number> = {}
  for (const b of rated) ratingDist[b.rating!] = (ratingDist[b.rating!] ?? 0) + 1
  const ratingMax = Math.max(1, ...Object.values(ratingDist))

  const readBooks = books.filter((b) => b.status === 'read')
  const pagesRead = readBooks.reduce((a, b) => a + (b.page_count ?? 0), 0)
  const readWithPages = readBooks.filter((b) => b.page_count)
  const avgPages = readWithPages.length ? Math.round(pagesRead / readWithPages.length) : 0
  const longest = books
    .filter((b) => b.page_count)
    .sort((a, b) => (b.page_count ?? 0) - (a.page_count ?? 0))[0]

  const authorCount = new Map<string, number>()
  for (const b of books) for (const a of b.authors) authorCount.set(a, (authorCount.get(a) ?? 0) + 1)
  const topAuthors = [...authorCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const catCount = new Map<string, number>()
  for (const b of books) for (const c of b.categories) catCount.set(c, (catCount.get(c) ?? 0) + 1)
  const topCategories = [...catCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topRated = [...rated]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.title.localeCompare(b.title))
    .slice(0, 5)

  const decadeCount = new Map<number, number>()
  for (const b of books) {
    const m = b.published_date?.match(/\d{4}/)
    if (m) {
      const dec = Math.floor(parseInt(m[0], 10) / 10) * 10
      decadeCount.set(dec, (decadeCount.get(dec) ?? 0) + 1)
    }
  }
  const decades = [...decadeCount.entries()]
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => a.decade - b.decade)
  const decadeMax = Math.max(1, ...decades.map((d) => d.count))

  const statusRows: { status: ReadingStatus; count: number }[] = [
    { status: 'read', count: read },
    { status: 'reading', count: reading },
    { status: 'owned', count: owned },
    { status: 'wishlist', count: wishlist },
  ]

  return {
    total,
    read,
    reading,
    owned,
    wishlist,
    shelf,
    pctRead: shelf ? Math.round((read / shelf) * 100) : 0,
    avgRating,
    ratedCount: rated.length,
    ratingDist,
    ratingMax,
    pagesRead,
    avgPages,
    longest: longest ? { pages: longest.page_count } : null,
    uniqueAuthors: authorCount.size,
    uniqueCategories: catCount.size,
    topAuthors,
    topCategories,
    topRated,
    decades,
    decadeMax,
    statusRows,
  }
}

export type LibraryStats = ReturnType<typeof computeStats>
