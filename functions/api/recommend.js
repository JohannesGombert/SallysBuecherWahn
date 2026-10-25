// Empfehlungen: /api/recommend?authors=A|B&genres=X|Y
// Neuerscheinungen (letzte 2 Jahre, deutschsprachig) der Lieblingsautor:innen und -genres.
// Google Books mit Schlüssel (GOOGLE_BOOKS_KEY) bleibt auf dem Server; ohne Schlüssel
// oder bei Fehlern springt Open Library ein. Antworten werden 6 Stunden gecacht.

const MAX_AUTHORS = 4
const MAX_GENRES = 3
const PER_SEED = 6
const CACHE_SECONDS = 6 * 60 * 60

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
  })

const list = (v, max) =>
  (v || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max)

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

async function google(q, key) {
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}` +
    `&orderBy=newest&langRestrict=de&printType=books&maxResults=20&key=${key}`
  const res = await fetch(url)
  if (!res.ok) {
    // Grund aus Googles Fehlerantwort (ohne Schlüssel) für die Diagnose mitgeben
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google ${res.status} ${err?.error?.status ?? ''} ${err?.error?.errors?.[0]?.reason ?? ''}`.trim())
  }
  const data = await res.json()
  return (data.items || []).map(fromGoogle)
}

async function openLibrary(params) {
  const url =
    `https://openlibrary.org/search.json?${params}&language=ger&sort=new&limit=20` +
    '&fields=title,author_name,isbn,cover_i,first_publish_year,publisher,number_of_pages_median,subject'
  const res = await fetch(url, { headers: { 'User-Agent': 'SallysBuecherWahn/1.0 (+https://sallysbuecherwahn.pages.dev)' } })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(fromOpenLibrary)
}

// Neuerscheinungen eines Suchbegriffs, beste Quelle zuerst
async function newest(kind, seed, key, errors) {
  let books = []
  if (key) {
    const q = kind === 'author' ? `inauthor:"${seed}"` : `subject:"${seed}"`
    books = await google(q, key).catch((e) => {
      errors.add(e.message)
      return []
    })
  }
  if (!books.length) {
    const p = kind === 'author' ? `author=${encodeURIComponent(seed)}` : `subject=${encodeURIComponent(seed.toLowerCase())}`
    books = await openLibrary(p).catch(() => [])
  }
  const recent = books.filter((b) => (yearOf(b.published_date) ?? 0) >= minYear())
  // bei Autor:innen nur Treffer, die wirklich von ihnen sind (Namensgleichheit in Titeln ausschließen)
  const own = kind === 'author' ? recent.filter((b) => b.authors.some((a) => a.toLowerCase().includes(seed.toLowerCase().split(' ').pop()))) : recent
  return own.slice(0, PER_SEED).map((book) => ({ kind, seed, book }))
}

export const onRequest = async ({ request, env, waitUntil }) => {
  const url = new URL(request.url)
  // TEMP-DIAG: vorübergehende Diagnose, wird wieder entfernt
  if (url.searchParams.has('diag')) {
    const k = env.GOOGLE_BOOKS_KEY
    const base = 'https://www.googleapis.com/books/v1/volumes?q='
    const probe = async (label, u) => {
      const r = await fetch(u)
      const t = await r.text()
      return `${label}: ${r.status} ${t.slice(0, 160).replace(/\s+/g, ' ')}`
    }
    const out = await Promise.all([
      probe('einfach+key', `${base}isbn:9783453321342&key=${k}`),
      probe('einfach+key+DE', `${base}isbn:9783453321342&country=DE&key=${k}`),
      probe('alles+key+DE', `${base}${encodeURIComponent('inauthor:"Andy Weir"')}&orderBy=newest&langRestrict=de&printType=books&maxResults=20&country=DE&key=${k}`),
      probe('einfach-ohne', `${base}isbn:9783453321342`),
      probe('inauthor+key', `${base}${encodeURIComponent('inauthor:"Andy Weir"')}&key=${k}`),
      probe('newest+key', `${base}${encodeURIComponent('inauthor:"Andy Weir"')}&orderBy=newest&key=${k}`),
      probe('lang+key', `${base}${encodeURIComponent('inauthor:"Andy Weir"')}&langRestrict=de&key=${k}`),
      probe('alles+key', `${base}${encodeURIComponent('inauthor:"Andy Weir"')}&orderBy=newest&langRestrict=de&printType=books&maxResults=20&key=${k}`),
    ])
    return new Response([`keyLaenge=${k ? k.length : 0}`, ...out].join(String.fromCharCode(10)))
  }
  const authors = list(url.searchParams.get('authors'), MAX_AUTHORS)
  const genres = list(url.searchParams.get('genres'), MAX_GENRES)
  if (!authors.length && !genres.length) return json({ items: [], source: 'none' })

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
    ...authors.map((a) => newest('author', a, key, errors)),
    ...genres.map((g) => newest('genre', g, key, errors)),
  ])
  const res = json({ items: groups.flat(), source: key && !errors.size ? 'google' : 'openlibrary', errors: [...errors] })
  waitUntil(cache.put(cacheKey, res.clone()))
  return res
}
