import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_SETTINGS, type TrackingSettings } from '../lib/settings'
import { deleteAllBooks } from '../lib/booksRepo'
import { Sheet } from './Sheet'
import { THEMES, setTheme, useTheme, type Theme } from '../lib/theme'

/** Jede Leseratte entscheidet selbst, was das Grimoire mitschreibt. */
export function Settings({
  settings,
  onReset,
  onClose,
}: {
  settings: TrackingSettings
  onReset: () => void
  onClose: () => void
}) {
  const [s, setS] = useState(settings)
  const [target, setTarget] = useState(String(settings.goalTarget))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const targetNum = Number(target)
  const targetValid = Number.isInteger(targetNum) && targetNum > 0 && targetNum <= 100000

  async function save() {
    if (s.goal && !targetValid) return // Hinweis steht schon unter dem Feld
    setSaving(true)
    setError(null)
    const tracking = { ...s, finishedDate: s.finishedDate || s.goal, goalTarget: targetValid ? targetNum : s.goalTarget }
    const { error } = await supabase.auth.updateUser({ data: { tracking } })
    setSaving(false)
    if (error) setError(error.message)
    else onClose()
  }

  return (
    <Sheet title="Einstellungen" onClose={onClose}>
      <DesignPicker />

      <h3 className="rubric mt-8">Was das Grimoire mitschreibt</h3>
      <p className="pt-1 italic text-ivory-200">Schalte nur ein, was du verfolgen möchtest. Du kannst es jederzeit wieder ändern.</p>

      <div className="mt-5 space-y-3">
        <Toggle
          label="Datum des Auslesens"
          hint="Setzt du ein Buch auf „Gelesen“, merkt sich das Grimoire den Tag. Du kannst ihn auf der Buchseite ändern."
          on={s.finishedDate || s.goal}
          locked={s.goal}
          lockedHint="Wird für das Jahresziel gebraucht."
          onChange={(v) => setS({ ...s, finishedDate: v })}
        />
        <Toggle
          label="Lesefortschritt"
          hint="Trag bei Büchern, die du gerade liest, deine aktuelle Seite ein."
          on={s.progress}
          onChange={(v) => setS({ ...s, progress: v })}
        />
        <Toggle
          label="Jahresziel"
          hint="Lege fest, wie viele Bücher oder Seiten du dieses Jahr lesen willst. Der Mond zeigt dann, wie weit du bist."
          on={s.goal}
          onChange={(v) => setS({ ...s, goal: v })}
        />
      </div>

      {s.goal && (
        <div className="animate-rise mt-4 rounded-xl border border-gold-400/20 bg-night-950/40 p-4">
          <p className="rubric mb-3">Mein Ziel für {new Date().getFullYear()}</p>
          <div className="flex flex-wrap items-center gap-3">
            <label>
              <span className="sr-only">Anzahl</span>
              <input
                className="field !w-28 !py-2 text-center"
                type="number"
                inputMode="numeric"
                min={1}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                aria-invalid={!targetValid}
              />
            </label>
            <div className="flex gap-2" role="radiogroup" aria-label="Zielart">
              {(['books', 'pages'] as const).map((t) => (
                <button
                  key={t}
                  role="radio"
                  aria-checked={s.goalType === t}
                  onClick={() => setS({ ...s, goalType: t })}
                  className={`tab ${s.goalType === t ? 'tab-on' : 'tab-off'}`}
                >
                  {t === 'books' ? 'Bücher' : 'Seiten'}
                </button>
              ))}
            </div>
          </div>
          {!targetValid && <p className="mt-2 text-sm text-danger">Gib eine ganze Zahl über 0 ein.</p>}
          <p className="mt-3 text-sm italic text-ivory-300">
            Es zählen Bücher mit Status „Gelesen“ und einem Auslese-Datum in diesem Jahr.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-danger">{error}</p>}

      <div className="mt-6 flex justify-end gap-2 border-t border-gold-400/15 pt-5">
        <button onClick={onClose} className="btn text-ivory-200 hover:text-ivory-50">
          Abbrechen
        </button>
        <button onClick={save} className="btn-gold" disabled={saving}>
          {saving ? 'Speichert …' : 'Speichern'}
        </button>
      </div>

      <ResetZone
        onDone={() => {
          onReset()
          onClose()
        }}
      />
    </Sheet>
  )
}

function Toggle({
  label,
  hint,
  on,
  locked = false,
  lockedHint,
  onChange,
}: {
  label: string
  hint: string
  on: boolean
  locked?: boolean
  lockedHint?: string
  onChange: (v: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-disabled={locked}
      onClick={() => !locked && onChange(!on)}
      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
        on ? 'border-gold-400/45 bg-gold-400/[0.06]' : 'border-veil/10 hover:border-gold-400/30'
      } ${locked ? 'cursor-default' : ''}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ivory-50">{label}</span>
        <span className="mt-0.5 block text-[15px] leading-snug text-ivory-300">{locked && lockedHint ? lockedHint : hint}</span>
      </span>
      <span
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full border transition ${
          on ? 'border-gold-300/80 bg-gold-400/70' : 'border-veil/15 bg-night-950/60'
        } ${locked ? 'opacity-60' : ''}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 h-[22px] w-[22px] rounded-full shadow transition-all ${
            on ? 'left-[22px] bg-ivory-50' : 'left-0.5 bg-ivory-300'
          }`}
        />
      </span>
    </button>
  )
}

/** Design wechseln: wirkt sofort und wird im Konto gespeichert. */
function DesignPicker() {
  const theme = useTheme()
  const [error, setError] = useState<string | null>(null)

  async function choose(t: Theme) {
    if (t === theme) return
    const before = theme
    setTheme(t)
    setError(null)
    const { error } = await supabase.auth.updateUser({ data: { theme: t } })
    if (error) {
      setTheme(before)
      setError(`Design nicht gespeichert: ${error.message}`)
    }
  }

  return (
    <section className="pt-1">
      <h3 className="rubric">Design</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Design">
        {THEMES.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={theme === t.id}
            onClick={() => choose(t.id)}
            className={`rounded-xl border p-3 text-left transition ${
              theme === t.id ? 'border-gold-300/80 bg-gold-400/10' : 'border-veil/10 hover:border-gold-400/40'
            }`}
          >
            <ThemePreview id={t.id} />
            <span className="mt-2.5 block font-medium text-ivory-50">{t.name}</span>
            <span className="block text-[15px] leading-snug text-ivory-300">{t.hint}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-danger">{error}</p>}
    </section>
  )
}

// Feste Farben je Design, damit jede Vorschau unabhängig vom aktiven Design stimmt
const PREVIEW: Record<Theme, { sky: [string, string]; bar: string; accent: string; light: string; covers: string[] }> = {
  nacht: { sky: ['#18224a', '#060916'], bar: '#0b1024', accent: '#d9b25f', light: '#fbf6ea', covers: ['#22336b', '#5e2a33', '#3b2a5e'] },
  wald: { sky: ['#1a3324', '#07120d'], bar: '#0c1a13', accent: '#cc8752', light: '#f4f7c4', covers: ['#2f4a2c', '#5a3a22', '#2e4f45'] },
  rose: { sky: ['#fcf6f1', '#f1e0d7'], bar: '#f6ece6', accent: '#b9667f', light: '#5b3e4d', covers: ['#e3b5c1', '#d8c3e0', '#efd9c2'] },
}
const PREVIEW_PETALS = [[30, 30, 20], [110, 22, 70], [196, 52, -30], [44, 84, 110], [150, 96, 40]]
const PREVIEW_STARS = [[18, 22], [52, 16], [96, 26], [140, 14], [176, 30], [34, 40], [120, 44], [206, 46]]
const PREVIEW_FIRS = [[8, 34], [26, 46], [44, 30], [196, 38], [214, 50], [232, 32]]

/** Miniatur der Bibliothek im jeweiligen Design: Kopfzeile, Himmel, drei Bücher, Knopf. */
function ThemePreview({ id }: { id: Theme }) {
  const c = PREVIEW[id]
  const gid = `preview-${id}`
  return (
    <svg viewBox="0 0 240 110" className="block w-full rounded-lg ring-1 ring-veil/10" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.sky[0]} />
          <stop offset="1" stopColor={c.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="240" height="110" fill={`url(#${gid})`} />
      {id === 'rose' ? (
        <>
          <path d="M0 16L70 16L20 110L0 110Z" fill="#fff1d6" opacity=".55" />
          <path d="M84 16L110 16L56 110L36 110Z" fill="#fff1d6" opacity=".35" />
          {PREVIEW_PETALS.map(([x, y, r]) => (
            <path key={x} d="M0 5C-3 3-3-1-1-3C0-2 1-2 2-3C4-1 4 3 0 5Z" transform={`translate(${x} ${y}) rotate(${r}) scale(1.4)`} fill="#e8a5b9" />
          ))}
          <path d="M214 104C206 92 222 84 214 72" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
        </>
      ) : id === 'nacht' ? (
        <>
          {PREVIEW_STARS.map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="0.9" fill="#fff" opacity=".8" />
          ))}
          <path d="M150 34l38-14" stroke="#cfe0ff" strokeWidth="1" strokeLinecap="round" opacity=".7" />
          <circle cx="212" cy="26" r="9" fill="#cfe0ff" />
          <circle cx="216" cy="23" r="8" fill={c.sky[0]} />
        </>
      ) : (
        <>
          <circle cx="212" cy="26" r="9" fill="#dfe6cf" opacity=".35" />
          {PREVIEW_FIRS.map(([x, h]) => (
            <path key={x} d={`M${x} ${110 - h}l${h * 0.3} ${h}h-${h * 0.6}z`} fill="#102a1c" />
          ))}
          {PREVIEW_STARS.map(([x, y]) => (
            <circle key={x} cx={x + 6} cy={y + 34} r="1.2" fill={c.light} opacity=".85" />
          ))}
          <ellipse cx="120" cy="104" rx="140" ry="10" fill="#cfe0cf" opacity=".12" />
        </>
      )}
      <rect width="240" height="16" fill={c.bar} opacity=".9" />
      <circle cx="10" cy="8" r="4" fill={c.accent} />
      <rect x="18" y="6" width="44" height="4" rx="2" fill={c.accent} opacity=".85" />
      {c.covers.map((col, i) => (
        <g key={col}>
          <rect x={62 + i * 40} y="30" width="30" height="45" rx="2" fill={col} stroke={c.accent} strokeOpacity=".7" />
          <rect x={68 + i * 40} y="80" width="18" height="2.5" rx="1" fill={c.light} opacity=".6" />
        </g>
      ))}
      <rect x="182" y="90" width="48" height="12" rx="6" fill={c.accent} />
    </svg>
  )
}

const CONFIRM_WORD = 'ZURÜCKSETZEN'

/** Löscht alle Bücher und setzt die Einstellungen auf Anfang – nur nach Eintippen des Bestätigungsworts. */
function ResetZone({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [word, setWord] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmed = word.trim().toUpperCase() === CONFIRM_WORD

  async function reset() {
    if (!confirmed) return
    setBusy(true)
    setError(null)
    try {
      await deleteAllBooks()
      const { error } = await supabase.auth.updateUser({ data: { tracking: DEFAULT_SETTINGS } })
      if (error) throw error
      onDone()
    } catch (e: any) {
      setError(`Zurücksetzen fehlgeschlagen: ${e?.message ?? e}`)
      setBusy(false)
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-danger/30 bg-danger/[0.04] p-4">
      <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-danger">Grimoire zurücksetzen</h3>
      <p className="mt-1 text-[15px] leading-snug text-ivory-300">
        Löscht alle Bücher in deinem Grimoire samt Bewertungen, Notizen und Lesedaten und setzt diese Einstellungen auf
        Anfang. Dein Konto und dein Name bleiben. Das lässt sich nicht rückgängig machen.
      </p>

      {!open ? (
        <button onClick={() => setOpen(true)} className="btn mt-3 border border-danger/50 text-danger hover:bg-danger/10">
          Grimoire zurücksetzen …
        </button>
      ) : (
        <div className="animate-rise mt-3">
          <label className="block">
            <span className="text-[15px] text-ivory-200">
              Tippe <strong className="font-display tracking-wider text-danger">{CONFIRM_WORD}</strong> ein, um zu bestätigen:
            </span>
            <input
              className="field mt-2 !py-2 uppercase tracking-wider"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={word.length > 0 && !confirmed}
            />
          </label>
          {error && <p className="mt-2 text-danger">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={reset}
              disabled={!confirmed || busy}
              className="btn border border-danger/70 bg-danger/15 text-danger hover:bg-danger/25"
            >
              {busy ? 'Wird zurückgesetzt …' : 'Endgültig zurücksetzen'}
            </button>
            <button
              onClick={() => {
                setOpen(false)
                setWord('')
                setError(null)
              }}
              className="btn text-ivory-200 hover:text-ivory-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
