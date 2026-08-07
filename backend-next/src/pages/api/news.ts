import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { fetchAggregatedNews, type NewsItem } from '@/lib/newsFeed'

type Data = { success: true; data: NewsItem[] } | { success: false; error: string }

const CACHE_TTL = 1000 * 60 * 30 // 30 min -- these sources update a
// handful of times an hour at most, no need to re-fetch on every visit.
let cached: NewsItem[] | null = null
let lastFetch = 0

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)
  applyPublicCache(res, { sMaxAge: 900, staleWhileRevalidate: 3600 })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const now = Date.now()
    if (!cached || now - lastFetch > CACHE_TTL) {
      cached = await fetchAggregatedNews()
      lastFetch = now
    }
    return res.status(200).json({ success: true, data: cached })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
