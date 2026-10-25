import type { Book } from '../types'
import type { GoalType } from './settings'

export interface GoalProgress {
  year: number
  done: number // gelesene Bücher bzw. Seiten in diesem Jahr
  target: number
  pct: number // 0–100, gedeckelt
  expected: number // Soll bis heute (gleichmäßig übers Jahr verteilt)
  ahead: number // > 0 vor dem Plan, < 0 dahinter (ganze Bücher/Seiten)
}

/** Fortschritt zum Jahresziel: zählt Bücher mit Status „Gelesen“ und Auslese-Datum im Jahr. */
export function goalProgress(books: Book[], type: GoalType, target: number, now = new Date()): GoalProgress {
  const year = now.getFullYear()
  const finished = books.filter((b) => b.status === 'read' && b.finished_at?.startsWith(String(year)))
  const done = type === 'books' ? finished.length : finished.reduce((s, b) => s + (b.page_count ?? 0), 0)

  const start = new Date(year, 0, 1).getTime()
  const end = new Date(year + 1, 0, 1).getTime()
  const share = (now.getTime() - start) / (end - start)
  const expected = target * share

  return {
    year,
    done,
    target,
    pct: target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0,
    expected,
    ahead: Math.round(done - expected),
  }
}

/** „2 Bücher vor dem Plan“, „im Plan“, „120 Seiten hinter dem Plan“ */
export function planText(g: GoalProgress, type: GoalType): string {
  if (g.done >= g.target) return 'Ziel erreicht'
  const n = Math.abs(g.ahead)
  if (n === 0) return 'genau im Plan'
  const unit = type === 'books' ? (n === 1 ? 'Buch' : 'Bücher') : n === 1 ? 'Seite' : 'Seiten'
  return `${n.toLocaleString('de-DE')} ${unit} ${g.ahead > 0 ? 'vor' : 'hinter'} dem Plan`
}

/** Lesestand in Prozent (0–100), 0 ohne Angaben. */
export function readingPct(current: number | null, total: number | null): number {
  if (!current || !total) return 0
  return Math.min(100, Math.round((current / total) * 100))
}
