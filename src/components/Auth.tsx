import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Icon } from './Icon'
import { Logo } from './Logo'
import { GoldOrnament } from './GoldOrnament'

const darkInput =
  'w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-ember-400 focus:ring-4 focus:ring-ember-400/20'

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
          options: {
            data: {
              first_name: fn,
              last_name: ln,
              full_name: `${fn} ${ln}`.trim(),
            },
          },
        })
        if (error) throw error
        // Ist E-Mail-Bestätigung aus, gibt es sofort eine Session → direkt drin.
        // Sonst Hinweis anzeigen (Bestätigungs-Mail nötig).
        if (!data.session) {
          setMessage(
            'Fast geschafft! Bitte bestätige deine E-Mail über den Link, den wir dir geschickt haben. (Schau ggf. im Spam-Ordner.)',
          )
        }
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
    <div className="leather-cover relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8">
      {/* Ledernarbung */}
      <div className="paper-grain" aria-hidden="true" />

      {/* Rücken-Bünde links (Desktop) */}
      <div className="pointer-events-none absolute inset-y-12 left-2 hidden w-5 sm:block" aria-hidden="true">
        {[6, 27, 48, 69, 90].map((t) => (
          <div key={t} className="spine-band" style={{ top: `${t}%` }} />
        ))}
      </div>
      {/* Metallschließen rechts (Desktop) */}
      <div className="clasp hidden sm:block" style={{ top: '32%' }} aria-hidden="true" />
      <div className="clasp hidden sm:block" style={{ top: '62%' }} aria-hidden="true" />

      {/* Geprägte Doppel-Zierrahmen */}
      <div className="engrave pointer-events-none absolute inset-4 rounded-2xl sm:inset-7" aria-hidden="true" />
      <div className="engrave pointer-events-none absolute inset-[22px] rounded-xl sm:inset-11" aria-hidden="true" />

      {/* Zentrales, versenktes Prunkfeld mit Perlschnur-Rand */}
      <div className="relative z-10 w-full max-w-md">
        <div className="beaded rounded-[1.7rem] p-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
          <div className="engrave rounded-[1.4rem] bg-black/25 px-6 py-9 text-center sm:px-10">
            <GoldOrnament className="mx-auto h-9 w-44" />
            <Logo className="mx-auto mt-4 h-14 w-14 drop-shadow-[0_10px_28px_rgba(240,130,60,0.4)]" />
            <h1 className="gold-text mt-4 font-display text-4xl font-black tracking-tight sm:text-[2.75rem]">
              Sallys
              <br className="sm:hidden" /> BücherWahn
            </h1>
            <p className="mt-2 text-sm italic text-ember-200/70">
              „Jedes Buch. Deine Geschichte."
            </p>
            <GoldOrnament className="mx-auto my-6 h-6 w-36 opacity-90" />

            {!isSupabaseConfigured && (
              <div className="mb-4 w-full rounded-2xl border border-ember-400/30 bg-ember-500/10 p-3 text-xs text-ember-200">
                Supabase ist noch nicht konfiguriert.
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-3 text-left">
            {mode === 'signup' && (
              <div className="flex gap-3">
                <input
                  className={darkInput}
                  type="text"
                  placeholder="Vorname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
                <input
                  className={darkInput}
                  type="text"
                  placeholder="Nachname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>
            )}
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
