import type { ReadingStatus } from '../types'
import type { SigilName } from './Sigil'

// Siegel und Farbe je Lese-Status
export const STATUS_SIGIL: Record<ReadingStatus, { sigil: SigilName; color: string }> = {
  reading: { sigil: 'candle', color: 'text-flame' },
  owned: { sigil: 'tome', color: 'text-moon-300' },
  wishlist: { sigil: 'comet', color: 'text-rose' },
  read: { sigil: 'crescent', color: 'text-moss' },
}
