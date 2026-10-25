import { useId } from 'react'

// Wappen des Grimoires: Mondsichel, die ein aufgeschlagenes Buch umfängt.
export function Emblem({ className = 'h-10 w-10' }: { className?: string }) {
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
      <path d="M40 7a25 25 0 1 0 16 44.5A20.5 20.5 0 1 1 40 7z" fill={`url(#${g})`} />
      <g fill="none" stroke={`url(#${g})`} strokeWidth="2" strokeLinejoin="round">
        <path d="M18 42c4.5-2.4 9-2.4 13.5 0 4.5-2.4 9-2.4 13.5 0V29c-4.5-2.4-9-2.4-13.5 0-4.5-2.4-9-2.4-13.5 0z" />
        <path d="M31.5 29v13" />
      </g>
      <path d="M47 12l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" fill="#fbf1d4" />
      <circle cx="54" cy="25" r="1.2" fill="#f0d99a" />
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
