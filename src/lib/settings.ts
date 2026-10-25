// Persönliche Tracking-Einstellungen, gespeichert in den Metadaten des Kontos
// (wie der Name) – so braucht es keine eigene Tabelle.

export type GoalType = 'books' | 'pages'

export interface TrackingSettings {
  finishedDate: boolean // Datum des Auslesens
  progress: boolean // Lesefortschritt pro Buch
  goal: boolean // Jahresziel (braucht das Datum des Auslesens)
  goalType: GoalType
  goalTarget: number
}

export const DEFAULT_SETTINGS: TrackingSettings = {
  finishedDate: false,
  progress: false,
  goal: false,
  goalType: 'books',
  goalTarget: 12,
}

export function readSettings(meta: Record<string, unknown> | undefined): TrackingSettings {
  const t = (meta?.tracking ?? {}) as Partial<TrackingSettings>
  const s = { ...DEFAULT_SETTINGS, ...t }
  // ohne Datum des Auslesens lässt sich kein Jahresziel zählen
  if (s.goal) s.finishedDate = true
  if (!(s.goalTarget > 0)) s.goalTarget = DEFAULT_SETTINGS.goalTarget
  return s
}

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit. */
export function today(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
