import { useEffect, type ReactNode } from 'react'
import { Corners, Emblem, Flourish } from './Emblem'
import { Sky } from './Sky'
import { useTheme } from '../lib/theme'

// Gemeinsame Maße: Login-Einband und Öffnungs-Animation liegen exakt übereinander.
export const COVER_SIZE = 'w-[min(92vw,440px)] min-h-[min(90dvh,640px)]'

export function GrimoireCover({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    // Positionierung (relative/absolute) kommt über className vom Aufrufer
    <div className={`leather tooled overflow-hidden rounded-l-md rounded-r-[1.4rem] ${className}`}>
      {/* Buchrücken-Schatten */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/55 to-transparent" aria-hidden="true" />
      <Corners inset="inset-[18px]" />
      <div className="relative z-10 flex flex-col items-center px-8 pb-10 pt-12 text-center sm:px-10">
        <CoverTitle />
        {children}
      </div>
    </div>
  )
}

function CoverTitle() {
  return (
    <>
      <Emblem className="h-16 w-16 animate-glow" />
      <h1 className="gold-foil mt-4 font-display text-[1.9rem] font-bold leading-tight tracking-wide sm:text-[2.2rem]">
        Sallys BücherWahn
      </h1>
      <p className="mt-1.5 italic text-ivory-200/75">Ein Zauberbuch für Leseratten</p>
      <Flourish className="mt-5 h-4 w-40" />
    </>
  )
}

// Funken, die beim Öffnen aus dem Buch steigen: [x, y, Verzögerung]
const SPARKS: [number, number, number][] = [
  [-140, -190, 0.55], [-60, -240, 0.7], [30, -210, 0.6], [120, -230, 0.8], [180, -140, 0.65],
  [-190, -60, 0.75], [210, -40, 0.9], [-120, 160, 0.85], [90, 190, 0.7], [160, 120, 1],
  [-30, -150, 0.95], [60, -120, 1.05], [-80, 90, 1.1], [0, 220, 0.8],
]

// Wald: Staub im Lichtkegel [links %, oben %, Verzögerung] und Blätter, die aus den Seiten steigen [x, y, Verzögerung]
const DUST: [number, number, number][] = [
  [46, 12, 0.6], [52, 22, 1.4], [49, 34, 0.9], [55, 45, 2], [44, 52, 1.2], [58, 60, 0.7], [41, 70, 1.7], [53, 78, 1],
]
const LEAVES: [number, number, number][] = [
  [-170, -210, 1.7], [150, -240, 1.85], [-220, -40, 2], [230, -110, 1.75], [40, -280, 1.95], [-90, -260, 2.1],
]

/** Nach dem Login: Der Deckel schwingt auf, Licht strömt heraus, man taucht ins Buch ein.
 *  Im Wald liegt erst dichter Nebel, der aufreißt; ein Lichtkegel fällt auf das Buch, dann öffnet es sich. */
export function GrimoireOpening({ name, onDone }: { name: string; onDone: () => void }) {
  const forest = useTheme() === 'wald'
  useEffect(() => {
    const t = setTimeout(onDone, forest ? 3500 : 2450)
    return () => clearTimeout(t)
  }, [onDone, forest])

  return (
    <div className={`opening fixed inset-0 z-50 flex overflow-hidden items-center justify-center ${forest ? 'forest' : ''}`} aria-hidden="true">
      <Sky shooting={false} />
      {forest && (
        <div className="light-cone">
          {DUST.map(([l, t, d]) => (
            <span key={l} className="dust" style={{ left: `${l}%`, top: `${t}%`, '--d': `${d}s` } as React.CSSProperties} />
          ))}
        </div>
      )}
      <div className={`relative h-[min(90dvh,640px)] ${COVER_SIZE}`}>
        {/* erste Seite hinter dem Deckel */}
        <div className="page absolute inset-0 flex flex-col items-center justify-center rounded-r-[1.4rem] text-center">
          <div className="first-page-glow pointer-events-none absolute -inset-16 rounded-full bg-[radial-gradient(circle,rgba(240,217,154,0.55),rgba(143,184,255,0.18)_45%,transparent_70%)]" />
          <p className="rubric relative">Ex Libris</p>
          <p className="gold-foil relative mt-3 px-6 font-display text-3xl font-bold">{name}</p>
          <Flourish className="relative mt-4 h-4 w-36" />
        </div>
        {SPARKS.map(([x, y, d], i) => (
          <span
            key={i}
            className={`spark absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full ${
              forest ? 'rise-firefly' : 'bg-gold-100 shadow-[0_0_10px_3px_rgba(240,217,154,0.8)]'
            }`}
            // im Wald öffnet sich das Buch später, die Glühwürmchen folgen
            style={{ '--x': `${x}px`, '--y': `${y}px`, '--d': `${forest ? d + 0.95 : d}s` } as React.CSSProperties}
          />
        ))}
        {forest &&
          LEAVES.map(([x, y, d], i) => (
            <svg
              key={i}
              viewBox="0 0 16 16"
              className="rise-leaf absolute left-1/2 top-1/2 h-4 w-4"
              style={{ '--x': `${x}px`, '--y': `${y}px`, '--d': `${d}s` } as React.CSSProperties}
            >
              <path d="M8 1C12 4 13 9 8 15C3 9 4 4 8 1Z" fill={i % 2 ? '#8a9a3a' : '#b5652f'} />
            </svg>
          ))}
        {/* Deckel: Vorderseite + Vorsatzpapier auf der Rückseite */}
        <div className="cover-door absolute inset-0">
          <GrimoireCover className="cover-face absolute inset-0" />
          <div className="cover-back endpaper absolute inset-0 rounded-l-[1.4rem] rounded-r-md border border-gold-500/25" />
        </div>
      </div>
      {forest && (
        <>
          <div className="mist mist-l" />
          <div className="mist mist-r" />
        </>
      )}
    </div>
  )
}
