import type { ReactNode } from 'react'
import type { LibraryStats } from '../lib/stats'
import { STATUS_LABELS } from '../types'
import { BookCover } from './BookCover'
import { MoonPhase } from './MoonPhase'
import { Sheet } from './Sheet'
import { Sigil } from './Sigil'
import { STATUS_SIGIL } from './status'

const BAR_TINT: Record<string, string> = {
  read: 'bg-moss',
  reading: 'bg-flame',
  owned: 'bg-moon-300',
  wishlist: 'bg-rose',
}

/** Die Chronik: alle Statistiken der Bibliothek. */
export function Chronicle({ s, onClose }: { s: LibraryStats; onClose: () => void }) {
  return (
    <Sheet title="Chronik deines Grimoires" onClose={onClose} wide>
      {s.total === 0 ? (
        <p className="py-10 text-center italic text-ivory-300">Noch keine Einträge – schreib zuerst ein Buch ein.</p>
      ) : (
        <div className="space-y-7 pt-2">
          <section className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <MoonPhase pct={s.pctRead} size={104} />
              <div>
                <p className="font-display text-4xl font-bold text-gold-200">{s.pctRead} %</p>
                <p className="italic text-ivory-300">des Regals gelesen</p>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              <Figure value={s.total} label="Bände gesamt" />
              <Figure value={s.shelf} label="im Regal" />
              <Figure value={s.read} label="gelesen" />
              <Figure value={s.wishlist} label="ersehnt" />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gold-400/15 bg-gold-400/15 sm:grid-cols-4">
            <Cell value={s.reading} label="lese ich gerade" />
            <Cell value={s.owned} label="ungelesen im Regal" />
            <Cell value={s.avgRating ? s.avgRating.toFixed(1) : '–'} label={`⌀ Sterne (${s.ratedCount})`} />
            <Cell value={s.pagesRead.toLocaleString('de-DE')} label="Seiten gelesen" />
            <Cell value={s.avgPages || '–'} label="⌀ Seiten pro Buch" />
            <Cell value={s.longest?.pages || '–'} label="dickstes Buch" />
            <Cell value={s.uniqueAuthors} label="Autor:innen" />
            <Cell value={s.uniqueCategories} label="Kategorien" />
          </section>

          <Section title="Status-Verteilung">
            {s.statusRows.map((row) => (
              <Row key={row.status} label={STATUS_LABELS[row.status]} value={row.count} max={Math.max(1, s.total)} tint={BAR_TINT[row.status]}>
                <Sigil name={STATUS_SIGIL[row.status].sigil} className={`h-4 w-4 ${STATUS_SIGIL[row.status].color}`} />
              </Row>
            ))}
          </Section>

          {s.ratedCount > 0 && (
            <Section title="Bewertungen">
              {[5, 4, 3, 2, 1].map((n) => (
                <Row key={n} label={`${n} Sterne`} value={s.ratingDist[n] ?? 0} max={s.ratingMax} tint="bg-gold-300">
                  <Sigil name="star" className="h-4 w-4 fill-gold-300 text-gold-300" />
                </Row>
              ))}
            </Section>
          )}

          {s.topRated.length > 0 && (
            <Section title="Deine Lieblinge">
              <ol className="space-y-2">
                {s.topRated.map((b, i) => (
                  <li key={b.id} className="flex items-center gap-3">
                    <span className="w-5 text-right font-display text-gold-300">{i + 1}</span>
                    <div className="h-12 w-8 shrink-0 overflow-hidden rounded-sm ring-1 ring-gold-400/30">
                      <BookCover book={b} compact />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{b.title}</p>
                      <p className="truncate text-sm italic text-ivory-300">{b.authors.join(', ')}</p>
                    </div>
                    <span className="shrink-0 font-display text-gold-200">{b.rating}★</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {s.topAuthors.length > 0 && (
            <Section title="Meistgelesene Autor:innen">
              {s.topAuthors.map((a) => (
                <Row key={a.name} label={a.name} value={a.count} max={s.topAuthors[0].count} tint="bg-moon-300" wideLabel />
              ))}
            </Section>
          )}

          {s.topCategories.length > 0 && (
            <Section title="Häufigste Kategorien">
              <div className="flex flex-wrap gap-2">
                {s.topCategories.map((c) => (
                  <span key={c.name} className="rounded-full border border-gold-400/25 px-3 py-1 text-[15px] text-ivory-200">
                    {c.name} <span className="text-gold-300">{c.count}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          {s.decades.length > 0 && (
            <Section title="Nach Jahrzehnt">
              <div className="flex h-32 items-end gap-1.5">
                {s.decades.map((d) => (
                  <div key={d.decade} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-gold-200">{d.count}</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-gold-600 to-gold-300"
                      style={{ height: `${Math.max(6, (d.count / s.decadeMax) * 80)}px` }}
                    />
                    <span className="text-[11px] text-ivory-300">{String(d.decade).slice(2)}er</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="rubric mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Figure({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-ivory-50">{value}</p>
      <p className="text-sm italic text-ivory-300">{label}</p>
    </div>
  )
}

function Cell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="bg-night-800 p-3.5">
      <p className="font-display text-xl font-bold text-gold-200">{value}</p>
      <p className="text-sm italic leading-tight text-ivory-300">{label}</p>
    </div>
  )
}

function Row({
  label,
  value,
  max,
  tint,
  wideLabel = false,
  children,
}: {
  label: string
  value: number
  max: number
  tint: string
  wideLabel?: boolean
  children?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex shrink-0 items-center gap-2 truncate text-[15px] ${wideLabel ? 'w-40' : 'w-32'}`}>
        {children}
        <span className="truncate">{label}</span>
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-veil/5">
        <div className={`h-full rounded-full ${tint}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-7 shrink-0 text-right text-[15px] tabular-nums text-ivory-200">{value}</span>
    </div>
  )
}
