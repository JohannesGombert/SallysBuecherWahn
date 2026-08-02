import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage(
          'Fast geschafft! Bitte bestätige deine E-Mail über den Link, den wir dir geschickt haben.',
        )
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (e: any) {
      setError(e.message ?? 'Etwas ist schiefgelaufen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Linke Seite: Marken-Bühne */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-night-950 lg:block">
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-ember-500/30 blur-3xl" />
        <div className="absolute -left-10 bottom-10 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="font-display text-xl font-semibold">Sallys BücherWahn</span>
          </div>
          <div className="animate-fade-up">
            <h2 className="font-display text-5xl font-black leading-[1.05]">
              Jedes Buch.
              <br />
              <span className="italic text-ember-300">Deine Geschichte.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-paper-200/80">
              Scanne, sammle und verfolge deine Bibliothek – vom ersten Wunsch bis
              zur letzten Seite. Gemacht für Leseratten. 📚
            </p>
          </div>
          <div className="flex gap-8 text-sm text-paper-200/70">
            <Feature icon="camera" text="Barcode scannen" />
            <Feature icon="stack" text="Regale & Status" />
            <Feature icon="sparkle" text="Bewerten & Notizen" />
          </div>
        </div>
      </div>

      {/* Rechte Seite: Formular */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 text-center lg:hidden">
            <Logo className="mx-auto h-12 w-12" />
            <h1 className="mt-3 font-display text-3xl font-bold text-brand-800 dark:text-paper-100">
              Sallys BücherWahn
            </h1>
          </div>

          <h1 className="hidden font-display text-3xl font-bold lg:block">
            {mode === 'signin' ? 'Willkommen zurück' : 'Leg dein Regal an'}
          </h1>
          <p className="mb-6 mt-1 text-sm text-brand-900/50 dark:text-paper-200/50">
            {mode === 'signin'
              ? 'Melde dich an, um deine Bibliothek zu öffnen.'
              : 'Erstelle ein Konto und starte deine Sammlung.'}
          </p>

          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-2xl bg-ember-100 p-3 text-xs text-ember-900">
              Supabase ist noch nicht konfiguriert. Trage <code>VITE_SUPABASE_URL</code>{' '}
              und <code>VITE_SUPABASE_ANON_KEY</code> ein.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="input"
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              className="input"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button type="submit" className="btn-primary w-full !py-3" disabled={loading}>
              {loading ? 'Moment …' : mode === 'signin' ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-ember-600">{error}</p>}
          {message && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
          )}

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
            className="mt-5 w-full text-center text-sm font-medium text-brand-600 hover:text-ember-500 hover:underline dark:text-brand-300"
          >
            {mode === 'signin'
              ? 'Noch kein Konto? Jetzt registrieren'
              : 'Schon ein Konto? Anmelden'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, text }: { icon: 'camera' | 'stack' | 'sparkle'; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} className="h-4 w-4 text-ember-300" />
      <span>{text}</span>
    </div>
  )
}
