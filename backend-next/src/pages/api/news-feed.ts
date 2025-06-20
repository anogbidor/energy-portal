// // 🔹 /pages/api/news-feed.ts
// import type { NextApiRequest, NextApiResponse } from 'next'

// type NewsItem = {
//   source: string
//   title: string
//   date: string
//   category: string // Hardcoded because NewsAPI doesn’t provide per-article category
//   excerpt: string
//   link: string
// }

// type NewsApiArticleSource = {
//   id: string | null
//   name: string
// }

// type NewsApiArticle = {
//   source: NewsApiArticleSource
//   author?: string | null
//   title?: string | null
//   description?: string | null
//   url?: string | null
//   urlToImage?: string | null
//   publishedAt?: string | null
//   content?: string | null
// }

// type NewsApiResponse = {
//   status: 'ok' | 'error'
//   totalResults?: number
//   articles?: NewsApiArticle[]
//   code?: string
//   message?: string
// }

// const NEWS_API_KEY = process.env.NEWSAPI_KEY

// // Simple in-memory cache
// let cachedNews: NewsItem[] | null = null
// let lastFetched: number | null = null
// const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<NewsItem[] | { error: string }>
// ) {
//   // Set CORS headers for frontend fetch requests
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end()
//   }

//   if (!NEWS_API_KEY) {
//     return res.status(500).json({ error: 'NEWSAPI_KEY is not configured' })
//   }

//   const now = Date.now()
//   if (cachedNews && lastFetched && now - lastFetched < CACHE_TTL) {
//     // Return cached response if valid
//     return res.status(200).json(cachedNews)
//   }

//   try {
//     const url = `https://newsapi.org/v2/everything?q=energy&language=tr&sortBy=publishedAt&pageSize=30&apiKey=${NEWS_API_KEY}`

//     const response = await fetch(url)
//     if (!response.ok) {
//       throw new Error(`NewsAPI responded with status ${response.status}`)
//     }

//     const data: NewsApiResponse = await response.json()
//     console.log('NewsAPI response:', data)

//     if (data.status !== 'ok' || !data.articles) {
//       throw new Error(data.message || 'NewsAPI returned invalid response')
//     }

//     const newsItems: NewsItem[] = data.articles.map((article) => ({
//       source: article.source.name,
//       title: article.title ?? 'Başlıksız',
//       date: article.publishedAt ?? '',
//       category: 'Enerji',
//       excerpt: article.description ?? '',
//       link: article.url ?? '#',
//     }))

//     // Cache the result
//     cachedNews = newsItems
//     lastFetched = now

//     res.status(200).json(newsItems)
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error('❌ NewsAPI fetch error:', error.message)
//     } else {
//       console.error('❌ Unknown error:', error)
//     }
//     res.status(500).json({ error: 'Haberler alınamadı' })
//   }
// }
