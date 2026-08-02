import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
          'Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.',
        )
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (e: any) {
      setError(e.message ?? 'Etwas ist schiefgelaufen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-sm p-8 shadow-book">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">📚</div>
          <h1 className="font-display text-3xl font-bold text-brand-700 dark:text-brand-300">
            Sallys BücherWahn
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Deine persönliche Bibliothek
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl bg-amber-100 p-3 text-xs text-amber-800">
            Supabase ist noch nicht konfiguriert. Trage <code>VITE_SUPABASE_URL</code>{' '}
            und <code>VITE_SUPABASE_ANON_KEY</code> in die <code>.env</code> ein.
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
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading
              ? 'Moment…'
              : mode === 'signin'
                ? 'Anmelden'
                : 'Konto erstellen'}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {message && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
            {message}
          </p>
        )}

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setMessage(null)
          }}
          className="mt-4 w-full text-center text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          {mode === 'signin'
            ? 'Noch kein Konto? Jetzt registrieren'
            : 'Schon ein Konto? Anmelden'}
        </button>
      </div>
    </div>
  )
}
