import { useId } from 'react'

// Lesefortschritt als Rose in Seitenansicht (Teesalon), angelehnt an ein Rosenfoto:
// schlanker Stiel, gezähnte Fiederblätter, Kelchblätter, die erst die Knospe umfassen und
// sich beim Aufblühen zurückbiegen, und Blütenblätter mit Farbverlauf, die sich nach außen öffnen.

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Wie weit ein Teil bei Anteil f (0–1) geöffnet ist: beginnt bei `from`, ist bei `to` ganz offen. */
export const openAt = (f: number, from: number, to = 1) => clamp((f - from) / (to - from))

// Blütenblatt von der Seite: Ansatz bei (0,0), oben gerundeter Rand
const PETAL = 'M0 0C-9-2-13-14-10-22C-8-27-3-29 0-28C4-29 9-27 11-22C13-14 9-2 0 0Z'
// Kelchblatt: schmal und spitz
const SEPAL = 'M0 0C-2.2-5-2-13-.3-22C1.4-13 2.2-5 0 0Z'

/** Gezähntes Fiederblättchen von (0,0) bis zur Spitze (0,-len). */
function leaflet(len: number, wid: number, teeth = 8) {
  const right: string[] = []
  for (let i = 1; i < teeth * 2; i++) {
    const t = i / (teeth * 2)
    const w = wid * Math.sin(Math.PI * Math.pow(t, 0.85))
    // abwechselnd Zahnspitze (leicht zur Blattspitze geneigt) und Einkerbung
    const tip = i % 2 === 1
    right.push(`${(w * (tip ? 1 : 0.85)).toFixed(2)} ${(-len * t - (tip ? len * 0.015 : 0)).toFixed(2)}`)
  }
  const left = right.map((p) => p.split(' ')).map(([x, y]) => `${-Number(x)} ${y}`).reverse()
  return `M0 0L${right.join('L')}L0 ${-len}L${left.join('L')}Z`
}
const LEAFLET_BIG = leaflet(17, 6.2)
const LEAFLET_SMALL = leaflet(12, 4.6, 7)

// Blätter der Blüte: [Winkel zu, Winkel offen, Breite zu, Breite offen, Höhe zu, Höhe offen, öffnet ab, vorn?, Farbton]
// Geschlossen schmal und hoch (kegelförmige Knospe); offen breit, die vorderen neigen sich zum
// Betrachter (kürzer), damit man ins Herz der Rose sieht.
type Petal = [number, number, number, number, number, number, number, boolean, 'tief' | 'mittel' | 'hell']
const PETALS: Petal[] = [
  // hintere Reihe (hinter dem Kern)
  [-10, -70, 0.6, 1.15, 0.95, 1, 0.5, false, 'hell'],
  [10, 70, 0.6, 1.15, 0.95, 1, 0.5, false, 'hell'],
  [-7, -42, 0.62, 1.05, 0.98, 1.02, 0.25, false, 'mittel'],
  [7, 42, 0.62, 1.05, 0.98, 1.02, 0.25, false, 'mittel'],
  // Kern: fest eingerollt
  [-4, -10, 0.55, 0.7, 1, 0.85, 0.5, false, 'tief'],
  [4, 10, 0.55, 0.7, 1, 0.85, 0.5, false, 'tief'],
  // vordere Reihe (vor dem Kern)
  [-4, -34, 0.6, 1, 0.95, 0.7, 0.15, true, 'mittel'],
  [4, 34, 0.6, 1, 0.95, 0.7, 0.15, true, 'mittel'],
  [-2, -62, 0.62, 1.1, 0.95, 0.62, 0.6, true, 'hell'],
  [2, 62, 0.62, 1.1, 0.95, 0.62, 0.6, true, 'hell'],
]

