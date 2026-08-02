import type { ReactNode } from 'react'

// Rahmt die angemeldete Ansicht als offenes Buch: Papier-Doppelseite auf dem
// „Schreibtisch", mit Buchfalz in der Mitte und wehenden Seiten am Rand.
export function BookFrame({ children }: { children: ReactNode }) {
  return (
    <div className="desk min-h-screen md:p-4 lg:p-6">
      <div className="book-spread relative mx-auto min-h-screen max-w-6xl bg-paper-50 dark:bg-night-900 md:min-h-[calc(100vh-2rem)] md:rounded-[2rem] lg:min-h-[calc(100vh-3rem)]">
        {/* Buchfalz Mitte */}
        <div className="gutter hidden lg:block" aria-hidden="true" />

        {/* Wehende Seiten am rechten Rand (nur Desktop, dezent) */}
        <div
          className="pointer-events-none absolute inset-y-8 right-0 hidden w-6 [perspective:900px] md:block"
          aria-hidden="true"
        >
          <span className="page-leaf" />
          <span className="page-leaf" style={{ animationDelay: '-2.6s', opacity: 0.55 }} />
          <span className="page-leaf" style={{ animationDelay: '-4.4s', opacity: 0.3 }} />
        </div>

        {/* Inhalt „auf den Seiten" */}
        <div className="relative z-10 overflow-hidden md:rounded-[2rem]">{children}</div>
      </div>
    </div>
  )
}
