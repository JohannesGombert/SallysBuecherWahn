// TEMP: Diagnose, welche Google-Books-Suchparameter stabil antworten – wird wieder gelöscht.
// /api/gdiag?v=A&q=Julia%20Kuhn&n=5  → Statuscodes und passende Treffer je Versuch (Schlüssel wird nie ausgegeben)
const VARIANTS = {
  A: (a) => `q=${enc(`inauthor:"${a}"`)}&orderBy=newest&langRestrict=de&printType=books&maxResults=40`,
  B: (a) => `q=${enc(`inauthor:"${a}"`)}&langRestrict=de&printType=books&maxResults=40`,
  C: (a) => `q=${enc(`inauthor:"${a}"`)}&orderBy=newest&printType=books&maxResults=40`,
  D: (a) => `q=${enc(`inauthor:"${a}"`)}&orderBy=newest&langRestrict=de&printType=books&maxResults=20`,
  E: (a) => `q=${enc(`inauthor:"${a}"`)}&maxResults=20`,
  F: (a) => `q=${enc(a)}&maxResults=20`,
  G: (a) => `q=${enc(`inauthor:"${a}"`)}&orderBy=newest&langRestrict=de&printType=books&maxResults=40&country=DE`,
  H: (a) => `q=${enc(`inauthor:"${a}"`)}&maxResults=20&country=DE`,
  I: (a) => `q=${enc(`inauthor:${a.split(' ').pop()}`)}&maxResults=20`,
  S: (a) => `q=${enc(`subject:"${a}"`)}&orderBy=newest&langRestrict=de&printType=books&maxResults=20`,
  T: (a) => `q=${enc(`subject:"${a}"`)}&maxResults=20&country=DE`,
}
const enc = encodeURIComponent

export const onRequest = async ({ request, env }) => {
  const url = new URL(request.url)
  const v = url.searchParams.get('v') || 'A'
  const q = url.searchParams.get('q') || 'Julia Kuhn'
  const n = Math.min(Number(url.searchParams.get('n')) || 5, 8)
  const last = q.toLowerCase().split(' ').pop()
  const runs = []
  for (let i = 0; i < n; i++) {
    const t = Date.now()
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${VARIANTS[v](q)}&key=${env.GOOGLE_BOOKS_KEY}`)
    const body = await res.json().catch(() => ({}))
    const items = body.items || []
    runs.push({
      status: res.status,
      reason: body.error?.errors?.[0]?.reason,
      items: items.length,
      match: items.filter((it) => (it.volumeInfo?.authors || []).some((a) => a.toLowerCase().includes(last)) || (it.volumeInfo?.categories || []).some((c) => c.toLowerCase().includes(last))).length,
      ms: Date.now() - t,
    })
    await new Promise((r) => setTimeout(r, 700))
  }
  return new Response(JSON.stringify({ v, q, runs }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
