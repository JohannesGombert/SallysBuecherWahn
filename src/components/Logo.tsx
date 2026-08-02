// Wortmarke-Symbol: drei gestapelte Buchrücken mit Lesezeichen.
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logoInk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d55bd" />
          <stop offset="1" stopColor="#452c6b" />
        </linearGradient>
        <linearGradient id="logoEmber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8ac6d" />
          <stop offset="1" stopColor="#e14a0e" />
        </linearGradient>
      </defs>
      <rect x="6" y="30" width="34" height="9" rx="2.5" fill="url(#logoInk)" />
      <rect x="9" y="20" width="30" height="9" rx="2.5" fill="url(#logoEmber)" />
      <rect x="7" y="9" width="26" height="10" rx="2.5" fill="url(#logoInk)" />
      {/* Lesezeichen */}
      <path d="M26 9v13l3.2-2.4L32.4 22V9z" fill="#faf5ea" opacity="0.9" />
    </svg>
  )
}