export function RoseBloom({ pct, size = 112 }: { pct: number; size?: number }) {
  const id = useId().replace(/:/g, '')
  const f = clamp(pct / 100)
  const bx = 50 // Blütenansatz
  const by = 50

  const petal = ([a0, a1, x0, x1, y0, y1, from, , tone]: Petal, i: number) => {
    const o = openAt(f, from, Math.min(1, from + 0.45))
    return (
      <path
        key={i}
        d={PETAL}
        transform={`translate(${bx} ${by}) rotate(${lerp(a0, a1, o)}) scale(${lerp(x0, x1, o)} ${lerp(y0, y1, o)})`}
        fill={`url(#${id}-${tone})`}
        stroke="#a8466c"
        strokeOpacity=".28"
        strokeWidth=".5"
      />
    )
  }
  const cup = openAt(f, 0.45)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`${pct} % gelesen`}>
        <defs>
          {/* Blütenblätter: dunkler am Ansatz, hell zum Rand */}
          {(
            [
              ['tief', '#b94a72', '#e48aa6', '#f6c3d2'],
              ['mittel', '#c95c84', '#eda4ba', '#fbdbe4'],
              ['hell', '#d4729a', '#f3bccb', '#fdebf0'],
            ] as const
          ).map(([name, a, b, c]) => (
            <linearGradient key={name} id={`${id}-${name}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor={a} />
              <stop offset=".55" stopColor={b} />
              <stop offset="1" stopColor={c} />
            </linearGradient>
          ))}
          <linearGradient id={`${id}-leaf`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#245a30" />
            <stop offset="1" stopColor="#4d8c45" />
          </linearGradient>
          <linearGradient id={`${id}-stem`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7fb06f" />
            <stop offset=".5" stopColor="#a9cf96" />
            <stop offset="1" stopColor="#6e9f61" />
          </linearGradient>
          <radialGradient id={`${id}-heart`}>
            <stop offset="0" stopColor="#9e3b62" />
            <stop offset=".6" stopColor="#c95c84" />
            <stop offset="1" stopColor="#eda4ba" />
          </radialGradient>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="#fff1d6" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff1d6" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#7a3149" floodOpacity=".18" />
          </filter>
        </defs>

        {/* warmer Schein hinter der Blüte, wächst mit dem Fortschritt */}
        <circle cx={bx} cy={by - 14} r={14 + 22 * f} fill={`url(#${id}-glow)`} opacity={0.35 + 0.65 * f} />

        <g filter={`url(#${id}-soft)`}>
          {/* Stiel */}
          <path d="M51.5 99C52.5 86 49 70 50.2 53" fill="none" stroke={`url(#${id}-stem)`} strokeWidth="2.2" strokeLinecap="round" />
          {/* Fiederblatt links: Stielchen, Endblättchen und zwei seitliche */}
          <g transform="translate(50.4 66) rotate(-62)">
            <path d="M0 0L0-16" stroke="#5f9655" strokeWidth=".8" />
            <g fill={`url(#${id}-leaf)`}>
              <path d={LEAFLET_BIG} transform="translate(0 -15)" />
              <path d={LEAFLET_SMALL} transform="translate(0 -6) rotate(-48)" />
              <path d={LEAFLET_SMALL} transform="translate(0 -9) rotate(52)" />
            </g>
            <g stroke="#a7cf98" strokeOpacity=".55" strokeWidth=".35">
              <path d="M0-15V-31" />
              <path d="M0-6l-8.9-8" />
              <path d="M0-9l9.4-7.4" />
            </g>
          </g>
          {/* Fiederblatt rechts, tiefer am Stiel */}
          <g transform="translate(51 76) rotate(68)">
            <path d="M0 0L0-14" stroke="#5f9655" strokeWidth=".8" />
            <g fill={`url(#${id}-leaf)`}>
              <path d={LEAFLET_BIG} transform="translate(0 -13) scale(.95)" />
              <path d={LEAFLET_SMALL} transform="translate(0 -5) rotate(50)" />
            </g>
            <g stroke="#a7cf98" strokeOpacity=".55" strokeWidth=".35">
              <path d="M0-13V-28" />
              <path d="M0-5l9-7.6" />
            </g>
          </g>

          {/* Kelchblätter hinten: umfassen die Knospe, biegen sich beim Aufblühen zurück */}
          {[-1, 1].map((s) => (
            <path key={s} d={SEPAL} transform={`translate(${bx} ${by + 1}) rotate(${s * lerp(24, 140, openAt(f, 0.1, 0.7))}) scale(.95)`} fill="#4f8a46" />
          ))}

          {/* Blüte: hintere Blätter, Kern, vordere Blätter */}
          {PETALS.filter((p) => !p[7]).map(petal)}
          {/* Blick in die geöffnete Blüte: dunkleres Herz mit eingerollter Mitte */}
          {cup > 0 && (
            <g opacity={cup}>
              <ellipse cx={bx} cy={by - 17} rx={3 + 8 * cup} ry={1.4 + 3 * cup} fill={`url(#${id}-heart)`} />
              {/* eingerollte innere Blätter */}
              <g fill="none" stroke="#a8466c" strokeOpacity=".55" strokeWidth=".5" strokeLinecap="round">
                <path d={`M${bx - 5 * cup} ${by - 16.5}q${5 * cup} ${-2.6 * cup} ${10 * cup} 0`} />
                <path d={`M${bx - 2.6} ${by - 17.2}c1.4-1.3 4-1 4.2.4s-2.2 1.8-3.4.9`} />
              </g>
            </g>
          )}
          {PETALS.filter((p) => p[7]).map(petal)}
          {/* Knospe: eine Blattkante wickelt sich sichtbar um den Kern */}
          {f < 0.5 && (
            <path
              d={`M${bx - 5} ${by - 6}C${bx - 3} ${by - 16} ${bx + 3} ${by - 21} ${bx + 5.5} ${by - 25}`}
              fill="none"
              stroke="#b94a72"
              strokeOpacity={0.5 * (1 - f * 2)}
              strokeWidth=".6"
              strokeLinecap="round"
            />
          )}

          {/* Kelchblätter vorn und Blütenboden */}
          {[-1, 1].map((s) => (
            <path key={s} d={SEPAL} transform={`translate(${bx} ${by + 1.5}) rotate(${s * lerp(10, 115, openAt(f, 0.1, 0.7))}) scale(.85)`} fill="#5d9a52" />
          ))}
          <ellipse cx={bx} cy={by + 1.6} rx="3.4" ry="2.6" fill="#6aa35c" />
        </g>

        {f >= 1 &&
          [[26, 18], [76, 16], [80, 44], [22, 42]].map(([x, y]) => (
            <path key={x} d={`M${x} ${y - 3}l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z`} fill="#e2a776" />
          ))}
      </svg>
    </div>
  )
}
