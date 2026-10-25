import { useId } from 'react'

// Siegel des Grimoires (Logo, siehe docs/logo.md): doppelter Goldring mit vier Rauten,
// darin eine frei schwebende Mondsichel mit Stern über einem aufgeschlagenen Buch.
// small: kräftigere Linien ohne Feinheiten, für Größen unter ~48 px.
export function Emblem({ className = 'h-10 w-10', small = false }: { className?: string; small?: boolean }) {
  const id = useId()
  const g = `gold-${id}`
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf1d4" />
          <stop offset=".5" stopColor="#d9b25f" />
          <stop offset="1" stopColor="#94702c" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke={`url(#${g})`} strokeWidth={small ? 2.6 : 1.4} />
      {!small && (
        <>
          <circle cx="32" cy="32" r="25.6" fill="none" stroke="#d9b25f" strokeWidth=".6" opacity=".6" />
          <path
            d="M32 1.6l1.4 1.4-1.4 1.4-1.4-1.4zM32 59.6l1.4 1.4-1.4 1.4-1.4-1.4zM1.6 32l1.4-1.4 1.4 1.4-1.4 1.4zM59.6 32l1.4-1.4 1.4 1.4-1.4 1.4z"
            fill="#f0d99a"
          />
        </>
      )}
      <g transform="translate(32 33) scale(.66) translate(-32 -31)">
        <path d="M33.5 9.5a10 10 0 1 0 8.2 15.9 8 8 0 1 1-8.2-15.9z" fill={`url(#${g})`} />
        <path d="M46 7.5l1.1 3.1 3.1 1.1-3.1 1.1L46 15.9l-1.1-3.1-3.1-1.1 3.1-1.1z" fill="#fbf1d4" />
        <g fill="none" stroke={`url(#${g})`} strokeWidth={small ? 3.6 : 2.4} strokeLinejoin="round" strokeLinecap="round">
          <path d="M32 52c-6-3.2-13.5-3.8-22-2V34c8.5-1.8 16-1.2 22 2 6-3.2 13.5-3.8 22-2v16c-8.5-1.8-16-1.2-22 2z" />
          <path d="M32 36v16" />
          {!small && (
            <path
              d="M15 39.5c4.5-.8 8.5-.4 12 1M15 44c4.5-.8 8.5-.4 12 1M37 40.5c3.5-1.4 7.5-1.8 12-1M37 45c3.5-1.4 7.5-1.8 12-1"
              strokeWidth="1.3"
              opacity=".55"
            />
          )}
        </g>
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
