import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { COVER_SIZE, GrimoireCover } from './Grimoire'
import { Sigil } from './Sigil'
import { Sky } from './Sky'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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
        const fn = firstName.trim()
        const ln = lastName.trim()
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: fn, last_name: ln, full_name: `${fn} ${ln}`.trim() } },
        })
        if (error) throw error
        // Ohne Session ist eine Bestätigungs-Mail nötig. Supabase meldet auch bei
        // bereits registrierter Adresse „Erfolg“, schickt dann aber keine Mail.
        if (!data.session) {
          setMessage(
            'Fast geschafft! Bestätige deine E-Mail über den Link, den wir dir geschickt haben (ggf. im Spam-Ordner). Hast du schon ein Grimoire, melde dich einfach an.',
          )
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (e: any) {
      setError(
        e?.message === 'Invalid login credentials'
          ? 'E-Mail oder Passwort stimmen nicht.'
          : (e?.message ?? 'Etwas ist schiefgelaufen.'),
      )
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
    setMessage(null)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-2 py-6">
      <Sky />
      <GrimoireCover className={`relative ${COVER_SIZE} animate-rise`}>
        {!isSupabaseConfigured && (
          <p className="mt-6 w-full rounded-xl border border-flame/40 bg-flame/10 p-3 text-sm text-flame">
            Supabase ist noch nicht konfiguriert.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 w-full space-y-3 text-left">
          {mode === 'signup' && (
            <div className="flex gap-3">
              <label className="w-full">
                <span className="sr-only">Vorname</span>
                <input className="field" placeholder="Vorname" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
              </label>
              <label className="w-full">
                <span className="sr-only">Nachname</span>
                <input className="field" placeholder="Nachname" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
              </label>
            </div>
          )}
          <label className="block">
            <span className="sr-only">E-Mail</span>
            <input className="field" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="block">
            <span className="sr-only">Passwort</span>
            <input
              className="field"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>
          <button type="submit" className="btn-gold !mt-5 w-full" disabled={loading}>
            {loading ? 'Einen Moment …' : mode === 'signin' ? 'Grimoire öffnen' : 'Grimoire anlegen'}
          </button>
        </form>

        <div aria-live="polite" className="w-full">
          {error && <p className="mt-4 text-danger">{error}</p>}
          {message && <p className="mt-4 text-moss">{message}</p>}
        </div>

        <button onClick={switchMode} className="mt-5 min-h-[44px] italic text-ivory-200 underline-offset-4 transition hover:text-gold-200 hover:underline">
          {mode === 'signin' ? 'Neu hier? Ein eigenes Grimoire anlegen' : 'Schon ein Grimoire? Anmelden'}
        </button>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ivory-300">
          <li className="flex items-center gap-1.5"><Sigil name="camera" className="h-4 w-4 text-gold-300" />Scannen</li>
          <li className="flex items-center gap-1.5"><Sigil name="tome" className="h-4 w-4 text-gold-300" />Sammeln</li>
          <li className="flex items-center gap-1.5"><Sigil name="star" className="h-4 w-4 text-gold-300" />Bewerten</li>
        </ul>
      </GrimoireCover>
    </main>
  )
}
