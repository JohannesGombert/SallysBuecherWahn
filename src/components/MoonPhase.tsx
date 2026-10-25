import { useId } from 'react'

/**
 * Pfad des beleuchteten Mondteils für Anteil f (0–1), zunehmend von rechts.
 * Rechter Rand als Halbkreis, zurück über die Schattengrenze (Ellipse rx = r·|1−2f|).
 */
function moonPath(f: number, cx: number, cy: number, r: number): string {
  const p = Math.min(1, Math.max(0, f))
  const rx = r * Math.abs(1 - 2 * p)
  const sweep = p > 0.5 ? 1 : 0 // ab Halbmond wölbt sich die Grenze nach links
  return `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}Z`
}

// Mondmeere der Vorderseite (grob nach echter Lage, Norden oben): [cx, cy, rx, ry, Drehung]
const MARIA: [number, number, number, number, number][] = [
  [27, 52, 10, 17, 12], // Oceanus Procellarum
  [39, 34, 9, 7, -10], // Mare Imbrium
  [47, 25, 14, 2.6, -4], // Mare Frigoris
  [58, 37, 5.5, 5, 0], // Mare Serenitatis
  [64, 48, 7.5, 6, 18], // Mare Tranquillitatis
  [78, 40, 3.6, 3, 0], // Mare Crisium
  [72, 58, 4, 6, -12], // Mare Fecunditatis
  [64, 60, 3, 3, 0], // Mare Nectaris
  [44, 64, 6, 4.5, 10], // Mare Nubium
  [33, 68, 4, 3, 0], // Mare Humorum
]

// Krater: [cx, cy, r]
const CRATERS: [number, number, number][] = [
  [47, 80, 1.8], // Tycho
  [36, 44, 1.6], // Kopernikus
  [24, 44, 1.1], // Kepler
  [30, 30, 1.2], // Plato
  [70, 70, 1.4],
  [56, 72, 1.1],
  [60, 25, 0.9],
  [80, 54, 1],
  [40, 76, 1.2],
  [52, 52, 0.8],
]

// Lesefortschritt als Mondphase: je mehr gelesen, desto voller der Mond.
export function MoonPhase({ pct, size = 112 }: { pct: number; size?: number }) {
  const id = useId().replace(/:/g, '')
  const lit = moonPath(pct / 100, 50, 50, 38)

  const surface = (
    <g clipPath={`url(#${id}-disk)`}>
      <circle cx="50" cy="50" r="38" fill={`url(#${id}-base)`} />
      <g fill="#6f6a5d" opacity=".7" filter={`url(#${id}-soft)`}>
        {MARIA.map(([cx, cy, rx, ry, rot], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} />
        ))}
      </g>
      {/* Strahlen von Tycho */}
      <g stroke="#f7f3e8" strokeOpacity=".25" strokeWidth=".5">
        {[0, 40, 80, 130, 200, 250, 300].map((a) => (
          <line key={a} x1="47" y1="80" x2={47 + Math.cos((a * Math.PI) / 180) * 16} y2={80 + Math.sin((a * Math.PI) / 180) * 16} />
        ))}
      </g>
      {CRATERS.map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#9d978a" opacity=".6" />
          <circle cx={cx + r * 0.25} cy={cy + r * 0.25} r={r * 0.7} fill="#fbf8f0" opacity=".45" />
        </g>
      ))}
      <rect x="10" y="10" width="80" height="80" filter={`url(#${id}-grain)`} opacity=".35" style={{ mixBlendMode: 'multiply' }} />
      <circle cx="50" cy="50" r="38" fill={`url(#${id}-limb)`} />
    </g>
  )

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`${pct} % gelesen`}>
        <defs>
          <clipPath id={`${id}-disk`}>
            <circle cx="50" cy="50" r="38" />
          </clipPath>
          <radialGradient id={`${id}-base`} cx="42%" cy="40%" r="65%">
            <stop offset="0" stopColor="#f7f4ec" />
            <stop offset=".6" stopColor="#dcd6c8" />
            <stop offset="1" stopColor="#b9b2a2" />
          </radialGradient>
          {/* Randverdunkelung zum Mondrand hin */}
          <radialGradient id={`${id}-limb`} cx="50%" cy="50%" r="50%">
            <stop offset=".7" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".35" />
          </radialGradient>
          <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <filter id={`${id}-grain`}>
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="3" seed="7" />
            <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .43  0 0 0 0 .38  0 0 0 .9 0" />
          </filter>
          {/* weiche Schattengrenze statt harter Kante */}
          <filter id={`${id}-terminator`}>
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
          <mask id={`${id}-lit`}>
            <path d={lit} fill="#fff" filter={`url(#${id}-terminator)`} />
          </mask>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Lichthof */}
        <path d={lit} fill="#f3ecd8" opacity=".45" filter={`url(#${id}-glow)`} />
        {/* Nachtseite: schwach im Erdschein sichtbar */}
        <circle cx="50" cy="50" r="38" fill="#0e1430" />
        <g opacity=".07">{surface}</g>
        {/* beleuchtete Seite */}
        <g mask={`url(#${id}-lit)`}>{surface}</g>
      </svg>
    </div>
  )
}
