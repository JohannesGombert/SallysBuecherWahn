import { useId } from 'react'
import { useTheme } from '../lib/theme'

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
  const theme = useTheme()
  const gid = `gold-${useId().replace(/:/g, '')}`
  const gold = `url(#${gid})`
  if (theme === 'wald') return <OwlEmblem className={className} small={small} gid={gid} />
  if (theme === 'rose') return <RoseEmblem className={className} small={small} gid={gid} />
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
      <path d="M4 8h54M102 8h54" className="stroke-gold-400" strokeOpacity=".55" strokeWidth="1" />
      <path d="M62 8l4-4 4 4-4 4zM90 8l4-4 4 4-4 4z" className="fill-gold-400" fillOpacity=".7" />
      <path d="M80 2l1.6 4.4L86 8l-4.4 1.6L80 14l-1.6-4.4L74 8l4.4-1.6z" className="fill-gold-200" />
    </svg>
  )
}

// Goldene Eckbeschläge für Einband und Tafeln
export function Corners({ inset = 'inset-3', size = 'h-9 w-9' }: { inset?: string; size?: string }) {
  const piece = (
    <svg viewBox="0 0 40 40" className={size} fill="none" aria-hidden="true">
      <path d="M2 22V8a6 6 0 0 1 6-6h14" className="stroke-gold-400" strokeOpacity=".75" strokeWidth="1.5" />
      <path d="M8 16V12a4 4 0 0 1 4-4h4" className="stroke-gold-400" strokeOpacity=".45" strokeWidth="1" />
      <path d="M2 2l5 5" className="stroke-gold-200" strokeOpacity=".7" strokeWidth="1" />
      <circle cx="12.5" cy="12.5" r="1.6" className="fill-gold-200" fillOpacity=".8" />
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

// Rosenblüte (Koordinaten 0–40, Mitte 20/20): äußere Blätter, innere Blätter, Spirale.
// innerClass erlaubt der Öffnungs-Animation, die inneren Blätter extra aufgehen zu lassen.
const ROSE_OUTER = [0, 72, 144, 216, 288]
const ROSE_INNER = [36, 126, 216, 306]
export function RoseFlower({ innerClass = '', spiral = true }: { innerClass?: string; spiral?: boolean }) {
  const at = (deg: number, r: number) => [20 + r * Math.cos((deg * Math.PI) / 180), 20 + r * Math.sin((deg * Math.PI) / 180)]
  return (
    <g>
      {ROSE_OUTER.map((d) => {
        const [x, y] = at(d - 90, 7)
        return <ellipse key={d} cx={x} cy={y} rx="8" ry="6.5" transform={`rotate(${d} ${x} ${y})`} fill="#eaa4b8" stroke="#c9718f" strokeWidth=".5" />
      })}
      <g className={innerClass}>
        {ROSE_INNER.map((d) => {
          const [x, y] = at(d - 90, 3.6)
          return <ellipse key={d} cx={x} cy={y} rx="5.5" ry="4.5" transform={`rotate(${d} ${x} ${y})`} fill="#d97f9c" stroke="#b5557a" strokeWidth=".4" />
        })}
        <circle cx="20" cy="20" r="4.2" fill="#c2607f" />
        {spiral && <path d="M20 17.6c2 0 3 1.5 2.4 3s-2.5 2-3.6 1-1-3 .7-3.7" fill="none" stroke="#7a3149" strokeWidth=".8" strokeLinecap="round" />}
      </g>
    </g>
  )
}

const ROSE_BOOK_TRANSFORM = 'translate(32 46) scale(1.3) translate(-37 -34)'

// Teesalon-Logo: Rose auf aufgeschlagenem Buch im ovalen Rahmen, Altrosa und Rosegold.
function RoseEmblem({ className, small, gid }: { className: string; small: boolean; gid: string }) {
  const roseGold = `url(#${gid})`
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d48fa7" />
          <stop offset=".5" stopColor="#b5557a" />
          <stop offset="1" stopColor="#7a3149" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="32" rx="27.5" ry="29.5" fill="#fffaf6" fillOpacity=".55" stroke={roseGold} strokeWidth={small ? 2 : 1.5} />
      {!small && <ellipse cx="32" cy="32" rx="24.8" ry="26.8" fill="none" stroke={roseGold} strokeWidth=".6" opacity=".55" />}
      <g transform={ROSE_BOOK_TRANSFORM} fill="#fffaf6" stroke={roseGold} strokeLinejoin="round" strokeLinecap="round">
        <path d={BOOK} strokeWidth={small ? 1.8 : 1.1} />
        {!small && <path d={LINES} strokeWidth={0.6} opacity={0.55} />}
      </g>
      <path d="M35 36L46 47" stroke="#6f9a6c" strokeWidth={small ? 1.8 : 1.3} strokeLinecap="round" />
      <ellipse cx="42.5" cy="40.5" rx="4" ry="1.7" transform="rotate(-20 42.5 40.5)" fill="#7fae7a" />
      {!small && <ellipse cx="39" cy="45" rx="3.2" ry="1.4" transform="rotate(50 39 45)" fill="#7fae7a" />}
      <g transform="translate(13 11) scale(0.95)">
        <RoseFlower spiral={!small} />
      </g>
    </svg>
  )
}

// Wald-Logo: Eule auf aufgeschlagenem Buch im Blattkranz, Kupfer statt Gold.
const WREATH = [100, 117, 134, 151, 168, 185, 202, 219, 236].flatMap((deg) => [deg, 180 - deg])
const OWL_TUFTS = 'M23.4 23.5L24.4 15.6L28.8 20.6ZM40.6 23.5L39.6 15.6L35.2 20.6Z'
const OWL_BEAK = 'M32 30.6L30.7 32.8L32 35L33.3 32.8Z'
const OWL_WINGS = 'M23.4 28C21.8 33.5 22.8 39 26.4 42.6M40.6 28C42.2 33.5 41.2 39 37.6 42.6'
const OWL_FEATHERS = 'M29 37.2l1.2 1.2 1.2-1.2M32.6 37.2l1.2 1.2 1.2-1.2M30.8 40l1.2 1.2 1.2-1.2'
const OWL_BOOK_TRANSFORM = 'translate(32 50.5) scale(1.3) translate(-37 -34)'

function OwlEmblem({ className, small, gid }: { className: string; small: boolean; gid: string }) {
  const copper = `url(#${gid})`
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe9d6" />
          <stop offset=".5" stopColor="#cc8752" />
          <stop offset="1" stopColor="#844d2a" />
        </linearGradient>
      </defs>
      {!small &&
        WREATH.map((deg) => {
          const r = (deg * Math.PI) / 180
          const x = 32 + 27.5 * Math.cos(r)
          const y = 33 + 27.5 * Math.sin(r)
          // Blätter schräg zur Kranzlinie, links und rechts gespiegelt
          const tilt = deg + (Math.cos(r) < 0 ? 60 : -60)
          return <ellipse key={deg} cx={x} cy={y} rx="3.4" ry="1.4" transform={`rotate(${tilt} ${x} ${y})`} fill="#a3dca2" fillOpacity=".75" />
        })}
      <path d={OWL_TUFTS} fill={copper} />
      <ellipse cx="32" cy="33" rx="9.6" ry="11.2" fill={copper} />
      {!small && <path d={OWL_WINGS} fill="none" stroke="#3b2414" strokeOpacity=".45" strokeWidth=".8" strokeLinecap="round" />}
      {!small && <path d={OWL_FEATHERS} fill="none" stroke="#3b2414" strokeOpacity=".5" strokeWidth=".7" strokeLinecap="round" strokeLinejoin="round" />}
      <g fill="#120c07">
        <circle cx="28.2" cy="28.2" r={small ? 3.4 : 3.8} />
        <circle cx="35.8" cy="28.2" r={small ? 3.4 : 3.8} />
      </g>
      <g fill="#f4f7c4">
        <circle cx="28.2" cy="28.2" r="2.2" />
        <circle cx="35.8" cy="28.2" r="2.2" />
      </g>
      <g fill="#120c07">
        <circle cx="28.6" cy="28.4" r="1.1" />
        <circle cx="36.2" cy="28.4" r="1.1" />
      </g>
      <path d={OWL_BEAK} fill="#5e361d" />
      <g transform={OWL_BOOK_TRANSFORM} fill="#0c1a13" stroke={copper} strokeLinejoin="round" strokeLinecap="round">
        <path d={BOOK} strokeWidth={small ? 1.8 : 1.1} />
        {!small && <path d={LINES} strokeWidth={0.6} opacity={0.55} />}
      </g>
      {!small && (
        <g fill="#f4f7c4">
          <circle cx="50" cy="13" r=".9" />
          <circle cx="14" cy="16" r=".7" />
          <circle cx="54" cy="21" r=".5" />
        </g>
      )}
    </svg>
  )
}
