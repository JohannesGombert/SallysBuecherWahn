// Server-Proxy für ISBN-Lookups.
// Reihenfolge: Google Books → Deutsche Nationalbibliothek (DNB).
// Löst CORS (DNB hat keine CORS-Header) und das Mobilfunk-Ratelimit (eigene Server-IP).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function upgradeCover(url) {
  if (!url) return null
  return url.replace('http://', 'https://').replace('zoom=1', 'zoom=2')
}

// ── Cover via Google "Dynamic Links" (umgeht das normale API-Limit) ─────────────
async function coverFromGoogleLinks(isbn) {
  const res = await fetch(
    `https://books.google.com/books?jscmd=viewapi&bibkeys=ISBN:${isbn}&callback=r`,
  )
  if (!res.ok) return null
  const text = await res.text()
  const m = text.match(/\{[\s\S]*\}/) // JSON aus dem JSONP-Wrapper schneiden
  if (!m) return null
  let data
  try {
    data = JSON.parse(m[0])
  } catch {
    return null
  }
  const entry = data[`ISBN:${isbn}`]
  let url = entry && entry.thumbnail_url
  if (!url) return null
  // größer + sicher: zoom hoch, http→https, curl-Ecke weg
  return url
    .replace('http://', 'https://')
    .replace('zoom=5', 'zoom=1')
    .replace('&edge=curl', '')
}

// ── Google Books ──────────────────────────────────────────────────────────────
async function fromGoogle(isbn) {
  const key = process.env.GOOGLE_BOOKS_KEY
    ? `&key=${process.env.GOOGLE_BOOKS_KEY}`
    : ''
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=DE${key}`,
  )
  if (!res.ok) return null
  const data = await res.json()
  const v = data.items && data.items[0] && data.items[0].volumeInfo
  if (!v) return null
  return {
    isbn,
    title: v.title || 'Unbekannter Titel',
    authors: v.authors || [],
    cover_url: upgradeCover(v.imageLinks && v.imageLinks.thumbnail),
    description: v.description || null,
    publisher: v.publisher || null,
    published_date: v.publishedDate || null,
    page_count: v.pageCount || null,
    categories: v.categories || [],
  }
}

// ── Deutsche Nationalbibliothek (Dublin Core) ───────────────────────────────────
function dcTag(xml, name) {
  const m = xml.match(new RegExp(`<dc:${name}[^>]*>([\\s\\S]*?)</dc:${name}>`))
  return m ? decodeEntities(m[1].trim()) : null
}
function dcAll(xml, name) {
  const re = new RegExp(`<dc:${name}[^>]*>([\\s\\S]*?)</dc:${name}>`, 'g')
  const out = []
  let m
  while ((m = re.exec(xml))) out.push(decodeEntities(m[1].trim()))
  return out
}
function flipName(n) {
  // "Granger, Ann" → "Ann Granger"
  const parts = n.split(',')
  return parts.length === 2 ? `${parts[1].trim()} ${parts[0].trim()}` : n.trim()
}

async function fromDNB(isbn) {
  const res = await fetch(
    `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=NUM%3D${isbn}&recordSchema=oai_dc&maximumRecords=1`,
  )
  if (!res.ok) return null
  const xml = await res.text()
  if (!/<dc[ >]/.test(xml)) return null

  const rawTitle = dcTag(xml, 'title')
  if (!rawTitle) return null
  // "Haupttitel : Untertitel / Autor. Aus dem Engl. …" → Autoren-/Zusatzteil abtrennen
  const title = rawTitle.split(' / ')[0].replace(/ : /g, ' – ').trim()

  const creators = dcAll(xml, 'creator')
  const skip = /\[(Übersetzer|Illustrator|Herausgeber|Mitwirkender|Hrsg)/i
  let authors = creators
    .filter((c) => !skip.test(c))
    .map((c) => c.replace(/\s*\[.*?\]/g, '').trim())
    .map(flipName)
  if (authors.length === 0 && creators.length)
    authors = [flipName(creators[0].replace(/\s*\[.*?\]/g, '').trim())]

  const publisherRaw = dcTag(xml, 'publisher') // "Köln : Bastei Lübbe"
  const publisher = publisherRaw
    ? publisherRaw.split(' : ').pop().trim()
    : null

  const dateRaw = dcTag(xml, 'date')
  const dateMatch = dateRaw && dateRaw.match(/\d{4}/)
  const published_date = dateMatch ? dateMatch[0] : dateRaw

  const formatRaw = dcTag(xml, 'format') // "330 S."
  const pageMatch = formatRaw && formatRaw.match(/(\d+)\s*S/)
  const page_count = pageMatch ? parseInt(pageMatch[1], 10) : null

  const categories = dcAll(xml, 'subject')
    .filter((s) => !/^[A-Z]$/.test(s)) // grobe Ein-Buchstaben-Codes rauswerfen
    .slice(0, 5)

  return {
    isbn,
    title,
    authors,
    cover_url: null, // wird im Handler über Google-Cover ergänzt
    description: null,
    publisher,
    published_date,
    page_count,
    categories,
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS }

  const raw = (event.queryStringParameters && event.queryStringParameters.isbn) || ''
  const isbn = raw.replace(/[^0-9Xx]/g, '').toUpperCase()
  if (!isbn) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'isbn fehlt' }) }
  }

  try {
    let book = await fromGoogle(isbn).catch(() => null)
    if (!book) book = await fromDNB(isbn).catch(() => null)
    if (!book) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'nicht gefunden' }) }
    }
    // Cover sicherstellen (DNB liefert keins; Google-API-Cover kann fehlen)
    if (!book.cover_url) {
      book.cover_url = await coverFromGoogleLinks(isbn).catch(() => null)
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify(book) }
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) }
  }
}
