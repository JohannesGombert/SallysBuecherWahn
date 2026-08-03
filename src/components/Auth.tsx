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
    <div className="desk relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto p-4 sm:p-6">
      {/* Buch-Wrapper (begrenzt – füllt NICHT das Fenster) */}
      <div className="relative w-full max-w-[420px]">
        {/* Der Ledereinband */}
        <div className="leather-cover relative rounded-l-md rounded-r-[1.6rem] px-7 py-9 text-center shadow-[0_45px_90px_-30px_rgba(0,0,0,0.85)] sm:px-9">
          {/* Ledernarbung */}
          <div className="paper-grain rounded-l-md rounded-r-[1.6rem]" aria-hidden="true" />
          {/* Rücken-Bünde am linken Buchrand */}
          <div className="pointer-events-none absolute inset-y-6 left-1 w-3" aria-hidden="true">
            {[6, 28, 50, 72, 94].map((t) => (
              <div key={t} className="spine-band" style={{ top: `${t}%`, height: '24px' }} />
            ))}
          </div>
          {/* Metallschließen am rechten Buchrand */}
          <div className="clasp" style={{ top: '30%' }} aria-hidden="true" />
          <div className="clasp" style={{ top: '64%' }} aria-hidden="true" />
          {/* Geprägter Zierrahmen + Perlschnur */}
          <div className="engrave pointer-events-none absolute inset-3 rounded-[1.2rem]" aria-hidden="true" />
          <div className="beaded pointer-events-none absolute inset-4 rounded-[1rem] opacity-50" aria-hidden="true" />

          <div className="relative z-10">
            <GoldOrnament className="mx-auto h-8 w-40" />
            <Logo className="mx-auto mt-3 h-12 w-12 drop-shadow-[0_10px_28px_rgba(240,130,60,0.4)]" />
            <h1 className="gold-text mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
              Sallys BücherWahn
            </h1>
            <p className="mt-2 text-sm italic text-ember-200/70">
              „Jedes Buch. Deine Geschichte."
            </p>
            <GoldOrnament className="mx-auto my-5 h-5 w-32 opacity-90" />

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
