import { useMemo } from 'react'
import type { Book } from '../types'
import { SHELF_STATUSES } from '../types'
import { Icon } from './Icon'
import { StarRating } from './StarRating'
import { ProgressRing } from './ProgressRing'

// Umfassendes Statistik-Panel über die ganze Bibliothek.
export function StatsPanel({ books, onClose }: { books: Book[]; onClose: () => void }) {
  const s = useMemo(() => computeStats(books), [books])

  return (
    <div
      className="overlay-in fixed inset-0 z-50 flex items-end justify-center bg-night-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[92vh] w-full max-w-2xl animate-fade-up overflow-y-auto rounded-b-none rounded-t-3xl p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Icon name="chart" className="h-6 w-6 text-ember-500" /> Deine Statistiken
          </h2>
          <button onClick={onClose} className="btn-ghost !rounded-full !px-3" aria-label="Schließen">
            <Icon name="close" />
          </button>
        </div>

        {books.length === 0 ? (
          <p className="py-10 text-center text-brand-900/50 dark:text-paper-200/50">
            Noch keine Daten – füge zuerst Bücher hinzu.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Überblick + Ring */}
            <section className="flex flex-wrap items-center gap-5 rounded-2xl bg-gradient-to-br from-brand-700 to-night-900 p-5 text-white">
              <ProgressRing value={s.pctRead} sublabel="Regal gelesen" size={112} stroke={11} />
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric value={s.total} label="Bücher gesamt" />
                <Metric value={s.shelf} label="Im Regal" />
                <Metric value={s.read} label="Gelesen" />
                <Metric value={s.wishlist} label="Wunschliste" />
              </div>
            </section>

            {/* Kennzahlen */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard value={s.reading} label="Lese ich gerade" />
              <StatCard value={s.owned} label="Ungelesen im Regal" />
              <StatCard
                value={s.avgRating ? s.avgRating.toFixed(1) : '–'}
                label={`⌀ Bewertung (${s.ratedCount})`}
              />
              <StatCard value={s.pagesRead.toLocaleString('de-DE')} label="Gelesene Seiten" />
              <StatCard value={s.avgPages || '–'} label="⌀ Seiten/Buch" />
              <StatCard value={s.longest?.pages || '–'} label="Dickstes Buch" />
              <StatCard value={s.uniqueAuthors} label="Autor:innen" />
              <StatCard value={s.uniqueCategories} label="Kategorien" />
            </section>

            {/* Bewertungsverteilung */}
            {s.ratedCount > 0 && (
              <Section title="Bewertungsverteilung">
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <div key={n} className="flex items-center gap-3">
                      <div className="flex w-16 shrink-0 items-center gap-1 text-xs font-semibold">
                        {n} <Icon name="sparkle" className="h-3 w-3 text-ember-400" />
                      </div>
                      <Bar value={s.ratingDist[n] ?? 0} max={s.ratingMax} tint="from-ember-400 to-ember-600" />
                      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-brand-900/50 dark:text-paper-200/50">
                        {s.ratingDist[n] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Status-Verteilung */}
            <Section title="Status-Verteilung">
              <div className="space-y-1.5">
                {s.statusRows.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs font-medium">{row.label}</span>
                    <Bar value={row.count} max={s.total} tint={row.tint} />
                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-brand-900/50 dark:text-paper-200/50">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Top-Autoren */}
            {s.topAuthors.length > 0 && (
              <Section title="Meistgelesene Autor:innen">
                <div className="space-y-1.5">
                  {s.topAuthors.map((a) => (
                    <div key={a.name} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-xs font-medium" title={a.name}>
                        {a.name}
                      </span>
                      <Bar value={a.count} max={s.topAuthors[0].count} tint="from-brand-400 to-brand-600" />
                      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-brand-900/50 dark:text-paper-200/50">
                        {a.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Top-Kategorien */}
            {s.topCategories.length > 0 && (
              <Section title="Häufigste Kategorien">
                <div className="flex flex-wrap gap-2">
                  {s.topCategories.map((c) => (
                    <span
                      key={c.name}
                      className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-white/10 dark:text-paper-200"
                    >
                      {c.name} · {c.count}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Bestbewertete Bücher */}
            {s.topRated.length > 0 && (
              <Section title="Deine Lieblinge (bestbewertet)">
                <div className="space-y-2">
                  {s.topRated.map((b) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-gradient-to-br from-brand-200 to-brand-400 dark:from-brand-800 dark:to-night-900">
                        {b.cover_url && (
                          <img src={b.cover_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold">{b.title}</p>
                        <StarRating value={b.rating} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Erscheinungs-Jahrzehnte */}
            {s.decades.length > 0 && (
              <Section title="Nach Jahrzehnt">
                <div className="space-y-1.5">
                  {s.decades.map((d) => (
                    <div key={d.decade} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-xs font-medium">{d.decade}er</span>
                      <Bar value={d.count} max={s.decadeMax} tint="from-emerald-400 to-emerald-600" />
                      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-brand-900/50 dark:text-paper-200/50">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-900/45 dark:text-paper-200/45">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Bar({ value, max, tint }: { value: number; max: number; tint: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-900/10 dark:bg-white/10">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tint} transition-[width] duration-500`}
        style={{ width: `${pct}%`, transitionTimingFunction: 'var(--ease-out)' }}
      />
    </div>
  )
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur">
      <div className="font-display text-xl font-black leading-none">{value}</div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/55">
        {label}
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl border border-brand-900/[0.06] bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="font-display text-xl font-black leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-medium text-brand-900/50 dark:text-paper-200/50">
        {label}
      </div>
    </div>
  )
}

function computeStats(books: Book[]) {
  const total = books.length
  const by = (st: string) => books.filter((b) => b.status === st).length
  const read = by('read')
  const reading = by('reading')
  const owned = by('owned')
  const wishlist = by('wishlist')
  const shelf = books.filter((b) => SHELF_STATUSES.includes(b.status)).length

  const rated = books.filter((b) => (b.rating ?? 0) > 0)
  const avgRating = rated.length
    ? rated.reduce((a, b) => a + (b.rating ?? 0), 0) / rated.length
    : 0
  const ratingDist: Record<number, number> = {}
  for (const b of rated) ratingDist[b.rating!] = (ratingDist[b.rating!] ?? 0) + 1
  const ratingMax = Math.max(1, ...Object.values(ratingDist))

  const readBooks = books.filter((b) => b.status === 'read')
  const pagesRead = readBooks.reduce((a, b) => a + (b.page_count ?? 0), 0)
  const readWithPages = readBooks.filter((b) => b.page_count)
  const avgPages = readWithPages.length
    ? Math.round(pagesRead / readWithPages.length)
    : 0
  const longest = books
    .filter((b) => b.page_count)
    .sort((a, b) => (b.page_count ?? 0) - (a.page_count ?? 0))[0]

  const authorCount = new Map<string, number>()
  for (const b of books) for (const a of b.authors) authorCount.set(a, (authorCount.get(a) ?? 0) + 1)
  const topAuthors = [...authorCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const catCount = new Map<string, number>()
  for (const b of books) for (const c of b.categories) catCount.set(c, (catCount.get(c) ?? 0) + 1)
  const topCategories = [...catCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topRated = [...rated]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.title.localeCompare(b.title))
    .slice(0, 5)

  const decadeCount = new Map<number, number>()
  for (const b of books) {
    const m = b.published_date?.match(/\d{4}/)
    if (m) {
      const dec = Math.floor(parseInt(m[0], 10) / 10) * 10
      decadeCount.set(dec, (decadeCount.get(dec) ?? 0) + 1)
    }
  }
  const decades = [...decadeCount.entries()]
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => a.decade - b.decade)
  const decadeMax = Math.max(1, ...decades.map((d) => d.count))

  const statusRows = [
    { label: 'Gelesen', count: read, tint: 'from-emerald-400 to-emerald-600' },
    { label: 'Lese ich', count: reading, tint: 'from-ember-400 to-ember-600' },
    { label: 'Ungelesen', count: owned, tint: 'from-brand-400 to-brand-600' },
    { label: 'Wunschliste', count: wishlist, tint: 'from-pink-400 to-pink-600' },
  ]

  return {
    total,
    read,
    reading,
    owned,
    wishlist,
    shelf,
    pctRead: shelf ? Math.round((read / shelf) * 100) : 0,
    avgRating,
    ratedCount: rated.length,
    ratingDist,
    ratingMax,
    pagesRead,
    avgPages,
    longest: longest ? { pages: longest.page_count } : null,
    uniqueAuthors: authorCount.size,
    uniqueCategories: catCount.size,
    topAuthors,
    topCategories,
    topRated,
    decades,
    decadeMax,
    statusRows,
  }
}
