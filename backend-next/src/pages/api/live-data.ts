import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { fetchBulletin, type FuelPriceItem } from '@/lib/fuelBulletin'

type Data = {
  brent: number | null
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
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
    let brent: number | null = 83.42 // Hardcoded placeholder -- no live Brent source wired up yet

    const now = Date.now()

    if (!cachedExchangeData || now - lastExchangeFetch > CACHE_TTL) {
      const apiKey = process.env.EXCHANGE_API_KEY
      const exchangeRes = await fetch(
        `https://api.exchangerate.host/live?access_key=${apiKey}`
      )
      const exchangeData = await exchangeRes.json()

      const USDTRY = exchangeData?.quotes?.USDTRY ?? null
      const USDEUR = exchangeData?.quotes?.USDEUR ?? null
      const USDGBP = exchangeData?.quotes?.USDGBP ?? null

      usdTry = USDTRY
      eurTry = USDTRY && USDEUR ? USDTRY / USDEUR : null
      gbpTry = USDTRY && USDGBP ? USDTRY / USDGBP : null

      cachedExchangeData = { usdTry, eurTry, gbpTry, brent }
      lastExchangeFetch = now
    } else {
      ;({ usdTry, eurTry, gbpTry, brent } = cachedExchangeData)
    }

    if (!cachedBulletins || now - lastBulletinFetch > CACHE_TTL) {
      const [fuelPrices, lpgPrices] = await Promise.all([
        fetchBulletin('petrolBayiSatisFiyatBulten'),
        fetchBulletin('lpgBayiSatisFiyatBultenGunluk'),
      ])
      cachedBulletins = { fuelPrices, lpgPrices }
      lastBulletinFetch = now
    }

    res.status(200).json({
      brent,
      usdTry,
      eurTry,
      gbpTry,
      fuelPrices: cachedBulletins.fuelPrices,
      lpgPrices: cachedBulletins.lpgPrices,
    })
  } catch (err) {
    console.error('Error in /api/live-data:', err)
    res.status(500).json({ error: 'Failed to fetch live data' })
  }
}
