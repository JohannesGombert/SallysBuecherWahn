import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Icon } from './Icon'
import { Logo } from './Logo'

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
    <div className="desk flex min-h-screen items-center justify-center p-4 sm:p-8">
      {/* Die ganze Seite ist ein geschlossenes Buch */}
      <div className="closed-book relative flex min-h-[86vh] w-full max-w-3xl flex-col items-center justify-center overflow-hidden rounded-l-md rounded-r-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-night-900 px-6 py-12 pl-10 text-center sm:px-12">
        {/* Buchrücken links */}
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/30 via-white/10 to-transparent" />
        <div className="absolute inset-y-0 left-6 w-px bg-white/10" />
        {/* Seitenkanten rechts & unten */}
        <div className="edge-right" aria-hidden="true" />
        <div className="edge-bottom" aria-hidden="true" />
        {/* Prägungs-Schimmer */}
        <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-ember-500/20 blur-3xl" />

        <div className="relative flex w-full max-w-sm flex-col items-center">
          <Logo className="h-16 w-16 drop-shadow-[0_10px_28px_rgba(240,130,60,0.4)]" />
          <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            Sallys BücherWahn
          </h1>
          <p className="mt-2 max-w-xs text-sm italic text-ember-200/80">
            „Jedes Buch. Deine Geschichte."
          </p>
          <div className="my-6 h-px w-24 bg-white/20" />

          {!isSupabaseConfigured && (
            <div className="mb-4 w-full rounded-2xl border border-ember-400/30 bg-ember-500/10 p-3 text-xs text-ember-200">
              Supabase ist noch nicht konfiguriert.
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-3 text-left">
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
            <button type="submit" className="btn-accent w-full !py-3.5" disabled={loading}>
              {loading ? 'Moment …' : mode === 'signin' ? 'Buch aufschlagen' : 'Konto erstellen'}
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
            className="mt-5 text-sm font-medium text-brand-200 transition hover:text-ember-300 hover:underline"
          >
            {mode === 'signin'
              ? 'Noch kein Konto? Jetzt registrieren'
              : 'Schon ein Konto? Anmelden'}
          </button>

          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-white/40">
            <Feature icon="camera" text="Scannen" />
            <Feature icon="stack" text="Regale" />
            <Feature icon="sparkle" text="Bewerten" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, text }: { icon: 'camera' | 'stack' | 'sparkle'; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon name={icon} className="h-4 w-4 text-ember-300" />
      <span>{text}</span>
    </div>
  )
}
