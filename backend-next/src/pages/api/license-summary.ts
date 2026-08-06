import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

const MARKETS = ['petrol', 'lpg', 'dogalgaz', 'elektrik']
const DEFAULT_DAYS = 14
const MAX_DAYS = 60

// Non-active statuses that can appear on iptal_tarihi-dated activity.
// EPDK's real status set (see LICENSE_STATUSES in epdkGateway.ts) --
// FAALIYETI_GECICI_DURDURULDU is a temporary suspension, not a true
// end, but it still carries an iptal_tarihi-equivalent effective date
// so it's tracked here rather than silently dropped.
const NON_ACTIVE_STATUSES = [
  'IPTAL_EDILDI',
  'SONLANDIRILDI',
  'IADE_EDILDI',
  'FAALIYETI_GECICI_DURDURULDU',
] as const

// Calendar-style summary: one row per date, one { issued, statuses }
// entry per market, for the homepage's day-by-day overview (click a
// date to drill into that day's actual licenses via
// /license?market=X&date=Y). Grouping only by baslangic_tarihi
// (issuance date) made every non-active status invisible -- a license
// terminated today keeps the baslangic_tarihi from whenever it was
// originally issued, often months or years back, so it would never
// land in a "last N days" window keyed on that field alone. This
// tracks both the issuance date and, separately, the status-change
// date (iptal_tarihi) broken down by the actual resulting status --
// lumping every non-active status into one generic "cancelled" bucket
// was itself misleading, since most real activity turned out to be
// SONLANDIRILDI (terminated), not IPTAL_EDILDI (cancelled).
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const daysParam =
    typeof req.query.days === 'string' ? parseInt(req.query.days, 10) : NaN
  const days = Number.isFinite(daysParam)
    ? Math.min(Math.max(daysParam, 1), MAX_DAYS)
    : DEFAULT_DAYS

  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().slice(0, 10)

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('licenses')
      .select('market, baslangic_tarihi, iptal_tarihi, lisans_durumu')
      .or(`baslangic_tarihi.gte.${sinceStr},iptal_tarihi.gte.${sinceStr}`)

    if (error) throw error

    type MarketActivity = { issued: number; statuses: Record<string, number> }

    const emptyDayCounts = () =>
      Object.fromEntries(
        MARKETS.map((m) => [m, { issued: 0, statuses: {} }])
      ) as Record<string, MarketActivity>

    const counts = new Map<string, Record<string, MarketActivity>>()

    const bumpIssued = (date: string, market: string) => {
      if (!counts.has(date)) counts.set(date, emptyDayCounts())
      const dayCounts = counts.get(date)!
      if (!dayCounts[market]) dayCounts[market] = { issued: 0, statuses: {} }
      dayCounts[market].issued += 1
    }

    const bumpStatus = (date: string, market: string, status: string) => {
      if (!counts.has(date)) counts.set(date, emptyDayCounts())
      const dayCounts = counts.get(date)!
      if (!dayCounts[market]) dayCounts[market] = { issued: 0, statuses: {} }
      dayCounts[market].statuses[status] =
        (dayCounts[market].statuses[status] ?? 0) + 1
    }

    for (const row of data ?? []) {
      const market = row.market as string
      const baslangic = row.baslangic_tarihi as string | null
      const iptal = row.iptal_tarihi as string | null
      const status = row.lisans_durumu as string

      if (baslangic && baslangic >= sinceStr) bumpIssued(baslangic, market)
      if (
        iptal &&
        iptal >= sinceStr &&
        (NON_ACTIVE_STATUSES as readonly string[]).includes(status)
      ) {
        bumpStatus(iptal, market, status)
      }
    }

    const summary = Array.from(counts.entries())
      .map(([date, dayCounts]) => ({ date, counts: dayCounts }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))

    return res.status(200).json({ success: true, data: summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
