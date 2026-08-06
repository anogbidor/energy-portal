import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

const DEFAULT_DAYS = 90
const MAX_DAYS = 365

// Powers the network-health chart on a distributor's detail page --
// active dealer count over time, from the daily snapshot job.
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
  const lisansNo =
    typeof req.query.lisansNo === 'string' ? req.query.lisansNo : undefined
  const daysParam =
    typeof req.query.days === 'string' ? parseInt(req.query.days, 10) : NaN
  const days = Number.isFinite(daysParam)
    ? Math.min(Math.max(daysParam, 1), MAX_DAYS)
    : DEFAULT_DAYS

  if (!market || !lisansNo) {
    return res
      .status(400)
      .json({ success: false, error: 'market and lisansNo are required' })
  }

  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('distributor_network_snapshots')
      .select('active_dealer_count, snapshot_date')
      .eq('market', market)
      .eq('dagitici_lisans_no', lisansNo)
      .gte('snapshot_date', since.toISOString().slice(0, 10))
      .order('snapshot_date', { ascending: true })

    if (error) throw error

    return res.status(200).json({ success: true, data: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
