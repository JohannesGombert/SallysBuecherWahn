import { useId } from 'react'

// Rundes Rosenblatt, das vom Ursprung nach oben zeigt; KELCH spitz für Knospe und Kelchblätter
const PETAL = 'M0 0C-9-2-11-12-6-17C-3-19.5 3-19.5 6-17C11-12 9-2 0 0Z'
const KELCH = 'M0 0C-8-3-10-13 0-19C10-13 8-3 0 0Z'

// Blütenkränze von innen nach außen: ab welchem Anteil sie aufgehen, Anzahl, Abstand, Größe, Farbe
const RINGS = [
  { from: 0.05, n: 5, dist: 5, size: 0.75, color: '#d27c97', turn: 0 },
  { from: 0.3, n: 5, dist: 9, size: 0.95, color: '#e290aa', turn: 36 },
  { from: 0.55, n: 6, dist: 13, size: 1.12, color: '#eba3b8', turn: 15 },
  { from: 0.78, n: 7, dist: 16, size: 1.28, color: '#f3bccb', turn: 0 },
]

const clamp = (v: number) => Math.min(1, Math.max(0, v))

/** Wie viel ein Kranz bei Anteil f (0–1) geöffnet ist; der letzte Kranz ist bei 100 % ganz offen. */
export const ringOpen = (f: number, from: number) => clamp((f - from) / (1 - from) / 0.6)

/** Lesefortschritt als Rose (Teesalon): Knospe bei 0 %, voll erblüht bei 100 %. */
export function RoseBloom({ pct, size = 112 }: { pct: number; size?: number }) {
  const id = useId().replace(/:/g, '')
  const f = clamp(pct / 100)
  const cx = 50
  const cy = 44
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`${pct} % gelesen`}>
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="#fff1d6" stopOpacity=".9" />
            <stop offset="1" stopColor="#fff1d6" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Sonnenschein hinter der Blüte, wächst mit dem Fortschritt */}
        <circle cx={cx} cy={cy} r={18 + 22 * f} fill={`url(#${id}-glow)`} opacity={0.4 + 0.6 * f} />
        {/* Stiel und Blätter */}
        <path d="M50 56C49 68 52 80 50 96" fill="none" stroke="#6f9a6c" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M50 74C40 66 32 70 30 76C38 80 45 79 50 74Z" fill="#7fae7a" />
        <path d="M51 84C60 76 69 79 71 85C63 89 56 88 51 84Z" fill="#8fbb88" />
        {/* Kelchblätter */}
        {[-40, 0, 40].map((a) => (
          <path key={a} d={KELCH} transform={`translate(${cx} ${cy + 10}) rotate(${180 + a}) scale(.45 .55)`} fill="#7fae7a" />
        ))}
        {/* äußere Kränze zuerst, damit die inneren davor liegen */}
        {[...RINGS].reverse().map((r, ri) => {
          const o = ringOpen(f, r.from)
          if (o <= 0) return null
          return (
            <g key={ri} opacity={0.35 + 0.65 * o}>
              {Array.from({ length: r.n }, (_, i) => {
                const a = r.turn + (360 / r.n) * i
                return (
                  <path
                    key={i}
                    d={PETAL}
                    transform={`translate(${cx} ${cy}) rotate(${a}) translate(0 ${-r.dist * o}) scale(${r.size * (0.35 + 0.65 * o)})`}
                    fill={r.color}
                    stroke="#b5557a"
                    strokeOpacity=".35"
                    strokeWidth=".6"
                  />
                )
              })}
            </g>
          )
        })}
        {/* geschlossene Knospe; sie weicht ab 60 % dem eingerollten Herz der offenen Rose */}
        <circle cx={cx} cy={cy} r={6 * clamp((f - 0.45) / 0.4)} fill="#c2607f" stroke="#8e3a5a" strokeOpacity=".4" strokeWidth=".6" />
        {[-22, 22, 0].map((a) => (
          <path
            key={a}
            opacity={1 - clamp((f - 0.6) / 0.3)}
            d={KELCH}
            transform={`translate(${cx} ${cy + 8}) rotate(${a * (1 + f)}) scale(${0.55 - 0.15 * f} ${0.7 - 0.25 * f})`}
            fill="#c2607f"
            stroke="#8e3a5a"
            strokeOpacity=".4"
            strokeWidth=".6"
          />
        ))}
        {f >= 0.9 && (
          <path d="M50 41.5c2.2 0 3.3 1.7 2.7 3.3s-2.8 2.2-4 1.1-1.1-3.3.8-4.1" fill="none" stroke="#7a3149" strokeWidth=".9" strokeLinecap="round" />
        )}
        {f >= 1 &&
          [[24, 22], [78, 20], [82, 52], [20, 50]].map(([x, y]) => (
            <path key={x} d={`M${x} ${y - 3}l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z`} fill="#e2a776" />
          ))}
      </svg>
    </div>
  )
}
