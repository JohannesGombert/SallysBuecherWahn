import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { Sigil } from './Sigil'

/**
 * Waagrecht wischbare Reiter-Leiste (Handy). Blendet an den Rändern weich aus,
 * solange es in diese Richtung weitergeht, und zeigt rechts ein dezentes Pfeilchen.
 */
export function ScrollRow({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ left: false, right: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setEdge({
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      })
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const fade = edge.left && edge.right ? 'fade-x' : edge.right ? 'fade-r' : edge.left ? 'fade-l' : ''
  return (
    <div className="relative">
      <div ref={ref} className={`${className} ${fade}`} {...rest}>
        {children}
      </div>
      {edge.right && (
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gold-300 animate-nudge" aria-hidden="true">
          <Sigil name="chevron" className="h-4 w-4" strokeWidth={2} />
        </span>
      )}
    </div>
  )
}
