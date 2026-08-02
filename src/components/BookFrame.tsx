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

        {/* Böig flatternde Seiten am rechten Rand – Böe läuft gestaffelt durch */}
        <div
          className="pointer-events-none absolute inset-y-10 right-1 z-[15] hidden w-10 [perspective:1300px] sm:block lg:w-14"
          aria-hidden="true"
        >
          {[
            { d: '0s', t: '4.2s', o: 1 },
            { d: '-0.5s', t: '4.6s', o: 0.85 },
            { d: '-1.1s', t: '4.3s', o: 0.7 },
            { d: '-1.7s', t: '4.8s', o: 0.55 },
            { d: '-2.4s', t: '4.4s', o: 0.4 },
          ].map((p, i) => (
            <span
              key={i}
              className="page-leaf"
              style={{ animationDelay: p.d, animationDuration: p.t, opacity: p.o }}
            />
          ))}
        </div>

        {/* Inhalt „auf den Seiten" – rechts Platz für die Seitenkante */}
        <div className="relative z-10 sm:pr-16 lg:pr-24">{children}</div>
      </div>
    </div>
  )
}
