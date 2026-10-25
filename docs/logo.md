# Logo „Siegel“ – Sallys BücherWahn

Briefing und Quellen zum Logo der App **Sallys BücherWahn**, zum Weiterbearbeiten in Claude Design.

## Worum es geht

Sallys BücherWahn ist eine Web-App, in der Leseratten ihre Bücher verwalten: scannen, einordnen (Wunschliste, Ungelesen, Lese ich, Gelesen), bewerten, Leseziele verfolgen. Das Design heißt **Nacht-Grimoire**: Die App ist ein Zauberbuch, das sich beim Login öffnet. Dazu gehören ein mitternachtsblauer Ledereinband, Goldprägung, ein Sternenhimmel mit Sternschnuppen und ein Mond, der den Lesefortschritt zeigt.

Das Logo soll **premium und gemütlich** wirken, perfekt für Leseratten: edel wie ein Exlibris-Stempel, warm wie Lesen bei Mondlicht.

## Konzept

Ein **Siegel**: doppelter Goldring mit vier kleinen Rauten an den Himmelsrichtungen. Darin schwebt frei eine **Mondsichel mit einem Stern** über einem **aufgeschlagenen Buch**.

- Mond und Buch berühren sich nicht. Der Abstand ist gewollt, das Vorgänger-Logo wirkte gequetscht.
- Das Buch ist weit aufgeschlagen, mit geschwungenen Seiten und angedeuteten Textzeilen.
- Die Mondsichel öffnet sich nach rechts oben, der Stern sitzt rechts daneben.

## Farben

| Rolle | Farbe | Hex |
|---|---|---|
| Gold hell (Verlauf oben) | Blattgold-Glanz | `#fbf1d4` |
| Gold mitte | Blattgold | `#d9b25f` |
| Gold dunkel (Verlauf unten) | Altgold | `#94702c` |
| Akzent (Rauten) | Gold hell | `#f0d99a` |
| Hintergrund | Mitternacht | `#0f1630` |
| Hintergrund dunkler | Nachthimmel | `#0b1024` |
| Text auf dunkel | Elfenbein | `#efe6d2` |

Der Goldverlauf läuft senkrecht von `#fbf1d4` über `#d9b25f` nach `#94702c`. Das Logo steht immer auf dunklem Nachtblau.

## Schrift (Wortmarke)

- **Cinzel**, 700, für „Sallys BücherWahn“, mit leichtem Zeichenabstand und Goldverlauf.
- **EB Garamond**, kursiv, für den Untertitel „Ein Zauberbuch für Leseratten“.

## Varianten

| Variante | Einsatz | Unterschiede |
|---|---|---|
| **Voll** | ab ca. 48 px: Login-Einband, Ladebildschirm, leeres Regal | doppelter Ring, Rauten, Textzeilen im Buch, feine Linien |
| **Klein** | unter 48 px: Kopfzeile (36 px) | nur äußerer Ring, kräftigere Linien, ohne Rauten und Textzeilen |
| **Favicon** | Browser-Tab, Startbildschirm-Symbol | wie Klein, auf abgerundetem nachtblauem Quadrat |

## Regeln

- Mindestgröße: Voll ab 48 px, Klein ab 24 px, Favicon ab 16 px.
- Schutzraum: rundherum mindestens 1/8 der Logobreite frei lassen.
- Nicht auf hellem Grund, nicht einfarbig schwarz, nicht verzerren.
- Mond und Buch nicht überlappen lassen.
- Keine weiteren Elemente in den Ring setzen.

## Wo das Logo im Code lebt

| Datei | Inhalt |
|---|---|
| `src/components/Emblem.tsx` | Komponente `Emblem` (Voll und mit `small` die kleine Variante), Goldverlauf per `useId` |
| `public/favicon.svg` | Favicon |
| `src/components/Grimoire.tsx` | Logo auf dem Login-Einband (64 px, leuchtet sanft) |
| `src/App.tsx` | Kopfzeile (36 px, Variante Klein), Ladebildschirm, leeres Regal |

Eine überarbeitete Fassung aus Claude Design wird übernommen, indem die SVG-Pfade in `Emblem.tsx` und `favicon.svg` ersetzt werden. Bitte die **viewBox `0 0 64 64`** beibehalten, dann passen alle Größen in der App.

