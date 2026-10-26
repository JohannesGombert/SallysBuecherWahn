import { memo, useEffect, useRef, useState } from 'react'

// Rosengarten des Teesalons als eine ganzseitige Szene (viewBox 1600×1000, unten verankert):
// ferne Hügel, Bäume, eine alte Linde links, eine Buchshecke mit Rosen und Rosenbüsche.
// Vögel und Eichhörnchen kommen ab und zu vorbei, lassen sich nieder und ziehen weiter.

const W = 1600
const rand = (a: number, b: number) => a + Math.random() * (b - a)

// fester Zufall, damit Hecke und Rosen bei jedem Aufruf gleich aussehen
function seeded(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

/** Wellige Oberkante (Hecke, Hügel) von links nach rechts, unten geschlossen. */
function ridge(y: number, amp: number, step: number, seed: number, bottom = 1000) {
  const r = seeded(seed)
  let d = `M-60 ${bottom}V${y}`
  for (let x = -60; x < W + 60; x += step) {
    const h = y - amp * (0.5 + r() * 0.8)
    d += `Q${x + step / 2} ${h} ${x + step} ${y + (r() - 0.5) * amp * 0.4}`
  }
  return d + `V${bottom}Z`
}

// Rosen in der Hecke und den Büschen: [x, y, Größe]
function scatter(n: number, x0: number, x1: number, y0: number, y1: number, s0: number, s1: number, seed: number) {
  const r = seeded(seed)
  return Array.from({ length: n }, () => [x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), s0 + r() * (s1 - s0)] as const)
}
const HEDGE_ROSES = scatter(30, -20, W + 20, 790, 900, 7, 11, 11)
const BUSH_ROSES_L = scatter(11, 20, 420, 840, 960, 11, 17, 23)
const BUSH_ROSES_R = scatter(11, 1180, 1590, 840, 960, 11, 17, 37)

// Laubkanten aus vielen kleinen Kreisen: [x, y, r]
function edge(x0: number, x1: number, y: (x: number) => number, step: number, r0: number, r1: number, seed: number) {
  const r = seeded(seed)
  const out: [number, number, number][] = []
  for (let x = x0; x <= x1; x += step * (0.7 + r() * 0.6)) out.push([x, y(x) + (r() - 0.5) * 10, r0 + r() * (r1 - r0)])
  return out
}
const HEDGE_EDGE = edge(-40, W + 40, () => 792, 15, 10, 19, 5)
// Bogen über einem Busch: Mitte, halbe Breite, Höhe
const dome = (cx: number, hw: number, top: number) => (x: number) => 1000 - (1000 - top) * Math.sqrt(Math.max(0, 1 - ((x - cx) / hw) ** 2))
const BUSH_EDGE_L = edge(-30, 450, dome(200, 260, 800), 18, 14, 26, 8)
const BUSH_EDGE_R = edge(1150, 1630, dome(1400, 260, 795), 18, 14, 26, 9)

// Krone der Linde: viele überlappende Laubballen
const CROWN = (() => {
  const r = seeded(17)
  const out: [number, number, number, number][] = []
  // tief genug, dass breite Bildschirme (die oben abschneiden) die Krone ganz zeigen
  for (const [cx, cy, R] of [
    [170, 480, 95],
    [282, 450, 105],
    [372, 505, 75],
    [96, 540, 65],
  ]) {
    for (let i = 0; i < 60; i++) {
      const a = r() * Math.PI * 2
      const d = Math.sqrt(r()) * R * 0.85
      out.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * (0.12 + r() * 0.13), r() < 0.35 ? 1 : 0])
    }
  }
  // untere Ballen zuerst, damit oben die sonnigen liegen
  return out.sort((a, b) => b[1] - a[1])
})()

// Bäume auf den Hügeln: [x, y, Größe, Pappel?]
const HILL_TREES: [number, number, number, boolean][] = [
  [470, 640, 26, false], [520, 646, 18, false], [700, 628, 14, true], [880, 636, 22, false],
  [1060, 618, 16, true], [1090, 624, 14, true], [1250, 640, 28, false], [1310, 646, 20, false], [1460, 630, 16, true],
]

