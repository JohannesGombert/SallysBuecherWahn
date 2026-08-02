// Klassen-Helfer (leichtgewichtiger Ersatz für shadcns cn / clsx).
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}

// Link zur aktuellen amazon.de-Seite des Buchs (per ISBN, sonst Titel + Autor).
export function amazonDeUrl(opts: {
  isbn?: string | null
  title: string
  authors?: string[]
}): string {
  const q =
    opts.isbn?.trim() ||
    [opts.title, opts.authors?.[0]].filter(Boolean).join(' ')
  return `https://www.amazon.de/s?k=${encodeURIComponent(q)}`
}
