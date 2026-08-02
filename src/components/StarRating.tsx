interface Props {
  value: number | null
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, size = 'md' }: Props) {
  const stars = [1, 2, 3, 4, 5]
  const cls = size === 'sm' ? 'text-base' : 'text-2xl'
  return (
    <div className="flex gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          className={`${cls} leading-none transition ${
            onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${(value ?? 0) >= s ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
          aria-label={`${s} Sterne`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
