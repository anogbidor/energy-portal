import type { NextApiRequest, NextApiResponse } from 'next'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://energy-portal-six.vercel.app',
  'https://energy-portal-stage1.vercel.app',
  'https://energy-portal-stage.vercel.app',
]

export function applyCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// Lets Vercel's edge network serve repeat requests for the same URL
// without re-invoking the function or hitting Supabase at all -- speeds
// up every visitor, not just repeat ones in the same browser session
// (that's what the client-side hook caches handle). Safe at these
// durations since nothing here updates more often than the ingestion
// crons do (every 5-15 min): s-maxage is how long the edge treats a
// response as fresh, stale-while-revalidate is how much longer it can
// keep serving that same stale copy while quietly refetching in the
// background, so a request is never blocked waiting on Supabase.
export function applyPublicCache(
  res: NextApiResponse,
  { sMaxAge = 60, staleWhileRevalidate = 300 } = {}
) {
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  )
}
