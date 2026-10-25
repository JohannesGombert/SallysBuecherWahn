import { useEffect, useRef, type ReactNode } from 'react'
import { Corners } from './Emblem'
import { Sigil } from './Sigil'

/** Eine Seite, die sich über das Grimoire legt (unten auf dem Handy, mittig am Desktop). */
export function Sheet({
  title,
  onClose,
  wide = false,
  children,
}: {
  title: string
  onClose: () => void
  wide?: boolean
  children: ReactNode
}) {
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      className="animate-fade fixed inset-0 z-40 flex items-end justify-center bg-night-950/75 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`page animate-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl sm:rounded-3xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Corners inset="inset-2.5" size="h-7 w-7" />
        <header className="flex items-center justify-between gap-3 px-6 pb-2 pt-5">
          <h2 className="rubric">{title}</h2>
          <button onClick={onClose} className="btn-icon -mr-2" aria-label="Schließen">
            <Sigil name="close" />
          </button>
        </header>
        <div className="overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  )
}
