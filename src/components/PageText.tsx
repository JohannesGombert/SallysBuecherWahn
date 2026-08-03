// Dekorativer, leicht verschwommener Buchtext hinter dem Inhalt.
// Eigener, neutraler Fülltext (kein urheberrechtlich geschützter Inhalt).
const PARAGRAPHS = [
  'Es war die Stunde zwischen den Zeilen, in der die Bibliothek zu atmen begann. Wer lange genug zwischen den Regalen verweilte, hörte das leise Rascheln der Seiten, als tauschten die Geschichten im Halbdunkel ihre Geheimnisse aus. Sally strich mit dem Finger über die Buchrücken und spürte, wie jedes Buch eine eigene Wärme trug.',
  'Manche Bände waren gelesen und geliebt, ihre Ecken weich vom vielen Umblättern; andere warteten noch ungeöffnet auf den ersten mutigen Leser. Zwischen Wunsch und Besitz lag nur ein schmaler Streifen Zeit, und die Sammlung wuchs, wie ein Garten wächst: langsam, geduldig, voller Überraschungen.',
  'An Abenden wie diesem, wenn das Licht golden durch die Fenster fiel, schien es, als könnte man in jedes Buch hineintreten wie in einen anderen Raum. Ein Kapitel hier, ein Halbsatz dort, und schon war man fort, getragen von Worten, die jemand vor langer Zeit sorgfältig aneinandergereiht hatte.',
  'Und so blieb am Ende immer die Frage, welches Buch als Nächstes an der Reihe wäre. Denn eine Bibliothek ist niemals fertig; sie ist ein Versprechen an das eigene zukünftige Ich, das noch so vieles lesen, entdecken und wieder vergessen wird, nur um es aufs Neue zu lieben.',
]

export function PageText() {
  return (
    <div className="page-text" aria-hidden="true">
      {[...PARAGRAPHS, ...PARAGRAPHS].map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}
