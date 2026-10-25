import { useId } from 'react'

// Logo (Claude-Design-Fassung, siehe docs/logo.md): große Mondsichel, die ein
// aufgeschlagenes Buch umfängt, dazu ein Stern. small: kräftigere Linien, ohne
// Sternpunkte und Textzeilen, für Größen unter ~48 px.
const CRESCENT = 'M31.21 4.01A28 28 0 1 0 59.13 38.92A23.5 23.5 0 1 1 31.21 4.01Z'
const STAR = 'M46 11.6Q46.6 14.4 49.4 15Q46.6 15.6 46 18.4Q45.4 15.6 42.6 15Q45.4 14.4 46 11.6Z'
const BOOK =
  'M37 30.4C33.7 28.7 29.3 28.3 26 29V38C29.3 37.3 33.7 37.8 37 39.6Z' +
  'M37 30.4C40.3 28.7 44.7 28.3 48 29V38C44.7 37.3 40.3 37.8 37 39.6Z' +
  'M37 30.4V39.6'
const LINES =
  'M28 31.6C30.4 31.2 32.8 31.4 35 32.2M28 34C30.4 33.6 32.8 33.8 35 34.6' +
  'M46 31.6C43.6 31.2 41.2 31.4 39 32.2M46 34C43.6 33.6 41.2 33.8 39 34.6'
const BOOK_TRANSFORM = 'translate(37 34.5) scale(1.2) translate(-37 -34.5)'

export function Emblem({ className = 'h-10 w-10', small = false }: { className?: string; small?: boolean }) {
  const gid = `gold-${useId().replace(/:/g, '')}`
  const gold = `url(#${gid})`
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf1d4" />
          <stop offset=".5" stopColor="#d9b25f" />
          <stop offset="1" stopColor="#94702c" />
        </linearGradient>
      </defs>
      <path d={CRESCENT} fill={gold} />
      <path d={STAR} fill="#fbf1d4" />
      {!small && (
        <>
          <circle cx="31" cy="17" r=".6" fill="#f0d99a" />
          <circle cx="53" cy="24" r=".5" fill="#f0d99a" />
          <circle cx="39" cy="20" r=".45" fill="#f0d99a" />
        </>
      )}
      <g transform={BOOK_TRANSFORM} fill="none" stroke={gold} strokeLinejoin="round" strokeLinecap="round">
        <path d={BOOK} strokeWidth={small ? 2.2 : 1.3} />
        {!small && <path d={LINES} strokeWidth={0.7} opacity={0.55} />}
      </g>
    </svg>
  )
}

// Zierlinie: Strich – Raute – Stern – Raute – Strich
export function Flourish({ className = 'h-4 w-40' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 16" className={className} fill="none" aria-hidden="true">
      <path d="M4 8h54M102 8h54" stroke="#d9b25f" strokeOpacity=".55" strokeWidth="1" />
      <path d="M62 8l4-4 4 4-4 4zM90 8l4-4 4 4-4 4z" fill="#d9b25f" fillOpacity=".7" />
      <path d="M80 2l1.6 4.4L86 8l-4.4 1.6L80 14l-1.6-4.4L74 8l4.4-1.6z" fill="#f0d99a" />
    </svg>
  )
}

// Goldene Eckbeschläge für Einband und Tafeln
export function Corners({ inset = 'inset-3', size = 'h-9 w-9' }: { inset?: string; size?: string }) {
  const piece = (
    <svg viewBox="0 0 40 40" className={size} fill="none" aria-hidden="true">
      <path d="M2 22V8a6 6 0 0 1 6-6h14" stroke="#d9b25f" strokeOpacity=".75" strokeWidth="1.5" />
      <path d="M8 16V12a4 4 0 0 1 4-4h4" stroke="#d9b25f" strokeOpacity=".45" strokeWidth="1" />
      <path d="M2 2l5 5" stroke="#f0d99a" strokeOpacity=".7" strokeWidth="1" />
      <circle cx="12.5" cy="12.5" r="1.6" fill="#f0d99a" fillOpacity=".8" />
    </svg>
  )
  return (
    <div className={`pointer-events-none absolute ${inset}`} aria-hidden="true">
      <div className="absolute left-0 top-0">{piece}</div>
      <div className="absolute right-0 top-0 rotate-90">{piece}</div>
      <div className="absolute bottom-0 right-0 rotate-180">{piece}</div>
      <div className="absolute bottom-0 left-0 -rotate-90">{piece}</div>
    </div>
  )
}
