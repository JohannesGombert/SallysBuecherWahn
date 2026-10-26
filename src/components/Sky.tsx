import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../lib/theme'
import { NightSky } from './NightSky'

/** Hintergrund passend zum gewählten Design. */
export function Sky({ shooting = true }: { shooting?: boolean }) {
  const theme = useTheme()
  if (theme === 'wald') return <ForestSky leaves={shooting} />
  if (theme === 'rose') return <TeaRoomSky drift={shooting} />
  return <NightSky shooting={shooting} />
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Lässt in zufälligen Abständen etwas erscheinen (Blatt, Dampf …) und nach `dur` Sekunden wieder verschwinden. */
function useSpawn<T extends { dur: number }>(enabled: boolean, make: () => T, gap: [number, number]) {
  const [list, setList] = useState<(T & { id: number })[]>([])
  const makeRef = useRef(make)
  makeRef.current = make
  useEffect(() => {
    if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = 0
    let timer: ReturnType<typeof setTimeout>
    const spawn = () => {
      const item = { ...makeRef.current(), id: ++n }
      setList((l) => [...l, item])
      setTimeout(() => setList((l) => l.filter((x) => x.id !== item.id)), item.dur * 1000 + 200)
      timer = setTimeout(spawn, rand(gap[0], gap[1]))
    }
    timer = setTimeout(spawn, rand(800, 2500))
    return () => clearTimeout(timer)
  }, [enabled, gap[0], gap[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  return list
}

// Tanne als Umriss: Spitze, vier Astetagen, kurzer Stamm (viewBox-Höhe 300)
function fir(x: number, h: number, w: number) {
  const top = 300 - h
  const right: string[] = []
  for (let i = 1; i <= 4; i++) {
    const y = top + (h - 14) * (i / 4)
    const half = (w / 2) * (i / 4)
    right.push(`${x + half},${y}`)
    if (i < 4) right.push(`${x + half * 0.45},${y - 4}`)
  }
  const left = right.map((p) => {
    const [px, py] = p.split(',').map(Number)
    return `${2 * x - px},${py}`
  })
  return [`${x},${top}`, ...right, `${x + 4},${300 - 14}`, `${x + 4},300`, `${x - 4},300`, `${x - 4},${300 - 14}`, ...left.reverse()].join(' ')
}

// [x, Höhe, Breite]: hintere Reihe heller, vordere fast schwarz
const BACK: [number, number, number][] = [
  [40, 170, 70], [130, 210, 80], [230, 150, 60], [330, 230, 90], [450, 180, 70], [560, 140, 60],
  [650, 200, 80], [760, 160, 64], [860, 240, 90], [980, 175, 70], [1080, 215, 82], [1170, 160, 64],
]
const FRONT: [number, number, number][] = [
  [-10, 260, 110], [90, 190, 80], [200, 120, 56], [1000, 130, 60], [1100, 200, 84], [1210, 270, 110],
]

const FOREST_GAP: [number, number] = [4000, 10000]

/** Waldlichtung bei Nacht: Tannen, Bodennebel, Glühwürmchen, fallende Blätter, blasser Mond. */
function ForestSky({ leaves = true }: { leaves?: boolean }) {
  const flies = useMemo(
    () =>
      Array.from({ length: 22 }, () => ({
        top: rand(30, 92),
        left: rand(2, 98),
        size: rand(2, 4),
        dur: rand(3, 7),
        delay: rand(-8, 0),
        x: rand(-60, 60),
        y: rand(-40, 40),
      })),
    [],
  )
  const falling = useSpawn(leaves, () => ({ left: rand(5, 95), dur: rand(11, 17), dx: rand(-160, 160), hue: rand(0, 1) }), FOREST_GAP)

  return (
    <div className="forest-sky" aria-hidden="true">
      <div className="forest-moon" />
      <div className="fog fog-b" />
      <svg className="forest-trees h-[38vh]" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
        <g fill="#122a1d" opacity="0.85">
          {BACK.map(([x, h, w]) => (
            <polygon key={x} points={fir(x, h, w)} />
          ))}
        </g>
        <g fill="#040a07">
          {FRONT.map(([x, h, w]) => (
            <polygon key={x} points={fir(x, h, w)} />
          ))}
        </g>
      </svg>
      <div className="fog fog-a" />
      {flies.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={
            {
              top: `${f.top}%`,
              left: `${f.left}%`,
              '--s': `${f.size}px`,
              '--t': `${f.dur}s`,
              '--d': `${f.delay}s`,
              '--x': `${f.x}px`,
              '--y': `${f.y}px`,
            } as React.CSSProperties
          }
        />
      ))}
      {falling.map((l) => (
        <span key={l.id} className="leaf" style={{ left: `${l.left}%`, '--t': `${l.dur}s`, '--dx': `${l.dx}px` } as React.CSSProperties}>
          <svg viewBox="0 0 16 16">
            <path
              d="M8 1C12 4 13 9 8 15C3 9 4 4 8 1Z"
              fill={l.hue < 0.5 ? '#b5652f' : '#8a9a3a'}
              fillOpacity="0.8"
            />
            <path d="M8 3V14" stroke="#3a2412" strokeOpacity=".6" strokeWidth=".7" />
          </svg>
        </span>
      ))}
    </div>
  )
}

// Rosengarten am unteren Rand (viewBox 1200×300): Hecke aus Bögen, darin Rosen
function hedge(top: number, bump: number, width: number) {
  let d = `M0 300V${top}`
  for (let x = 0; x < 1200; x += width) d += `Q${x + width / 2} ${top - bump} ${x + width} ${top}`
  return d + 'V300Z'
}
// [x, y, Größe, Farbe]
const GARDEN_BACK: [number, number, number, string][] = [
  [40, 150, 7, '#f2c4d1'], [120, 132, 6, '#e8a5b9'], [210, 150, 7, '#f6d6de'], [300, 128, 6, '#e8a5b9'],
  [390, 148, 7, '#f2c4d1'], [480, 130, 6, '#d98aa3'], [580, 150, 7, '#f6d6de'], [670, 126, 6, '#e8a5b9'],
  [760, 146, 7, '#f2c4d1'], [850, 132, 6, '#d98aa3'], [950, 150, 7, '#f6d6de'], [1040, 128, 6, '#e8a5b9'], [1140, 146, 7, '#f2c4d1'],
]
const GARDEN_FRONT: [number, number, number, string][] = [
  [20, 228, 11, '#d98aa3'], [95, 205, 9, '#e8a5b9'], [165, 236, 12, '#c96f8f'], [250, 214, 10, '#f2c4d1'],
  [930, 220, 10, '#e8a5b9'], [1010, 200, 9, '#c96f8f'], [1090, 232, 12, '#d98aa3'], [1170, 210, 10, '#f2c4d1'],
]

function GardenRose({ x, y, r, c }: { x: number; y: number; r: number; c: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={c} />
      <circle cx={x} cy={y} r={r * 0.62} fill="#fff" opacity=".22" />
      <path d={`M${x - r * 0.35} ${y}a${r * 0.35} ${r * 0.35} 0 1 1 ${r * 0.35} ${r * 0.35}`} fill="none" stroke="#9e4a68" strokeOpacity=".45" strokeWidth={r * 0.14} />
    </g>
  )
}

const PETAL_GAP: [number, number] = [2200, 5500]
const STEAM_GAP: [number, number] = [6000, 12000]
const PETAL_COLORS = ['#e8a5b9', '#f2c4d1', '#d98aa3', '#f6d6de']

/** Rosen-Teesalon: Sonnenlicht vom Fenster, tanzende Lichtflecken, fallende Blütenblätter, Teedampf. */
function TeaRoomSky({ drift = true }: { drift?: boolean }) {
  const flecks = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        top: rand(5, 70),
        left: rand(2, 60),
        size: rand(30, 90),
        dur: rand(5, 10),
        delay: rand(-10, 0),
        x: rand(-30, 30),
        y: rand(-20, 20),
      })),
    [],
  )
  const petals = useSpawn(drift, () => ({ left: rand(5, 95), dur: rand(12, 18), dx: rand(-200, 200), c: PETAL_COLORS[Math.floor(rand(0, 4))] }), PETAL_GAP)
  const steam = useSpawn(drift, () => ({ left: rand(8, 92), dur: rand(7, 10) }), STEAM_GAP)

  return (
    <div className="tea-sky" aria-hidden="true">
      <div className="sunbeam" />
      <div className="sunbeam b" />
      <svg className="forest-trees h-[30vh]" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
        <path d={hedge(150, 40, 90)} fill="#cfdcc4" />
        {GARDEN_BACK.map(([x, y, r, c]) => (
          <GardenRose key={x} x={x} y={y} r={r} c={c} />
        ))}
        {/* Büsche vorn links und rechts, die Mitte bleibt frei für das Regal */}
        <path d="M0 300V215Q40 160 95 185Q150 150 205 200Q260 175 300 300Z" fill="#a9c49f" />
        <path d="M1200 300V200Q1150 160 1095 185Q1040 150 985 195Q930 180 890 300Z" fill="#a9c49f" />
        {GARDEN_FRONT.map(([x, y, r, c]) => (
          <GardenRose key={x} x={x} y={y} r={r} c={c} />
        ))}
      </svg>
      {flecks.map((f, i) => (
        <span
          key={i}
          className="sunfleck"
          style={
            {
              top: `${f.top}%`,
              left: `${f.left}%`,
              '--s': `${f.size}px`,
              '--t': `${f.dur}s`,
              '--d': `${f.delay}s`,
              '--x': `${f.x}px`,
              '--y': `${f.y}px`,
            } as React.CSSProperties
          }
        />
      ))}
      {steam.map((s) => (
        <span key={s.id} className="steam" style={{ left: `${s.left}%`, '--t': `${s.dur}s` } as React.CSSProperties}>
          <svg viewBox="0 0 60 160" fill="none">
            <path d="M30 160C10 130 50 110 30 80S12 30 34 0" stroke="#fff" strokeOpacity=".75" strokeWidth="6" strokeLinecap="round" />
            <path d="M40 150C26 128 54 112 40 90" stroke="#fff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </span>
      ))}
      {petals.map((p) => (
        <span key={p.id} className="leaf" style={{ left: `${p.left}%`, '--t': `${p.dur}s`, '--dx': `${p.dx}px` } as React.CSSProperties}>
          <svg viewBox="0 0 16 16">
            <path d="M8 15C3 12 2 6 5 2C6.5 4 9.5 4 11 2C14 6 13 12 8 15Z" fill={p.c} fillOpacity="0.9" />
          </svg>
        </span>
      ))}
    </div>
  )
}