// Landeplätze in Szenen-Koordinaten (Ast der Linde, Rosenbüsche, Heckenkrone)
const PERCH_BIRD = [
  [300, 548],
  [196, 806],
  [1402, 800],
  [470, 770],
  [1140, 772],
] as const
const PERCH_SQUIRREL = [
  [250, 820],
  [1360, 815],
  [430, 780],
  [1180, 782],
] as const

export function RoseGarden({ animals = true }: { animals?: boolean }) {
  return (
    <>
      <Scene />
      {/* Dampf über Kanne und Tasse – als eigene kleine Elemente, die Szene bleibt unbewegt */}
      {[
        [...onTable(1088, 818), 0],
        [...onTable(1112, 846), -1.6],
      ].map(([x, y, d]) => (
        <span key={x} className="tea-steam" style={{ '--x': x, '--y': y, '--d': `${d}s` } as React.CSSProperties}>
          <svg viewBox="0 0 20 60" fill="none">
            <path d="M10 60C4 48 16 40 10 28S6 10 12 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      ))}
      {/* Tiere in eigener Ebene: sonst müsste der Browser die teuren Laubfilter bei jedem Bild neu rechnen */}
      {animals && <Critters />}
    </>
  )
}

// unbewegte Szene, eigene Grafikebene (will-change), damit sie nur einmal gezeichnet wird
const Scene = memo(function Scene() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      style={{ willChange: 'transform' }}
      viewBox={`0 0 ${W} 1000`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rg-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9e3d6" />
          <stop offset="1" stopColor="#e9ede0" />
        </linearGradient>
        <linearGradient id="rg-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9cfac" />
          <stop offset="1" stopColor="#d3dfc3" />
        </linearGradient>
        <linearGradient id="rg-hedge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ea86d" />
          <stop offset=".35" stopColor="#5b8a4f" />
          <stop offset="1" stopColor="#3e6a3a" />
        </linearGradient>
        <linearGradient id="rg-bush" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f9b5f" />
          <stop offset="1" stopColor="#355f33" />
        </linearGradient>
        <radialGradient id="rg-crown" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#9cc184" />
          <stop offset=".6" stopColor="#6d9a5c" />
          <stop offset="1" stopColor="#4c7a43" />
        </radialGradient>
        <radialGradient id="rg-crown-dark" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#7aa267" />
          <stop offset="1" stopColor="#3f6b39" />
        </radialGradient>
        <radialGradient id="rg-farcrown" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#b7cca6" />
          <stop offset="1" stopColor="#93ad84" />
        </radialGradient>
        <linearGradient id="rg-bark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b5446" />
          <stop offset=".5" stopColor="#8a6f5c" />
          <stop offset="1" stopColor="#5a4539" />
        </linearGradient>
        <radialGradient id="rg-rose-out" cx="45%" cy="40%">
          <stop offset="0" stopColor="#fbe0e8" />
          <stop offset="1" stopColor="#d97a9b" />
        </radialGradient>
        <radialGradient id="rg-rose-in" cx="45%" cy="40%">
          <stop offset="0" stopColor="#f3b4c7" />
          <stop offset="1" stopColor="#b94a72" />
        </radialGradient>
        {/* Blattstruktur als kleines Kachelmuster (SVG-Rauschfilter wären auf ganzer Bildschirmfläche viel zu langsam) */}
        <pattern id="rg-leaves" width="38" height="30" patternUnits="userSpaceOnUse">
          <ellipse cx="6" cy="6" rx="5" ry="2.6" transform="rotate(-30 6 6)" fill="#2f5a2c" opacity=".55" />
          <ellipse cx="22" cy="10" rx="5.5" ry="2.8" transform="rotate(25 22 10)" fill="#a9cf8f" opacity=".45" />
          <ellipse cx="32" cy="22" rx="5" ry="2.5" transform="rotate(-55 32 22)" fill="#2f5a2c" opacity=".5" />
          <ellipse cx="12" cy="22" rx="4.5" ry="2.4" transform="rotate(40 12 22)" fill="#9cc382" opacity=".4" />
          <ellipse cx="27" cy="2" rx="4" ry="2" transform="rotate(-10 27 2)" fill="#3d6b38" opacity=".5" />
        </pattern>
        <symbol id="rg-rose" viewBox="-10 -10 20 20" overflow="visible">
          <circle r="9" fill="url(#rg-rose-out)" />
          <circle r="6" fill="url(#rg-rose-in)" />
          <path d="M-2.6-.6c1-2.4 5-2 5 .4s-3.6 3.4-5 1.4" fill="none" stroke="#8e3a5a" strokeWidth="1" strokeLinecap="round" opacity=".7" />
        </symbol>
      </defs>

      {/* ferne Hügel im Dunst */}
      <path d={ridge(600, 70, 260, 3)} fill="url(#rg-far)" />
      {/* Bäume auf den Hügeln */}
      {HILL_TREES.map(([x, y, s, poplar], i) =>
        poplar ? (
          <ellipse key={i} cx={x} cy={y - s * 1.4} rx={s * 0.45} ry={s * 1.7} fill="url(#rg-farcrown)" />
        ) : (
          <g key={i}>
            <rect x={x - 2} y={y - 6} width="4" height="10" fill="#8f8a74" />
            <circle cx={x} cy={y - s * 0.7} r={s} fill="url(#rg-farcrown)" />
          </g>
        ),
      )}
      <path d={ridge(660, 50, 200, 7)} fill="url(#rg-mid)" />

      {/* alte Linde links: Stamm, Äste, Krone */}
      <g>
        <path d="M222 800C228 720 220 640 234 590C238 570 232 556 220 545L240 540C250 552 258 566 260 580C272 560 290 548 314 542L318 556C296 562 282 576 278 598C272 650 284 720 292 800Z" fill="url(#rg-bark)" />
        {CROWN.map(([x, y, r, dark], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={dark ? 'url(#rg-crown-dark)' : 'url(#rg-crown)'} />
        ))}
      </g>

      {/* Buchshecke mit Rosen */}
      <path d={ridge(800, 16, 70, 13)} fill="url(#rg-hedge)" />
      {HEDGE_EDGE.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="url(#rg-hedge)" />
      ))}
      <path d={ridge(806, 14, 70, 13)} fill="url(#rg-leaves)" opacity=".4" />
      {HEDGE_ROSES.map(([x, y, s], i) => (
        <use key={i} href="#rg-rose" x={x - s} y={y - s} width={s * 2} height={s * 2} />
      ))}

      {/* Rosenbüsche links und rechts vorn */}
      {(
        [
          ['M-40 1000V860C20 790 110 790 170 820C230 780 330 790 380 830C430 860 450 930 460 1000Z', BUSH_ROSES_L],
          ['M1640 1000V850C1580 790 1490 790 1430 815C1370 780 1270 790 1220 830C1170 860 1150 930 1140 1000Z', BUSH_ROSES_R],
        ] as const
      ).map(([d, roses], k) => (
        <g key={k}>
          <path d={d} fill="url(#rg-bush)" />
          {(k === 0 ? BUSH_EDGE_L : BUSH_EDGE_R).map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="url(#rg-bush)" />
          ))}
          <path d={d} fill="url(#rg-leaves)" opacity=".4" />
          {roses.map(([x, y, s], i) => (
            <use key={i} href="#rg-rose" x={x - s} y={y - s} width={s * 2} height={s * 2} />
          ))}
        </g>
      ))}

      <g transform={TABLE_TRANSFORM}>
        <TeaTable />
      </g>
    </svg>
  )
})

