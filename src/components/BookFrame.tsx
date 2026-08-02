import type { ReactNode } from 'react'

// Rahmt die angemeldete Ansicht als offenes Buch: Papier-Seite auf dem
// „Schreibtisch", Buchfalz in der Mitte, am rechten Rand sanft wehende Seiten.
// Der Inhalt bekommt rechts Platz reserviert, damit nichts überlappt.
export function BookFrame({ children }: { children: ReactNode }) {
  return (
    <div className="desk min-h-screen sm:p-3 lg:p-6">
      <div className="book-spread relative mx-auto min-h-screen max-w-6xl bg-paper-50 dark:bg-night-900 sm:min-h-[calc(100vh-1.5rem)] sm:rounded-3xl lg:min-h-[calc(100vh-3rem)]">
        {/* Driftendes warmes Licht als lebendiger Hintergrund */}
        <div className="page-ambient sm:rounded-3xl" aria-hidden="true">
          <span className="ambient-blob a" />
          <span className="ambient-blob b" />
        </div>

        {/* Buchfalz Mitte (nur breite Screens) */}
        <div className="gutter hidden lg:block" aria-hidden="true" />

        {/* Wehende Seiten am rechten Rand – im reservierten Streifen (kein Overlap) */}
        <div
          className="pointer-events-none absolute inset-y-12 right-1 z-[15] hidden w-8 [perspective:1200px] sm:block lg:w-12"
          aria-hidden="true"
        >
          <span className="page-leaf" />
          <span className="page-leaf" style={{ animationDelay: '-1.5s', opacity: 0.75 }} />
          <span className="page-leaf" style={{ animationDelay: '-3s', opacity: 0.5 }} />
        </div>

        {/* Inhalt „auf den Seiten" – rechts Platz für die Seitenkante */}
        <div className="relative z-10 sm:pr-12 lg:pr-16">{children}</div>
      </div>
    </div>
  )
}
