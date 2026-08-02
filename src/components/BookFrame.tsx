import type { ReactNode } from 'react'

// Rahmt die angemeldete Ansicht als offenes Buch: Papier-Seite auf dem
// „Schreibtisch", Buchfalz in der Mitte, am rechten Rand sanft wehende Seiten.
// Der Inhalt bekommt rechts Platz reserviert, damit nichts überlappt.
export function BookFrame({ children }: { children: ReactNode }) {
  return (
    <div className="desk min-h-screen sm:p-3 lg:p-6">
      <div className="book-spread relative mx-auto min-h-screen max-w-6xl bg-paper-50 dark:bg-night-900 sm:min-h-[calc(100vh-1.5rem)] sm:rounded-3xl lg:min-h-[calc(100vh-3rem)]">
        {/* Buchfalz Mitte (nur breite Screens) */}
        <div className="gutter hidden lg:block" aria-hidden="true" />

        {/* Wehende Seiten am rechten Rand – im reservierten Streifen (kein Overlap) */}
        <div
          className="pointer-events-none absolute inset-y-16 right-1 hidden w-5 [perspective:1000px] sm:block lg:w-7"
          aria-hidden="true"
        >
          <span className="page-leaf" />
          <span className="page-leaf" style={{ animationDelay: '-1.8s', opacity: 0.7 }} />
          <span className="page-leaf" style={{ animationDelay: '-3.6s', opacity: 0.45 }} />
        </div>

        {/* Inhalt „auf den Seiten" – rechts Platz für die Seitenkante */}
        <div className="relative z-10 sm:pr-8 lg:pr-12">{children}</div>
      </div>
    </div>
  )
}
