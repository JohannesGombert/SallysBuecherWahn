import { useSyncExternalStore } from 'react'

// Das Design steht im Konto (user_metadata.theme) und wird zusätzlich im Browser
// gemerkt, damit schon der Login im zuletzt gewählten Design erscheint.

export type Theme = 'nacht' | 'wald'

export const THEMES: { id: Theme; name: string; hint: string }[] = [
  { id: 'nacht', name: 'Nacht-Grimoire', hint: 'Mitternachtsblau, Blattgold, Sternschnuppen.' },
  { id: 'wald', name: 'Verwunschener Wald', hint: 'Tannengrün, Kupfer, Glühwürmchen im Nebel.' },
]

const THEME_COLOR: Record<Theme, string> = { nacht: '#0b1024', wald: '#0c1a13' }

export const asTheme = (v: unknown): Theme => (v === 'wald' ? 'wald' : 'nacht')

let current: Theme = 'nacht'
const listeners = new Set<() => void>()

export function setTheme(t: Theme) {
  current = t
  const root = document.documentElement
  root.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[t])
  document.querySelector('link[rel="icon"]')?.setAttribute('href', t === 'wald' ? '/favicon-wald.svg' : '/favicon.svg')
  try {
    localStorage.setItem('theme', t)
  } catch {
    // ohne Speicher (privates Fenster) gilt das Design nur bis zum Neuladen
  }
  listeners.forEach((f) => f())
}

try {
  setTheme(asTheme(localStorage.getItem('theme')))
} catch {
  setTheme('nacht')
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}
