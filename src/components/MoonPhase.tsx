/**
 * Pfad des beleuchteten Mondteils für Anteil f (0–1), zunehmend von rechts.
 * Rechter Rand als Halbkreis, zurück über die Schattengrenze (Ellipse rx = r·|1−2f|).
 */
export function moonPath(f: number, cx: number, cy: number, r: number): string {
  const p = Math.min(1, Math.max(0, f))
  const rx = r * Math.abs(1 - 2 * p)
  const sweep = p > 0.5 ? 1 : 0 // ab Halbmond wölbt sich die Grenze nach links
  return `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}Z`
}

// Lesefortschritt als Mondphase: je mehr gelesen, desto voller der Mond.
export function MoonPhase({ pct, size = 112 }: { pct: number; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`${pct} % gelesen`}>
        <defs>
          <radialGradient id="moon-lit" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#fbf6ea" />
            <stop offset=".6" stopColor="#f0d99a" />
            <stop offset="1" stopColor="#c9a24f" />
          </radialGradient>
          <filter id="moon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r="38" fill="#1a2552" stroke="#d9b25f" strokeOpacity=".35" strokeWidth="1" />
        <path d={moonPath(pct / 100, 50, 50, 38)} fill="#f0d99a" opacity=".55" filter="url(#moon-glow)" />
        <path d={moonPath(pct / 100, 50, 50, 38)} fill="url(#moon-lit)" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#d9b25f" strokeOpacity=".3" strokeDasharray="1 5" />
      </svg>
    </div>
  )
}
