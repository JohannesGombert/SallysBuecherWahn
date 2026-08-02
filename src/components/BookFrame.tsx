import type { ReactNode } from 'react'
import { PageRiffle } from './PageRiffle'

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

        {/* Böig flatternde, sich wölbende Seiten (Canvas) am rechten Rand */}
        <div
          className="pointer-events-none absolute inset-y-6 right-2 z-[15] hidden w-24 sm:block lg:w-40"
          aria-hidden="true"
        >
          <PageRiffle />
        </div>

        {/* Inhalt „auf den Seiten" – rechts Platz für den Seitenfächer */}
        <div className="relative z-10 sm:pr-28 lg:pr-44">{children}</div>
      </div>
    </div>
  )
}
