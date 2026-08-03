// Goldenes, symmetrisches Zier-Ornament (Arabeske) – eigene Nachbildung.
export function GoldOrnament({ className = 'h-10 w-40' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdeeb8" />
          <stop offset="0.45" stopColor="#e8c96e" />
          <stop offset="0.8" stopColor="#b3831f" />
          <stop offset="1" stopColor="#8a621a" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))' }}
      >
        {/* Mittelraute */}
        <path d="M100 8 L112 20 L100 32 L88 20 Z" />
        <circle cx="100" cy="20" r="3.4" fill="url(#goldGrad)" stroke="none" />
        {/* Linke Ranke */}
        <path d="M88 20 C74 20 74 8 62 10 C52 11 52 20 44 20" />
        <path d="M62 10 C58 4 50 4 48 10 C47 14 52 16 55 13" />
        <path d="M44 20 C36 20 34 26 26 24 C20 22 22 16 28 17" />
        <path d="M8 20 h30" />
        <circle cx="8" cy="20" r="2.2" fill="url(#goldGrad)" stroke="none" />
        {/* Rechte Ranke (gespiegelt) */}
        <path d="M112 20 C126 20 126 8 138 10 C148 11 148 20 156 20" />
        <path d="M138 10 C142 4 150 4 152 10 C153 14 148 16 145 13" />
        <path d="M156 20 C164 20 166 26 174 24 C180 22 178 16 172 17" />
        <path d="M192 20 h-30" />
        <circle cx="192" cy="20" r="2.2" fill="url(#goldGrad)" stroke="none" />
      </g>
    </svg>
  )
}
