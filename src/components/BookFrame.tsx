import type { ReactNode } from 'react'

// Rahmt die angemeldete Ansicht als Buchseite im Kerzenschein:
// warmes Pergament auf dem „Schreibtisch", weiches Kerzenlicht oben links,
// gemütlich abgedunkelte Ränder (Vignette) und feine Papierkörnung. Statisch.
export function BookFrame({ children }: { children: ReactNode }) {
  return (
    <div className="desk min-h-screen sm:p-3 lg:p-6">
      <div className="book-spread antique-page relative mx-auto min-h-screen max-w-6xl overflow-hidden sm:min-h-[calc(100vh-1.5rem)] sm:rounded-3xl lg:min-h-[calc(100vh-3rem)]">
        {/* Papierkörnung */}
        <div className="paper-grain" aria-hidden="true" />
        {/* Mittelstrich wie zwischen zwei Spalten */}
        <div className="column-rule hidden lg:block" aria-hidden="true" />

        {/* Inhalt „auf der Seite" */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
