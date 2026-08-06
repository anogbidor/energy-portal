import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

const MARKETS = ['petrol', 'lpg', 'dogalgaz', 'elektrik']
const DEFAULT_DAYS = 14
const MAX_DAYS = 60

// Calendar-style summary: one row per date, one { issued, cancelled }
// pair per market, for the homepage's day-by-day overview (click a date
// to drill into that day's actual licenses via /license?market=X&date=Y).
// Grouping only by baslangic_tarihi (issuance date) made every single
// cancellation invisible -- a license cancelled today keeps the
// baslangic_tarihi from whenever it was originally issued, often months
// or years back, so it would never land in a "last N days" window keyed
// on that field alone. This tracks both the issuance date and the
// cancellation date (iptal_tarihi) as separate activity per license.
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
      .select('market, baslangic_tarihi, iptal_tarihi')
      .or(`baslangic_tarihi.gte.${sinceStr},iptal_tarihi.gte.${sinceStr}`)

    if (error) throw error

    const emptyDayCounts = () =>
      Object.fromEntries(
        MARKETS.map((m) => [m, { issued: 0, cancelled: 0 }])
      ) as Record<string, { issued: number; cancelled: number }>

    const counts = new Map<string, Record<string, { issued: number; cancelled: number }>>()

    const bump = (date: string, market: string, key: 'issued' | 'cancelled') => {
      if (!counts.has(date)) counts.set(date, emptyDayCounts())
      const dayCounts = counts.get(date)!
      if (!dayCounts[market]) dayCounts[market] = { issued: 0, cancelled: 0 }
      dayCounts[market][key] += 1
    }

    for (const row of data ?? []) {
      const market = row.market as string
      const baslangic = row.baslangic_tarihi as string | null
      const iptal = row.iptal_tarihi as string | null

      if (baslangic && baslangic >= sinceStr) bump(baslangic, market, 'issued')
      if (iptal && iptal >= sinceStr) bump(iptal, market, 'cancelled')
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
