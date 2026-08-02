// Klassen-Helfer (leichtgewichtiger Ersatz für shadcns cn / clsx).
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}
