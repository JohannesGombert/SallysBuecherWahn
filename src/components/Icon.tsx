// Schlankes SVG-Icon-Set (currentColor, 24×24) – barrierefreier als Emoji.
type IconProps = {
  name: IconName
  className?: string
  strokeWidth?: number
}

export type IconName =
  | 'search'
  | 'plus'
  | 'camera'
  | 'sun'
  | 'moon'
  | 'logout'
  | 'close'
  | 'trash'
  | 'check'
  | 'book'
  | 'sparkle'
  | 'stack'

const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  camera: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.2-1.6A2 2 0 0 1 11 4h2a2 2 0 0 1 1.8 1.4L16 6h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l5-5-5-5M15 12H3" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </>
  ),
  check: <path d="M4 12l5 5L20 6" />,
  book: (
    <>
      <path d="M5 4h11a2 2 0 0 1 2 2v14a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z" />
      <path d="M18 19H6a2 2 0 0 0-2 2" />
    </>
  ),
  sparkle: (
    <path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-5L6 9.4l4.4-1.6z" />
  ),
  stack: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
}

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 2 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
