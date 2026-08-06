import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { queryEpdkGateway } from '@/lib/epdkGateway'

type FuelPriceItem = {
  yakit: string
  fiyat: number
  olcuBirimi: string
  tarih: string
}

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

function formatDateForEpdk(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${date.getFullYear()}`
}

interface BulletinResponse {
  statusCode: number
  data: { Tarih: string; Yakıt: string; 'Ölçü Birimi': string; Fiyat: number }[]
}

// The bulletin requires an exact raporTarihi and returns nothing useful for
// a date it hasn't published yet, so today is tried first and yesterday
// as a fallback in case today's bulletin isn't out yet.
async function fetchBulletin(serviceName: string): Promise<FuelPriceItem[]> {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const date of [today, yesterday]) {
    try {
      const result = await queryEpdkGateway<BulletinResponse>(serviceName, {
        raporTarihi: formatDateForEpdk(date),
      })
      if (result?.data?.length) {
        return result.data.map((row) => ({
          yakit: row['Yakıt'],
          fiyat: row.Fiyat,
          olcuBirimi: row['Ölçü Birimi'],
          tarih: row['Tarih'],
        }))
      }
    } catch {
      // try the earlier date
    }
  }
  return []
}

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
