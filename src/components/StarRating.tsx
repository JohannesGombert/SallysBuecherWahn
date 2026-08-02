interface Props {
  value: number | null
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, size = 'md' }: Props) {
  const stars = [1, 2, 3, 4, 5]
  const px = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  return (
    <div className="flex gap-0.5">
      {stars.map((s) => {
        const active = (value ?? 0) >= s
        return (
          <button
            key={s}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(s)}
            className={`${onChange ? 'cursor-pointer transition hover:scale-125' : 'cursor-default'}`}
            aria-label={`${s} von 5 Sternen`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${px} ${active ? 'text-ember-400' : 'text-brand-900/15 dark:text-white/15'}`}
              fill={active ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.05 1.1-6.47L2.6 9.9l6.5-.95z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
