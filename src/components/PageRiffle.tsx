import { useEffect, useRef } from 'react'

// Canvas-Animation: ein Fächer aus Buchseiten, die sich böig wölben und wehen.
// Jede Seite wird mit Verlauf schattiert (Licht auf der Wölbung, Schatten im Tal)
// und hat eine gewellte freie Kante – dadurch wirkt es plastisch statt flach.
export function PageRiffle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let W = 0
    let H = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = Math.max(1, Math.round(W * dpr))
      canvas.height = Math.max(1, Math.round(H * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const PAGES = 9
    const start = performance.now()

    const draw = (now: number) => {
      const t = (now - start) / 1000
      const dark = document.documentElement.classList.contains('dark')
      const col = dark
        ? { shadow: '#140f1a', base: '#241d2b', light: '#3a2e44', edge: '#0e0a12' }
        : { shadow: '#c9b593', base: '#e8d9be', light: '#fdf7ea', edge: '#b9a885' }

      ctx.clearRect(0, 0, W, H)

      // Seiten von hinten nach vorne zeichnen (vordere überlappen hintere)
      for (let i = 0; i < PAGES; i++) {
        const depth = i / (PAGES - 1) // 0 hinten … 1 vorne
        // Böe läuft als Welle durch den Stapel
        const phase = t * 1.15 - i * 0.55
        const gust = Math.max(0, Math.sin(phase)) ** 1.5 // sanftes An-/Abschwellen
        const lift = 0.15 + 0.85 * gust

        // Ruheposition: hintere Seiten weiter links (gefächert)
        const baseRight = W * (0.35 + 0.62 * depth)
        const amp = W * 0.16 * lift

        // Pfad der Seite: Scharnier links (x=0), gewellte freie Kante rechts
        ctx.beginPath()
        ctx.moveTo(0, 0)
        const steps = 10
        for (let s = 0; s <= steps; s++) {
          const y = (H * s) / steps
          const wave = Math.sin((y / H) * Math.PI * 1.3 + phase * 1.4)
          const x = baseRight + amp * wave
          ctx.lineTo(x, y)
        }
        ctx.lineTo(0, H)
        ctx.closePath()

        // Schattierung quer zur Seite: Licht wandert mit der Wölbung
        const hx = baseRight * (0.25 + 0.5 * gust)
        const grad = ctx.createLinearGradient(0, 0, baseRight + amp, 0)
        grad.addColorStop(0, col.shadow)
        grad.addColorStop(Math.min(0.95, Math.max(0.05, hx / (baseRight + amp))), col.light)
        grad.addColorStop(1, col.base)
        ctx.fillStyle = grad
        // leichter Schlagschatten der vorderen Kante
        ctx.shadowColor = 'rgba(0,0,0,0.28)'
        ctx.shadowBlur = 12
        ctx.shadowOffsetX = -6
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0

        // dünne dunkle Kante (freie Seite)
        ctx.beginPath()
        for (let s = 0; s <= steps; s++) {
          const y = (H * s) / steps
          const wave = Math.sin((y / H) * Math.PI * 1.3 + phase * 1.4)
          const x = baseRight + amp * wave
          if (s === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = col.edge
        ctx.globalAlpha = 0.25
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
}
