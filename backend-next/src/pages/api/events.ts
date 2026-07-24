import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const market = typeof req.query.market === 'string' ? req.query.market : undefined
  const licenseType =
    typeof req.query.licenseType === 'string' ? req.query.licenseType : undefined
  const limitParam =
    typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : NaN
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT

  try {
    const supabase = getSupabaseAdmin()

    // old_value/new_value on the event only contain whichever fields
    // actually changed (e.g. a status_changed event won't repeat the
    // company name), so this joins back to `licenses` for context that's
    // useful regardless of which fields changed -- who/where this is about.
    let query = supabase
      .from('license_events')
      .select(
        'id, market, license_type, lisans_no, event_type, old_value, new_value, note, effective_at, detected_at, licenses(lisans_sahibi_unvani, il, ilce)'
      )
      .order('detected_at', { ascending: false })
      .limit(limit)

    if (market) query = query.eq('market', market)
    if (licenseType) query = query.eq('license_type', licenseType)

    const { data, error } = await query
    if (error) throw error

    return res.status(200).json({ success: true, data: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
