# Logo „Mondbuch“ – Sallys BücherWahn

Briefing und Quellen zum Logo der App **Sallys BücherWahn**, zum Weiterbearbeiten in Claude Design.

## Worum es geht

Sallys BücherWahn ist eine Web-App, in der Leseratten ihre Bücher verwalten: scannen, einordnen (Wunschliste, Ungelesen, Lese ich, Gelesen), bewerten, Leseziele verfolgen. Das Design heißt **Nacht-Grimoire**: Die App ist ein Zauberbuch, das sich beim Login öffnet. Dazu gehören ein mitternachtsblauer Ledereinband, Goldprägung, ein Sternenhimmel mit Sternschnuppen und ein Mond, der den Lesefortschritt zeigt.

Das Logo soll **premium und gemütlich** wirken, perfekt für Leseratten: edel wie ein Exlibris-Stempel, warm wie Lesen bei Mondlicht.

## Konzept

Eine **große Mondsichel**, die ein **aufgeschlagenes Buch** schützend umfängt, dazu ein **vierzackiger Stern** rechts oben. In der vollen Fassung funkeln drei kleine Sternpunkte im Inneren der Sichel, das Buch zeigt angedeutete Textzeilen.

- Die Sichel ist die äußere Form des Logos; einen zusätzlichen Ring gibt es nicht mehr.
- Das Buch sitzt rechts in der Öffnung der Sichel und berührt sie nicht.
- Die Fassung wurde mit Claude Design aus dem früheren „Siegel“ weiterentwickelt.

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
| **Voll** | ab ca. 48 px: Login-Einband, Ladebildschirm, leeres Regal | Sternpunkte, Textzeilen im Buch, feine Buchlinie (1,3) |
| **Klein** | unter 48 px: Kopfzeile (36 px) | ohne Sternpunkte und Textzeilen, kräftigere Buchlinie (2,2) |
| **Favicon** | Browser-Tab, Startbildschirm-Symbol | wie Klein, auf 86 % verkleinert, auf abgerundetem nachtblauem Quadrat |

## Regeln

- Mindestgröße: Voll ab 48 px, Klein ab 24 px, Favicon ab 16 px.
- Schutzraum: rundherum mindestens 1/8 der Logobreite frei lassen.
- Nicht auf hellem Grund, nicht einfarbig schwarz, nicht verzerren.
- Sichel und Buch nicht überlappen lassen.
- Keine weiteren Elemente in die Sichel setzen.

## Wo das Logo im Code lebt

| Datei | Inhalt |
|---|---|
| `src/components/Emblem.tsx` | Komponente `Emblem` (Voll und mit `small` die kleine Variante), Pfade als Konstanten, Goldverlauf per `useId`; in derselben Datei liegen `Flourish` und `Corners` (nicht löschen) |
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
  <!-- Mondsichel -->
  <path d="M31.21 4.01A28 28 0 1 0 59.13 38.92A23.5 23.5 0 1 1 31.21 4.01Z" fill="url(#gold)"/>
  <!-- Stern und Sternpunkte -->
  <path d="M46 11.6Q46.6 14.4 49.4 15Q46.6 15.6 46 18.4Q45.4 15.6 42.6 15Q45.4 14.4 46 11.6Z" fill="#fbf1d4"/>
  <circle cx="31" cy="17" r=".6" fill="#f0d99a"/>
  <circle cx="53" cy="24" r=".5" fill="#f0d99a"/>
  <circle cx="39" cy="20" r=".45" fill="#f0d99a"/>
  <!-- Buch -->
  <g transform="translate(37 34.5) scale(1.2) translate(-37 -34.5)" fill="none" stroke="url(#gold)" stroke-linejoin="round" stroke-linecap="round">
    <path d="M37 30.4C33.7 28.7 29.3 28.3 26 29V38C29.3 37.3 33.7 37.8 37 39.6ZM37 30.4C40.3 28.7 44.7 28.3 48 29V38C44.7 37.3 40.3 37.8 37 39.6ZM37 30.4V39.6" stroke-width="1.3"/>
    <path d="M28 31.6C30.4 31.2 32.8 31.4 35 32.2M28 34C30.4 33.6 32.8 33.8 35 34.6M46 31.6C43.6 31.2 41.2 31.4 39 32.2M46 34C43.6 33.6 41.2 33.8 39 34.6" stroke-width=".7" opacity=".55"/>
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
  <path d="M31.21 4.01A28 28 0 1 0 59.13 38.92A23.5 23.5 0 1 1 31.21 4.01Z" fill="url(#gold)"/>
  <path d="M46 11.6Q46.6 14.4 49.4 15Q46.6 15.6 46 18.4Q45.4 15.6 42.6 15Q45.4 14.4 46 11.6Z" fill="#fbf1d4"/>
  <path transform="translate(37 34.5) scale(1.2) translate(-37 -34.5)" d="M37 30.4C33.7 28.7 29.3 28.3 26 29V38C29.3 37.3 33.7 37.8 37 39.6ZM37 30.4C40.3 28.7 44.7 28.3 48 29V38C44.7 37.3 40.3 37.8 37 39.6ZM37 30.4V39.6" fill="none" stroke="url(#gold)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
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
  <g transform="translate(32 32) scale(.86) translate(-32 -32)">
    <path d="M31.21 4.01A28 28 0 1 0 59.13 38.92A23.5 23.5 0 1 1 31.21 4.01Z" fill="url(#g)"/>
    <path d="M46 11.6Q46.6 14.4 49.4 15Q46.6 15.6 46 18.4Q45.4 15.6 42.6 15Q45.4 14.4 46 11.6Z" fill="#fbf1d4"/>
    <path transform="translate(37 34.5) scale(1.2) translate(-37 -34.5)" d="M37 30.4C33.7 28.7 29.3 28.3 26 29V38C29.3 37.3 33.7 37.8 37 39.6ZM37 30.4C40.3 28.7 44.7 28.3 48 29V38C44.7 37.3 40.3 37.8 37 39.6ZM37 30.4V39.6" fill="none" stroke="url(#g)" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>
  </g>
</svg>
```

## Ideen für Claude Design

Mögliche Aufträge, um das Logo weiterzuentwickeln:

- „Verfeinere das Logo: gleichmäßigere Linienstärken zwischen Sichel und Buch, Buchseiten mit schönerem Schwung. Bleib bei viewBox 0 0 64 64 und den Goldfarben.“
- „Entwirf eine einfarbige Fassung (nur Gold, ohne Verlauf) für Stempel und Druck.“
- „Entwirf eine liegende Wortmarke: Logo links, ‚Sallys BücherWahn‘ in Cinzel rechts, Untertitel in EB Garamond kursiv.“
- „Teste das Logo in 16, 24, 36, 64 und 128 px auf #0f1630 und schlage für jede Größe die passende Variante vor.“
