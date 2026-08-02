export type ReadingStatus = 'wishlist' | 'owned' | 'reading' | 'read'

export const STATUS_LABELS: Record<ReadingStatus, string> = {
  wishlist: 'Wunschliste',
  owned: 'Ungelesen',
  reading: 'Lese ich',
  read: 'Gelesen',
}

export const STATUS_ORDER: ReadingStatus[] = ['reading', 'owned', 'wishlist', 'read']

// „Im Regal" = alles, was man besitzt (nicht auf der Wunschliste)
export const SHELF_STATUSES: ReadingStatus[] = ['owned', 'reading', 'read']

export interface Book {
  id: string
  user_id: string
  isbn: string | null
  title: string
  authors: string[]
  cover_url: string | null
  description: string | null
  publisher: string | null
  published_date: string | null
  page_count: number | null
  categories: string[]
  status: ReadingStatus
  rating: number | null // 0–5
  notes: string | null
  created_at: string
}

/** Ergebnis eines ISBN-Lookups, noch ohne DB-Felder. */
export interface BookLookupResult {
  isbn: string | null
  title: string
  authors: string[]
  cover_url: string | null
  description: string | null
  publisher: string | null
  published_date: string | null
  page_count: number | null
  categories: string[]
}
