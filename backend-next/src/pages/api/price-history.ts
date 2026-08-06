import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

const DEFAULT_DAYS = 30
const MAX_DAYS = 180

// Powers the price-trend sparklines on the Prices page. Flat rows,
// grouped by yakit (fuel type) on the frontend -- simpler than trying
// to pre-shape a nested response for what's ultimately just one line
// chart per fuel type.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)
  applyPublicCache(res, { sMaxAge: 900, staleWhileRevalidate: 3600 })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const market = typeof req.query.market === 'string' ? req.query.market : undefined
  const daysParam =
    typeof req.query.days === 'string' ? parseInt(req.query.days, 10) : NaN
  const days = Number.isFinite(daysParam)
    ? Math.min(Math.max(daysParam, 1), MAX_DAYS)
    : DEFAULT_DAYS

  if (!market) {
    return res.status(400).json({ success: false, error: 'market is required' })
  }

  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('fuel_price_history')
      .select('yakit, fiyat, olcu_birimi, tarih')
      .eq('market', market)
      .gte('tarih', since.toISOString().slice(0, 10))
      .order('tarih', { ascending: true })

    if (error) throw error

    return res.status(200).json({ success: true, data: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
