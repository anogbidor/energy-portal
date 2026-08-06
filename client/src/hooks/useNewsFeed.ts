import { useEffect, useState } from 'react'

interface NewsItem {
  title: string
  date: string
  category: string
  excerpt: string
  link: string
  imageUrl?: string // Added for image support
}

interface UseNewsFeedResult {
  news: NewsItem[] | null
  loading: boolean
  error: string | null
}

interface RssItem {
  title: string
  pubDate: string
  categories?: string[]
  description: string
  link: string
  enclosure?: {
    url: string
  }
  thumbnail?: string
}

// Both Home and News independently call this hook -- without a shared
// cache, navigating between them (or back to either) re-hits the
// external RSS proxy and re-shows a loading state every single time,
// even though the feed only changes a few times a day at most.
let cache: NewsItem[] | null = null
let inFlight: Promise<NewsItem[]> | null = null

async function fetchNewsFeed(): Promise<NewsItem[]> {
  if (inFlight) return inFlight

  inFlight = (async () => {
    const rssResponse = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
        'https://rss.app/feeds/PyqkAjCkWNmw1ejj.xml'
      )}`
    )

    if (!rssResponse.ok) {
      throw new Error(`RSS feed error (${rssResponse.status})`)
    }

    const rssData = await rssResponse.json()

    if (rssData.status !== 'ok') {
      throw new Error(rssData.message || 'Invalid RSS feed')
    }

    const transformedNews = rssData.items.map((item: RssItem) => ({
      title: item.title || 'Başlıksız Haber',
      date:
        formatRssDate(item.pubDate) || new Date().toLocaleDateString('tr-TR'),
      category: item.categories?.[0] || 'Genel',
      excerpt:
        stripHtml(item.description).substring(0, 200) + '...' ||
        'Açıklama yok',
      link: item.link || '#',
      imageUrl: getImageUrl(item),
    }))

    cache = transformedNews
    return transformedNews
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
        console.error('❌ Haber alınamadı:', err)
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

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '')
}

// Helper to extract image URL from RSS item
function getImageUrl(item: RssItem): string | undefined {
  return item.enclosure?.url || item.thumbnail || undefined
}

// Helper to format RSS date to Turkish locale
function formatRssDate(dateString: string): string {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}