## SVG-Quelle: Voll

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf1d4"/>
      <stop offset=".5" stop-color="#d9b25f"/>
      <stop offset="1" stop-color="#94702c"/>
    </linearGradient>
  </defs>
  <!-- Ringe und Rauten -->
  <circle cx="32" cy="32" r="29" fill="none" stroke="url(#gold)" stroke-width="1.4"/>
  <circle cx="32" cy="32" r="25.6" fill="none" stroke="#d9b25f" stroke-width=".6" opacity=".6"/>
  <path d="M32 1.6l1.4 1.4-1.4 1.4-1.4-1.4zM32 59.6l1.4 1.4-1.4 1.4-1.4-1.4zM1.6 32l1.4-1.4 1.4 1.4-1.4 1.4zM59.6 32l1.4-1.4 1.4 1.4-1.4 1.4z" fill="#f0d99a"/>
  <!-- Motiv, auf 66 % verkleinert und mittig gesetzt -->
  <g transform="translate(32 33) scale(.66) translate(-32 -31)">
    <path d="M33.5 9.5a10 10 0 1 0 8.2 15.9 8 8 0 1 1-8.2-15.9z" fill="url(#gold)"/>
    <path d="M46 7.5l1.1 3.1 3.1 1.1-3.1 1.1L46 15.9l-1.1-3.1-3.1-1.1 3.1-1.1z" fill="#fbf1d4"/>
    <g fill="none" stroke="url(#gold)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M32 52c-6-3.2-13.5-3.8-22-2V34c8.5-1.8 16-1.2 22 2 6-3.2 13.5-3.8 22-2v16c-8.5-1.8-16-1.2-22 2z"/>
      <path d="M32 36v16"/>
      <path d="M15 39.5c4.5-.8 8.5-.4 12 1M15 44c4.5-.8 8.5-.4 12 1M37 40.5c3.5-1.4 7.5-1.8 12-1M37 45c3.5-1.4 7.5-1.8 12-1" stroke-width="1.3" opacity=".55"/>
    </g>
  </g>
</svg>
```

## SVG-Quelle: Klein

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf1d4"/>
      <stop offset=".5" stop-color="#d9b25f"/>
      <stop offset="1" stop-color="#94702c"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="29" fill="none" stroke="url(#gold)" stroke-width="2.6"/>
  <g transform="translate(32 33) scale(.66) translate(-32 -31)">
    <path d="M33.5 9.5a10 10 0 1 0 8.2 15.9 8 8 0 1 1-8.2-15.9z" fill="url(#gold)"/>
    <path d="M46 7.5l1.1 3.1 3.1 1.1-3.1 1.1L46 15.9l-1.1-3.1-3.1-1.1 3.1-1.1z" fill="#fbf1d4"/>
    <g fill="none" stroke="url(#gold)" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M32 52c-6-3.2-13.5-3.8-22-2V34c8.5-1.8 16-1.2 22 2 6-3.2 13.5-3.8 22-2v16c-8.5-1.8-16-1.2-22 2z"/>
      <path d="M32 36v16"/>
    </g>
  </g>
</svg>
```

## SVG-Quelle: Favicon

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf1d4"/><stop offset=".5" stop-color="#d9b25f"/><stop offset="1" stop-color="#94702c"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#0f1630"/>
  <circle cx="32" cy="32" r="27" fill="none" stroke="url(#g)" stroke-width="3"/>
  <g transform="translate(32 33) scale(.62) translate(-32 -31)">
    <path d="M33.5 9.5a10 10 0 1 0 8.2 15.9 8 8 0 1 1-8.2-15.9z" fill="url(#g)"/>
    <path d="M46 7.5l1.1 3.1 3.1 1.1-3.1 1.1L46 15.9l-1.1-3.1-3.1-1.1 3.1-1.1z" fill="#fbf1d4"/>
    <g fill="none" stroke="url(#g)" stroke-width="4" stroke-linejoin="round">
      <path d="M32 52c-6-3.2-13.5-3.8-22-2V34c8.5-1.8 16-1.2 22 2 6-3.2 13.5-3.8 22-2v16c-8.5-1.8-16-1.2-22 2z"/>
      <path d="M32 36v16"/>
    </g>
  </g>
</svg>
```

## Ideen für Claude Design

Mögliche Aufträge, um das Siegel weiterzuentwickeln:

- „Verfeinere das Siegel: elegantere Mondsichel, gleichmäßigere Linienstärken, Buchseiten mit schönerem Schwung. Bleib bei viewBox 0 0 64 64 und den Goldfarben.“
- „Füge dem Ring eine dezente Gravur hinzu (feine Punktreihe oder Sternchen), ohne dass es ab 48 px unruhig wird.“
- „Entwirf eine liegende Wortmarke: Siegel links, ‚Sallys BücherWahn‘ in Cinzel rechts, Untertitel in EB Garamond kursiv.“
- „Teste das Logo in 16, 24, 36, 64 und 128 px auf #0f1630 und schlage für jede Größe die passende Variante vor.“
