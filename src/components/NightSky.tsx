import { useEffect, useMemo, useState } from 'react'

type Shooter = { id: number; top: number; left: number; angle: number; dist: number }

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Sternenhimmel: driftende Sternfelder, einzeln funkelnde Sterne und gelegentlich eine Sternschnuppe. */
export function NightSky({ shooting = true }: { shooting?: boolean }) {
  // einmal pro Seitenaufruf zufällig verteilt
  const stars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        top: rand(2, 96),
        left: rand(2, 98),
        size: rand(1.4, i < 6 ? 3.2 : 2.2),
        dur: rand(2.5, 6.5),
        delay: rand(-6, 0),
        sparkle: i < 6, // die hellsten bekommen ein Strahlenkreuz
      })),
    [],
  )
  const [shooters, setShooters] = useState<Shooter[]>([])

  useEffect(() => {
    if (!shooting || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = 0
    let timer: ReturnType<typeof setTimeout>
    const spawn = () => {
      const toLeft = Math.random() < 0.5
      const s: Shooter = {
        id: ++n,
        top: rand(3, 45),
        left: toLeft ? rand(35, 95) : rand(5, 65),
        angle: toLeft ? rand(145, 160) : rand(20, 35),
        dist: rand(280, 520),
      }
      setShooters((list) => [...list, s])
      setTimeout(() => setShooters((list) => list.filter((x) => x.id !== s.id)), 1400)
      timer = setTimeout(spawn, rand(5000, 13000))
    }
    timer = setTimeout(spawn, rand(1500, 4000))
    return () => clearTimeout(timer)
  }, [shooting])

  return (
    <div className="night-sky" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`twinkle-star ${s.sparkle ? 'sparkle' : ''}`}
          style={
            {
              top: `${s.top}%`,
              left: `${s.left}%`,
              '--s': `${s.size}px`,
              '--t': `${s.dur}s`,
              '--d': `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {shooters.map((s) => {
        const rad = (s.angle * Math.PI) / 180
        return (
          <span
            key={s.id}
            className="shooting-star"
            style={
              {
                top: `${s.top}%`,
                left: `${s.left}%`,
                '--a': `${s.angle}deg`,
                '--dx': `${Math.cos(rad) * s.dist}px`,
                '--dy': `${Math.sin(rad) * s.dist}px`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
