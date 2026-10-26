import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../lib/theme'
import { NightSky } from './NightSky'

/** Hintergrund passend zum gewählten Design. */
export function Sky({ shooting = true }: { shooting?: boolean }) {
  return useTheme() === 'wald' ? <ForestSky leaves={shooting} /> : <NightSky shooting={shooting} />
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

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

type Leaf = { id: number; left: number; dur: number; dx: number; hue: number }

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
  const [falling, setFalling] = useState<Leaf[]>([])

  useEffect(() => {
    if (!leaves || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = 0
    let timer: ReturnType<typeof setTimeout>
    const spawn = () => {
      const l: Leaf = { id: ++n, left: rand(5, 95), dur: rand(11, 17), dx: rand(-160, 160), hue: rand(0, 1) }
      setFalling((list) => [...list, l])
      setTimeout(() => setFalling((list) => list.filter((x) => x.id !== l.id)), l.dur * 1000 + 200)
      timer = setTimeout(spawn, rand(4000, 10000))
    }
    timer = setTimeout(spawn, rand(1000, 3000))
    return () => clearTimeout(timer)
  }, [leaves])

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
