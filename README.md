# 📚 Sallys BücherWahn

Eine moderne Web-App zum Verwalten und Tracken deiner Bibliothek – Bücher per
**Barcode scannen**, Details automatisch über die **ISBN** laden, nach Status
sortieren (Wunschliste, Im Regal, Lese ich, Gelesen), bewerten und Notizen machen.

Gebaut mit **React + TypeScript + Vite + Tailwind CSS**, Daten in der Cloud via
**Supabase**, gehostet auf **Netlify**.

---

## ✨ Funktionen

- 📷 **Barcode-Scanner** – ISBN direkt mit der Handykamera einlesen
- 🔎 **ISBN-/Titelsuche** – Buchdaten & Cover automatisch von Google Books und
  Open Library
- 🗂️ **Status & Regale** – Wunschliste · Im Regal · Lese ich · Gelesen
- ⭐ **Bewertungen & Notizen** pro Buch
- ☁️ **Cloud-Sync** – überall dieselbe Bibliothek, sicher pro Konto (Supabase RLS)
- 🌙 **Dark Mode** & responsives Design (Handy + Desktop)

---

## 🚀 Schnellstart (lokal)

```bash
npm install
cp .env.example .env   # danach Werte eintragen (siehe unten)
npm run dev
```

Die App läuft dann auf http://localhost:5173

---

## 1️⃣ Supabase einrichten (Datenbank & Login)

1. Konto anlegen auf [supabase.com](https://supabase.com) → **New project**.
2. Im Projekt links auf **SQL Editor** → Inhalt von
   [`supabase/schema.sql`](supabase/schema.sql) einfügen und **Run**.
   → legt die Tabelle `books` inkl. Sicherheitsregeln an.
3. **Project Settings → API** öffnen und kopieren:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon` `public` Key → `VITE_SUPABASE_ANON_KEY`
4. Diese Werte in die lokale `.env` eintragen.
5. (Optional) Unter **Authentication → Providers → Email** die Bestätigungs-Mail
   deaktivieren, wenn du dich ohne E-Mail-Bestätigung anmelden möchtest.

---

## 2️⃣ GitHub verbinden

```bash
git init
git add .
git commit -m "Sallys BücherWahn – erste Version"
git branch -M main
git remote add origin https://github.com/<DEIN-NAME>/SallysBuecherWahn.git
git push -u origin main
```

---

## 3️⃣ Netlify verbinden (Deployment)

1. Auf [app.netlify.com](https://app.netlify.com) → **Add new site → Import an
   existing project** → GitHub → dieses Repo wählen.
2. Netlify erkennt die Einstellungen automatisch aus
   [`netlify.toml`](netlify.toml) (Build: `npm run build`, Ordner: `dist`).
3. Unter **Site settings → Environment variables** anlegen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy** – ab jetzt wird bei jedem `git push` automatisch neu veröffentlicht.

> ⚠️ Der Barcode-Scanner braucht **HTTPS** (Kamerazugriff). Netlify liefert das
> automatisch; lokal funktioniert `localhost` ebenfalls.

---

## 📱 Als App aufs Handy

In Safari/Chrome die Netlify-URL öffnen → Menü → **Zum Home-Bildschirm
hinzufügen**. Dann startet sie wie eine echte App (inkl. Kamera-Scanner).

---

## 🛠️ Technik

| Bereich        | Verwendet                                   |
| -------------- | ------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS    |
| Datenbank/Auth | Supabase (Postgres + Row Level Security)    |
| Buchdaten      | Google Books API, Open Library (kein Key)   |
| Barcode        | @zxing/browser                              |
| Hosting        | Netlify                                      |
