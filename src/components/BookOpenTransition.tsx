import { Logo } from './Logo'

// Vollbild-Übergang: ein geschlossenes Buch schlägt auf und der Blick
// zoomt „in die Seiten" – wird beim erfolgreichen Login kurz eingeblendet.
export function BookOpenTransition() {
  return (
    <div className="book-overlay fixed inset-0 z-[60] flex items-center justify-center bg-night-950">
      <div className="book-scene">
        <div className="book-3d relative h-[420px] w-[300px] max-w-[80vw]">
          {/* Innenseiten (werden sichtbar, während der Deckel aufklappt) */}
          <div className="absolute inset-0 overflow-hidden rounded-r-lg rounded-l-sm bg-gradient-to-br from-paper-100 to-paper-200 shadow-book-lg">
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/15 to-transparent" />
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="font-display text-xl font-bold italic text-brand-800">
                Kapitel 1
              </span>
              <p className="text-sm text-brand-900/50">Deine Bibliothek öffnet sich …</p>
              <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-brand-200">
                <div className="h-full w-1/2 animate-[shimmer_1s_linear_infinite] bg-gradient-to-r from-transparent via-brand-500 to-transparent bg-[length:200%_100%]" />
              </div>
            </div>
          </div>

          {/* Buchdeckel (klappt auf) */}
          <div className="book-cover-3d absolute inset-0 overflow-hidden rounded-r-lg rounded-l-sm bg-gradient-to-br from-brand-700 via-brand-800 to-night-900">
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/15 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Logo className="h-16 w-16 drop-shadow-[0_8px_24px_rgba(240,130,60,0.45)]" />
              <h2 className="font-display text-2xl font-black leading-tight text-white">
                Sallys
                <br />
                BücherWahn
              </h2>
              <div className="mt-1 h-px w-16 bg-ember-400/60" />
              <span className="text-xs uppercase tracking-[0.25em] text-ember-300/80">
                Bibliothek
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
