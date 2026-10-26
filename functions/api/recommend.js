// Empfehlungen: /api/recommend?authors=A|B&genres=X|Y
// Neuerscheinungen (letzte 2 Jahre, deutschsprachig) der Lieblingsautor:innen und -genres.
// Alle Werke einer Autorin: /api/recommend?works=Name (ohne Jahresgrenze, bis zu 40 Titel).
// Google Books mit Schlüssel (GOOGLE_BOOKS_KEY) bleibt auf dem Server; ohne Schlüssel
// oder bei Fehlern springt Open Library ein. Antworten werden 6 Stunden gecacht.

const MAX_AUTHORS = 4
const MAX_GENRES = 3
const PER_SEED = 6
const MAX_WORKS = 40
const CACHE_SECONDS = 6 * 60 * 60
const FALLBACK_CACHE_SECONDS = 30 * 60

const json = (data, maxAge = CACHE_SECONDS) =>
  new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}` },
  })

const list = (v, max) =>
  (v || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max)

const norm = (s) => s.toLowerCase().replace(/[^a-zäöüß]/g, '')
const minYear = () => new Date().getFullYear() - 2
const yearOf = (d) => {
  const m = String(d || '').match(/\d{4}/)
  return m ? Number(m[0]) : null
}

function fromGoogle(item) {
  const v = item.volumeInfo || {}
  const ids = v.industryIdentifiers || []
  const isbn = (ids.find((i) => i.type === 'ISBN_13') || ids.find((i) => i.type === 'ISBN_10') || {}).identifier || null
  const thumb = v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)
  return {
    isbn,
    title: v.title || 'Unbekannter Titel',
    authors: v.authors || [],
    cover_url: thumb ? thumb.replace('http://', 'https://').replace('&edge=curl', '') : null,
    description: v.description || null,
    publisher: v.publisher || null,
    published_date: v.publishedDate || null,
    page_count: v.pageCount || null,
    categories: v.categories || [],
  }
}

function fromOpenLibrary(d) {
  const isbns = d.isbn || []
  return {
    isbn: isbns.find((i) => i.startsWith('9783')) || isbns.find((i) => i.length === 13) || isbns[0] || null,
    title: d.title || 'Unbekannter Titel',
    authors: d.author_name || [],
    cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
    description: null,
    publisher: (d.publisher || [])[0] || null,
    published_date: d.first_publish_year ? String(d.first_publish_year) : null,
    page_count: d.number_of_pages_median || null,
    categories: (d.subject || []).slice(0, 5),
  }
}

async function google(q, key, max = 20) {
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}` +
    `&orderBy=newest&langRestrict=de&printType=books&maxResults=${max}&key=${key}`
  // Google antwortet Servern gelegentlich mit 503 – kurz nacheinander erneut versuchen
  let res
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url)
    if (res.status !== 503) break
    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)))
  }
  if (!res.ok) {
    // Grund aus Googles Fehlerantwort (ohne Schlüssel) für die Diagnose mitgeben
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google ${res.status} ${err?.error?.status ?? ''} ${err?.error?.errors?.[0]?.reason ?? ''}`.trim())
  }
  const data = await res.json()
  return (data.items || []).map(fromGoogle)
}

async function openLibrary(params, max = 20) {
  const url =
    `https://openlibrary.org/search.json?${params}&language=ger&sort=new&limit=${max}` +
    '&fields=title,author_name,isbn,cover_i,first_publish_year,publisher,number_of_pages_median,subject'
  const res = await fetch(url, { headers: { 'User-Agent': 'SallysBuecherWahn/1.0 (+https://sallysbuecherwahn.pages.dev)' } })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(fromOpenLibrary)
}

// Neuerscheinungen eines Suchbegriffs, beste Quelle zuerst; all: alle Jahre, mehr Treffer
async function newest(kind, seed, key, errors, all = false) {
  const max = all ? MAX_WORKS : 20
  // bei Autor:innen nur Treffer, die wirklich von ihnen sind (Namensgleichheit in Titeln ausschließen);
  // für „alle Werke“ muss der volle Name passen, sonst kommen alle mit gleichem Nachnamen
  const name = norm(seed)
  const last = seed.toLowerCase().split(' ').pop()
  const byAuthor = (a) => (all ? norm(a) === name : a.toLowerCase().includes(last))
  const keep = (books) =>
    books
      .filter((b) => all || (yearOf(b.published_date) ?? 0) >= minYear())
      .filter((b) => kind !== 'author' || b.authors.some(byAuthor))

  let books = []
  if (key) {
    const q = kind === 'author' ? `inauthor:"${seed}"` : `subject:"${seed}"`
    books = keep(
      await google(q, key, max).catch((e) => {
        errors.add(e.message)
        return []
      }),
    )
  }
  // Google liefert manchmal fremde Treffer statt eines Fehlers – dann ebenfalls Open Library fragen
  if (!books.length) {
    const p = kind === 'author' ? `author=${encodeURIComponent(seed)}` : `subject=${encodeURIComponent(seed.toLowerCase())}`
    books = keep(await openLibrary(p, max).catch(() => []))
  }
  return books.slice(0, all ? MAX_WORKS : PER_SEED).map((book) => ({ kind, seed, book }))
}

export const onRequest = async ({ request, env, waitUntil }) => {
  const url = new URL(request.url)
  const works = (url.searchParams.get('works') || '').trim().slice(0, 120)
  const authors = works ? [] : list(url.searchParams.get('authors'), MAX_AUTHORS)
  const genres = works ? [] : list(url.searchParams.get('genres'), MAX_GENRES)
  if (!works && !authors.length && !genres.length) return json({ items: [], source: 'none' })

  const key = env.GOOGLE_BOOKS_KEY
  // Cache getrennt nach Quelle, damit nach dem Eintragen des Schlüssels keine alten Open-Library-Antworten bleiben
  const cacheUrl = new URL(url)
  cacheUrl.searchParams.set('_src', key ? 'google' : 'openlibrary')
  const cache = caches.default
  const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' })
  const hit = await cache.match(cacheKey)
  if (hit) return hit

  const errors = new Set()
  const groups = await Promise.all([
    ...(works ? [newest('author', works, key, errors, true)] : []),
    ...authors.map((a) => newest('author', a, key, errors)),
    ...genres.map((g) => newest('genre', g, key, errors)),
  ])
  // nach Google-Fehlern nur kurz cachen, damit Google bald wieder eine Chance bekommt
  const res = json(
    { items: groups.flat(), source: key && !errors.size ? 'google' : 'openlibrary', errors: [...errors] },
    errors.size ? FALLBACK_CACHE_SECONDS : CACHE_SECONDS,
  )
  waitUntil(cache.put(cacheKey, res.clone()))
  return res
}
