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

export function useNewsFeed(): UseNewsFeedResult {
  const [news, setNews] = useState<NewsItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // First fetch from RSS.app feed
        const rssResponse = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
            'https://rss.app/feeds/wKq3qhZU9ARqQtkB.xml'
          )}`
        )

        if (!rssResponse.ok) {
          throw new Error(`RSS feed error (${rssResponse.status})`)
        }

        const rssData = await rssResponse.json()

        if (rssData.status !== 'ok') {
          throw new Error(rssData.message || 'Invalid RSS feed')
        }

        // Transform the RSS data to match your NewsItem interface
        const transformedNews = rssData.items.map((item: RssItem) => ({
          title: item.title || 'Başlıksız Haber',
          date:
            formatRssDate(item.pubDate) ||
            new Date().toLocaleDateString('tr-TR'),
          category: item.categories?.[0] || 'Genel',
          excerpt:
            stripHtml(item.description).substring(0, 200) + '...' ||
            'Açıklama yok',
          link: item.link || '#',
          imageUrl: getImageUrl(item), // Extract image from enclosure or thumbnail
        }))

        setNews(transformedNews)
      } catch (err) {
        console.error('❌ Haber alınamadı:', err)
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
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
