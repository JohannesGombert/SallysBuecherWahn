// Linien-Icons im Stil feiner Kupferstich-Zeichen.
const PATHS = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="M4.5 12.5l5 5L20 7" />,
  logout: <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15" /></>,
  camera: <><path d="M3.5 8.5a2 2 0 0 1 2-2h2.2l1.4-2h5.8l1.4 2h2.2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /><circle cx="12" cy="13" r="3.6" /></>,
  trash: <><path d="M4.5 7h15M9.5 7V4.8h5V7" /><path d="M6.5 7l.9 12.2a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" /></>,
  cart: <><circle cx="9.5" cy="19.5" r="1.3" /><circle cx="17.5" cy="19.5" r="1.3" /><path d="M2.5 3.5h2.3l2.1 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L20.5 7.5H5.6" /></>,
  external: <><path d="M14 4h6v6M20 4l-8.5 8.5" /><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" /></>,
  // Chronik: aufgerollte Schriftrolle
  scroll: <><path d="M7 4h11a2 2 0 0 1 0 4h-1v10a2 2 0 0 1-2 2H6a2 2 0 0 1 0-4h1z" /><path d="M7 16V6a2 2 0 0 0-4 0v1h4M10 9h4M10 12.5h4" /></>,
  // Feder zum Einschreiben
  quill: <><path d="M20 4c-7 .5-11.5 5-13 12.5L5 20" /><path d="M20 4c-.5 6.5-4.5 11-11 12.5M8.5 13.5h5" /></>,
  // Status-Siegel
  candle: <><path d="M9 11h6v9.5H9z" /><path d="M12 11V9" /><path d="M12 3.2c1.6 1.8 2.2 3 .9 4.5-.5.6-1.3.6-1.8 0-1.3-1.5-.7-2.7.9-4.5z" /><path d="M6.5 20.5h11" /></>,
  tome: <><path d="M5.5 4.5h11a2 2 0 0 1 2 2v13h-11a2 2 0 0 1-2-2z" /><path d="M5.5 17.5a2 2 0 0 1 2-2h11M9.5 8.5h5" /></>,
  comet: <><path d="M14.5 9.5 4 20M17 12l-6.5 6.5M12 7 6.5 12.5" /><path d="M18 3.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" /></>,
  crescent: <path d="M15.5 3.8A8.5 8.5 0 1 0 20.2 17 7 7 0 1 1 15.5 3.8z" />,
  // Einstellungen: Zahnrad
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M5.5 18.5l1.9-1.9M16.6 7.4l1.9-1.9" /><circle cx="12" cy="12" r="6.4" /></>,
  star: <path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z" />,
} as const

export type SigilName = keyof typeof PATHS

export function Sigil({
  name,
  className = 'h-5 w-5',
  strokeWidth = 1.6,
}: {
  name: SigilName
  className?: string
  strokeWidth?: number
}) {
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
      {PATHS[name]}
    </svg>
  )
}
