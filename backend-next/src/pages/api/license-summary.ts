import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

const MARKETS = ['petrol', 'lpg', 'dogalgaz', 'elektrik']
const DEFAULT_DAYS = 14
const MAX_DAYS = 60

// Calendar-style summary: one row per date, one count per market, for the
// homepage's day-by-day overview (click a date to drill into that day's
// actual licenses via /license?market=X&date=Y). Aggregated in code
// rather than a SQL view/RPC, since it only needs 2 narrow columns over a
// bounded recent window.
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

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('licenses')
      .select('market, baslangic_tarihi')
      .gte('baslangic_tarihi', since.toISOString().slice(0, 10))
      .not('baslangic_tarihi', 'is', null)

    if (error) throw error

    const counts = new Map<string, Record<string, number>>()
    for (const row of data ?? []) {
      const date = row.baslangic_tarihi as string
      const market = row.market as string
      if (!counts.has(date)) {
        counts.set(date, Object.fromEntries(MARKETS.map((m) => [m, 0])))
      }
      const dayCounts = counts.get(date)!
      dayCounts[market] = (dayCounts[market] ?? 0) + 1
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