// Bistrotisch mit Spitzendecke, Teekanne und Tasse (rechts neben dem Buch, auf dem Desktop sichtbar)
// gezeichnet um (1070, 966); verschoben und vergrößert, damit er auf dem Desktop neben dem Buch steht
const TABLE_SHIFT = 140
const TABLE_SCALE = 1.35
const TABLE_TRANSFORM = `translate(1070 966) scale(${TABLE_SCALE}) translate(-1070 -966) translate(${TABLE_SHIFT} 0)`
// Punkt der Tischzeichnung → Szenen-Koordinate (für den Dampf über Kanne und Tasse)
const onTable = (x: number, y: number) => [1070 + (x + TABLE_SHIFT - 1070) * TABLE_SCALE, 966 + (y - 966) * TABLE_SCALE] as const
const LACE = Array.from({ length: 15 }, (_, i) => 1000 + i * 10)

function TeaTable() {
  return (
    <g>
      <defs>
        <linearGradient id="rg-iron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9d2c6" />
          <stop offset=".5" stopColor="#fbf7f0" />
          <stop offset="1" stopColor="#cfc6b8" />
        </linearGradient>
        <radialGradient id="rg-china" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#f3ece6" />
          <stop offset="1" stopColor="#d8cbc3" />
        </radialGradient>
      </defs>
      {/* Schatten auf dem Rasen */}
      <ellipse cx="1070" cy="968" rx="80" ry="10" fill="#2f5a2c" opacity=".3" />
      {/* Fuß: Säule mit geschwungenen Füßen */}
      <path d="M1064 868V948M1076 868V948" stroke="url(#rg-iron)" strokeWidth="6" />
      <path d="M1070 940C1050 944 1036 952 1026 966M1070 940C1090 944 1104 952 1114 966M1070 944V966" fill="none" stroke="#e6dfd4" strokeWidth="5" strokeLinecap="round" />
      {/* Tischplatte mit Spitzendecke */}
      <ellipse cx="1070" cy="862" rx="74" ry="15" fill="#efe6dc" />
      <path d={`M996 862${LACE.map((x) => `Q${x + 5} ${878} ${x + 10} 870`).join('')}L1144 862Z`} fill="#fffaf6" stroke="#e7d9cf" strokeWidth="1" />
      <ellipse cx="1070" cy="858" rx="74" ry="14" fill="#fffaf6" stroke="#eadcd2" strokeWidth="1" />
      {/* Teekanne: Porzellan mit Rosenmuster */}
      <g transform="translate(1052 842)">
        <ellipse cx="0" cy="14" rx="18" ry="3.5" fill="#d8cbc3" />
        <path d="M17-6C28-8 32-20 38-24C36-16 32-2 16 4Z" fill="url(#rg-china)" stroke="#d8cbc3" strokeWidth=".8" />
        <path d="M-17-8C-30-10-31 8-18 6" fill="none" stroke="#e9e1da" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="0" cy="0" rx="19" ry="15" fill="url(#rg-china)" stroke="#d8cbc3" strokeWidth=".8" />
        <ellipse cx="0" cy="-13" rx="11" ry="3.5" fill="#efe6dc" stroke="#d8cbc3" strokeWidth=".8" />
        <circle cx="0" cy="-18" r="3" fill="url(#rg-china)" stroke="#d8cbc3" strokeWidth=".8" />
        <path d="M-17 1Q0 6 17 1" fill="none" stroke="#d4a14f" strokeWidth="1.2" opacity=".8" />
        <use href="#rg-rose" x="-6" y="-7" width="12" height="12" />
        <use href="#rg-rose" x="-13" y="-3" width="7" height="7" />
        <use href="#rg-rose" x="6" y="-3" width="7" height="7" />
      </g>
      {/* Tasse auf Untertasse */}
      <g transform="translate(1112 852)">
        <ellipse cx="0" cy="5" rx="14" ry="3.6" fill="url(#rg-china)" stroke="#d8cbc3" strokeWidth=".8" />
        <path d="M-9-6H9C9 2 5 5 0 5S-9 2-9-6Z" fill="url(#rg-china)" stroke="#d8cbc3" strokeWidth=".8" />
        <path d="M9-3C14-4 14 2 8 2" fill="none" stroke="#e9e1da" strokeWidth="2" />
        <ellipse cx="0" cy="-6" rx="9" ry="2.4" fill="#b57a45" />
        <path d="M-9-2Q0 1 9-2" fill="none" stroke="#d4a14f" strokeWidth=".8" opacity=".8" />
        <use href="#rg-rose" x="-3" y="-3" width="6" height="6" />
      </g>
    </g>
  )
}

