import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { fetchBulletin, type FuelPriceItem } from '@/lib/fuelBulletin'
import { fetchExchangeRates } from '@/lib/exchangeRates'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Trend = 'up' | 'down' | 'flat' | null

type Data = {
  brent: number | null
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
  trends: { usdTry: Trend; eurTry: Trend; gbpTry: Trend }
  fuelPrices: FuelPriceItem[]
  lpgPrices: FuelPriceItem[]
}

const CACHE_TTL = 1000 * 60 * 60 // 1 hour -- these are daily bulletins,
// no need to hit EPDK's rate-limit-sensitive gateway on every page view.

let cachedExchangeData: {
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
  brent: number | null
} | null = null
let lastExchangeFetch = 0

let cachedBulletins: { fuelPrices: FuelPriceItem[]; lpgPrices: FuelPriceItem[] } | null =
  null
let lastBulletinFetch = 0

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  applyCors(req, res)
  // Longer than the default -- the underlying data (exchange rates,
  // fuel bulletins) is itself only refetched hourly (see CACHE_TTL
  // above), so there's nothing to gain from a shorter edge TTL here.
  applyPublicCache(res, { sMaxAge: 1800, staleWhileRevalidate: 3600 })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    let usdTry: number | null = null
    let eurTry: number | null = null
    let gbpTry: number | null = null
    const brent: number | null = 83.42 // Hardcoded placeholder -- no live Brent source wired up yet

    const now = Date.now()

    if (!cachedExchangeData || now - lastExchangeFetch > CACHE_TTL) {
      const rates = await fetchExchangeRates()
      usdTry = rates.usdTry
      eurTry = rates.eurTry
      gbpTry = rates.gbpTry

      cachedExchangeData = { usdTry, eurTry, gbpTry, brent }
      lastExchangeFetch = now
    } else {
      ;({ usdTry, eurTry, gbpTry } = cachedExchangeData)
    }

    if (!cachedBulletins || now - lastBulletinFetch > CACHE_TTL) {
      const [fuelPrices, lpgPrices] = await Promise.all([
        fetchBulletin('petrolBayiSatisFiyatBulten'),
        fetchBulletin('lpgBayiSatisFiyatBultenGunluk'),
      ])
      cachedBulletins = { fuelPrices, lpgPrices }
      lastBulletinFetch = now
    }

    // Trend arrows compare today's live rate against the most recent
    // earlier daily snapshot (see snapshotExchangeRates.ts) -- there's
    // nothing to compare against until that cron has run at least twice,
    // so a pair with no prior snapshot just gets a null trend rather
    // than a fabricated direction.
    const trends: Data['trends'] = { usdTry: null, eurTry: null, gbpTry: null }
    const today = new Date().toISOString().slice(0, 10)
    const supabase = getSupabaseAdmin()
    // Not limited to 3 -- if the cron ever misses a pair on its most
    // recent run, that pair's actual latest snapshot is further back, so
    // this looks at a real window rather than assuming all 3 pairs
    // always share the same latest date.
    const { data: priorSnapshots } = await supabase
      .from('exchange_rate_snapshots')
      .select('pair, value, snapshot_date')
      .lt('snapshot_date', today)
      .order('snapshot_date', { ascending: false })
      .limit(9)

    const priorByPair = new Map<string, number>()
    for (const row of priorSnapshots ?? []) {
      const pair = row.pair as string
      if (!priorByPair.has(pair)) priorByPair.set(pair, row.value as number)
    }
    const currentByPair: Record<string, number | null> = { usdTry, eurTry, gbpTry }
    for (const pair of ['usdTry', 'eurTry', 'gbpTry'] as const) {
      const current = currentByPair[pair]
      const prior = priorByPair.get(pair)
      if (current === null || prior === undefined) continue
      trends[pair] = current > prior ? 'up' : current < prior ? 'down' : 'flat'
    }

    res.status(200).json({
      brent,
      usdTry,
      eurTry,
      gbpTry,
      trends,
      fuelPrices: cachedBulletins.fuelPrices,
      lpgPrices: cachedBulletins.lpgPrices,
    })
  } catch (err) {
    console.error('Error in /api/live-data:', err)
    res.status(500).json({ error: 'Failed to fetch live data' })
  }
}
