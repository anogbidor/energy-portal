import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { toLicenseApiShape } from '@/lib/licenseApiShape'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

const DEFAULT_MONTHS = 3
const DEFAULT_LIMIT = 30
const MAX_LIMIT = 200

// Licenses issued (by their own baslangicTarihi, not our own detection)
// within the last N months, newest first -- immediately useful from real
// EPDK data already in `licenses`, unlike /api/events which only shows
// something once a license has been observed changing at least twice.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const monthsParam =
    typeof req.query.months === 'string' ? parseInt(req.query.months, 10) : NaN
  const months = Number.isFinite(monthsParam) ? Math.max(monthsParam, 1) : DEFAULT_MONTHS

  const limitParam =
    typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : NaN
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT

  const since = new Date()
  since.setMonth(since.getMonth() - months)

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .gte('baslangic_tarihi', since.toISOString().slice(0, 10))
      .order('baslangic_tarihi', { ascending: false })
      .limit(limit)

    if (error) throw error

    return res.status(200).json({
      success: true,
      data: (data ?? []).map(toLicenseApiShape),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