// ── Tiere ─────────────────────────────────────────────────────────────────
type Plan = {
  id: number
  kind: 'bird' | 'squirrel'
  // Wegpunkte: [x, y, Zeitpunkt in ms ab Start]
  path: [number, number, number][]
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

function planCritter(id: number): Plan {
  const kind = Math.random() < 0.6 ? 'bird' : 'squirrel'
  const fromLeft = Math.random() < 0.5
  const [sx, ex] = fromLeft ? [-80, W + 80] : [W + 80, -80]
  if (kind === 'bird') {
    const [px, py] = PERCH_BIRD[Math.floor(Math.random() * PERCH_BIRD.length)]
    const sit = rand(2500, 5000)
    const fly1 = rand(2600, 3600)
    return {
      id,
      kind,
      path: [
        [sx, rand(150, 380), 0],
        [px, py, fly1],
        [px, py, fly1 + sit],
        [ex, rand(120, 340), fly1 + sit + rand(2400, 3200)],
      ],
    }
  }
  const [px, py] = PERCH_SQUIRREL[Math.floor(Math.random() * PERCH_SQUIRREL.length)]
  const groundY = py
  const run1 = Math.abs(px - sx) * rand(2.2, 2.8)
  const sit = rand(2200, 4200)
  return {
    id,
    kind,
    path: [
      [sx, groundY, 0],
      [px, py, run1],
      [px, py, run1 + sit],
      [ex, groundY, run1 + sit + Math.abs(ex - px) * rand(2.2, 2.8)],
    ],
  }
}

/** Position, Blickrichtung und ob das Tier gerade sitzt – zum Zeitpunkt t. */
function at(p: Plan, t: number) {
  const pts = p.path
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, t0] = pts[i]
    const [x1, y1, t1] = pts[i + 1]
    if (t <= t1) {
      const k = ease((t - t0) / (t1 - t0 || 1))
      const moving = x0 !== x1 || y0 !== y1
      // Vögel fliegen im Bogen, Eichhörnchen hüpfen
      const arc = p.kind === 'bird' && moving ? -Math.sin(k * Math.PI) * 60 : 0
      const hop = p.kind === 'squirrel' && moving ? -Math.abs(Math.sin(t / 90)) * 9 : 0
      return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k + arc + hop, dir: x1 >= x0 ? 1 : -1, moving }
    }
  }
  return null
}

