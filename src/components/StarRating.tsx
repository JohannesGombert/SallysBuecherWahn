import { Sigil } from './Sigil'

interface Props {
  value: number | null
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, size = 'md' }: Props) {
  const px = size === 'sm' ? 'h-4 w-4' : 'h-7 w-7'
  const stars = [1, 2, 3, 4, 5]
  const icon = (s: number) => (
    <Sigil
      name="star"
      strokeWidth={1.3}
      className={`${px} ${(value ?? 0) >= s ? 'fill-gold-300 text-gold-300 drop-shadow-[0_0_6px_rgba(240,217,154,0.6)]' : 'text-ivory-300/35'}`}
    />
  )

  if (!onChange) {
    return (
      <div className="flex gap-0.5" role="img" aria-label={`${value ?? 0} von 5 Sternen`}>
        {stars.map((s) => <span key={s}>{icon(s)}</span>)}
      </div>
    )
  }
  return (
    <div className="-mx-1.5 flex">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="flex h-11 w-11 items-center justify-center transition hover:scale-110"
          aria-label={`${s} von 5 Sternen`}
          aria-pressed={(value ?? 0) >= s}
        >
          {icon(s)}
        </button>
      ))}
    </div>
  )
}
