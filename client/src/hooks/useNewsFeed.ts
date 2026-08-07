import { useEffect, useState } from 'react'

export interface NewsItem {
  title: string
  date: string
  category: string
  source: string
  excerpt: string
  // Absolute URL for an external article, or a relative in-app path
  // (e.g. /license/detail?...) for an EPDK activity item -- callers
  // should route these differently (external <a target=_blank> vs
  // React Router <Link>).
  link: string
  imageUrl?: string | null
}

interface UseNewsFeedResult {
  news: NewsItem[] | null
  loading: boolean
  error: string | null
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

// Both Home and News independently call this hook -- without a shared
// cache, navigating between them (or back to either) re-hits the API
// and re-shows a loading state every single time, even though the
// backend itself already caches for 30 min (see api/news.ts).
let cache: NewsItem[] | null = null
let inFlight: Promise<NewsItem[]> | null = null

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

async function fetchNewsFeed(): Promise<NewsItem[]> {
  if (inFlight) return inFlight

  inFlight = (async () => {
    const res = await fetch(`${API_BASE_URL}/api/news`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'API error')

    const items = (json.data as NewsItem[]).map((item) => ({
      ...item,
      date: formatDate(item.date),
    }))

    cache = items
    return items
  })()

  try {
    return await inFlight
  } finally {
    inFlight = null
  }
}

export function useNewsFeed(): UseNewsFeedResult {
  const [news, setNews] = useState<NewsItem[] | null>(cache)
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchNewsFeed()
      .then((items) => {
        if (cancelled) return
        setNews(items)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Haber alınamadı:', err)
        if (!cache) setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { news, loading, error }
}