// Tiere als eigene, per GPU verschobene Elemente: Position und Pose setzt die Bildschleife direkt
// am DOM, ohne React-Neuzeichnen – sonst fällt die Seite auf wenige Bilder pro Sekunde.
function Critters() {
  const [plans, setPlans] = useState<{ plan: Plan; start: number }[]>([])
  const els = useRef(new Map<number, HTMLDivElement>())
  const live = useRef(plans)
  live.current = plans

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = 0
    let spawnTimer: ReturnType<typeof setTimeout>
    const spawn = () => {
      setPlans((l) => [...l.slice(-3), { plan: planCritter(++n), start: performance.now() }])
      spawnTimer = setTimeout(spawn, rand(6000, 12000))
    }
    spawnTimer = setTimeout(spawn, rand(1500, 3500))
    let raf = 0
    const tick = (t: number) => {
      // gleiche Abbildung wie preserveAspectRatio="xMidYMax slice" der Szene
      const vw = innerWidth
      const vh = innerHeight
      const k = Math.max(vw / W, vh / 1000)
      const ox = (vw - W * k) / 2
      const oy = vh - 1000 * k
      for (const { plan, start } of live.current) {
        const el = els.current.get(plan.id)
        if (!el) continue
        const s = at(plan, t - start)
        if (!s) {
          el.style.display = 'none'
          continue
        }
        el.style.transform = `translate(${s.x * k + ox}px, ${s.y * k + oy}px) scale(${k * s.dir}, ${k})`
        const moving = String(s.moving)
        if (el.dataset.moving !== moving) el.dataset.moving = moving
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      clearTimeout(spawnTimer)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {plans.map(({ plan }) => (
        <div
          key={plan.id}
          ref={(el) => {
            if (el) els.current.set(plan.id, el)
            else els.current.delete(plan.id)
          }}
          className={`critter ${plan.kind}`}
          data-moving="true"
        >
          <svg viewBox="-40 -60 80 70" width="80" height="70" overflow="visible">
            {plan.kind === 'bird' ? <Bird /> : <Squirrel />}
          </svg>
        </div>
      ))}
    </div>
  )
}

/** Rotkehlchen, nach rechts blickend, Füße bei (0,0). Flügelschlag und Picken macht CSS. */
function Bird() {
  return (
    <g transform="scale(1.5)">
      <path className="sit" d="M-2 0v-4M2 0v-4" stroke="#6b4a36" strokeWidth="1.1" />
      <path d="M-14-9C-20-8-23-6-25-4C-20-5-16-5-12-6Z" fill="#6f5a48" />
      <ellipse cx="-2" cy="-10" rx="12" ry="8" fill="#7d6a58" />
      <ellipse cx="3" cy="-8" rx="7.5" ry="6" fill="#e07a4a" />
      <g className="head">
        <circle cx="7" cy="-17" r="6" fill="#7d6a58" />
        <circle cx="8" cy="-15" r="4.2" fill="#e07a4a" />
        <circle cx="9.2" cy="-18.4" r="1.1" fill="#1d1612" />
        <path d="M12.5-17.5l4.5 1.2-4.5 1z" fill="#3b2a20" />
      </g>
      <path className="sit" d="M-10-12C-4-15 4-13 6-10C0-7-6-7-10-12Z" fill="#5f4c3d" />
      <path className="fly wing" d="M-6-12C-12-28-20-28-24-20C-16-10-10-9-4-9Z" fill="#5f4c3d" />
    </g>
  )
}

/** Eichhörnchen, nach rechts blickend, Füße bei (0,0). */
function Squirrel() {
  return (
    <g transform="scale(1.6)">
      <g className="tail">
        <path d="M-10-6C-24-8-30-22-24-34C-20-42-10-40-12-30C-14-24-8-20-6-14Z" fill="#b8693a" />
        <path d="M-12-12C-20-16-24-26-20-32" fill="none" stroke="#d99a6a" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="fly">
        <ellipse cx="2" cy="-8" rx="11" ry="6.5" fill="#c4763f" />
        <circle cx="12" cy="-12" r="5.5" fill="#c4763f" />
        <path d="M-6-3l-3 3M8-3l3 3" stroke="#8a4f2a" strokeWidth="2" strokeLinecap="round" />
        <path d="M11-17l1-4 2 4z" fill="#a35a2e" />
        <circle cx="14" cy="-13" r="1" fill="#1d1612" />
      </g>
      <g className="sit">
        <ellipse cx="0" cy="-11" rx="7" ry="10" fill="#c4763f" />
        <ellipse cx="2" cy="-9" rx="3.6" ry="6" fill="#f0d2b0" />
        <circle cx="5" cy="-22" r="5.5" fill="#c4763f" />
        <path d="M3-8l4 1" stroke="#8a4f2a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M3-27l1-4 2 4z" fill="#a35a2e" />
        <circle cx="7" cy="-23" r="1" fill="#1d1612" />
      </g>
    </g>
  )
}
