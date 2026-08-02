import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Icon } from './Icon'
import { Logo } from './Logo'
import KineticGrid from './KineticGrid'

const darkInput =
  'w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-ember-400 focus:ring-4 focus:ring-ember-400/20'

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
    <KineticGrid globalColor="brand">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
        {/* Kopf */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-14 w-14 animate-float drop-shadow-[0_8px_24px_rgba(240,130,60,0.35)]" />
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            Sallys BücherWahn
          </h1>
          <p className="mt-2 max-w-sm text-white/55">
            Jedes Buch. Deine Geschichte. Scanne, sammle und verfolge deine Bibliothek.
          </p>
        </div>

        {/* Buchdeckel als Login-Karte */}
        <div className="relative w-full max-w-sm overflow-hidden rounded-l-md rounded-r-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-night-900 p-7 pl-9 shadow-book-lg ring-1 ring-white/10">
          {/* Buchrücken links */}
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
          {/* Seitenkante rechts */}
          <div className="absolute inset-y-2 right-0 w-1.5 rounded-r-2xl bg-gradient-to-l from-paper-200/70 to-transparent" />
          <div className="mb-5">
            <h2 className="font-display text-xl font-bold text-white">
              {mode === 'signin' ? 'Willkommen zurück' : 'Leg dein Regal an'}
            </h2>
            <p className="mt-0.5 text-sm text-white/45">
              {mode === 'signin'
                ? 'Melde dich an, um deine Bibliothek zu öffnen.'
                : 'Erstelle ein Konto und starte deine Sammlung.'}
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-2xl border border-ember-400/30 bg-ember-500/10 p-3 text-xs text-ember-200">
              Supabase ist noch nicht konfiguriert. Trage <code>VITE_SUPABASE_URL</code>{' '}
              und <code>VITE_SUPABASE_ANON_KEY</code> ein.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className={darkInput}
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              className={darkInput}
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button type="submit" className="btn-accent w-full !py-3" disabled={loading}>
              {loading ? 'Moment …' : mode === 'signin' ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-ember-300">{error}</p>}
          {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
            className="mt-5 w-full text-center text-sm font-medium text-brand-200 transition hover:text-ember-300 hover:underline"
          >
            {mode === 'signin'
              ? 'Noch kein Konto? Jetzt registrieren'
              : 'Schon ein Konto? Anmelden'}
          </button>
        </div>

        {/* Feature-Zeile */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/45">
          <Feature icon="camera" text="Barcode scannen" />
          <Feature icon="stack" text="Regale & Status" />
          <Feature icon="sparkle" text="Bewerten & Notizen" />
        </div>

        <p className="mt-6 text-xs text-white/25">
          Tipp: Bewege den Cursor · klick irgendwohin ✨
        </p>
      </div>
    </KineticGrid>
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
