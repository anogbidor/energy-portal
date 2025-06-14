import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { promises as fs } from 'fs'

type FuelPrice = {
  benzin: number
  motorin: number
  lpg: number
}

type Data = {
  brent: number | null
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
  fuelPrices: Record<string, FuelPrice>
}

// In-memory cache
let lastFetched: number | null = null
let cachedExchangeData: {
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
  brent: number | null
} | null = null

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    let usdTry: number | null = null
    let eurTry: number | null = null
    let gbpTry: number | null = null
    let brent: number | null = 83.42 // 🟡 Hardcoded placeholder for Brent

    const now = Date.now()
    const shouldFetch =
      !cachedExchangeData || !lastFetched || now - lastFetched > 86400000

    if (shouldFetch) {
      const apiKey = process.env.EXCHANGE_API_KEY
      console.log('✅ EXCHANGE_API_KEY:', apiKey)

      const exchangeRes = await fetch(
        `https://api.exchangerate.host/live?access_key=${apiKey}`
      )
      const exchangeData = await exchangeRes.json()
      console.log('exchangeData', exchangeData)

      const USDTRY = exchangeData?.quotes?.USDTRY ?? null
      const USDEUR = exchangeData?.quotes?.USDEUR ?? null
      const USDGBP = exchangeData?.quotes?.USDGBP ?? null

      usdTry = USDTRY
      eurTry = USDTRY && USDEUR ? USDTRY / USDEUR : null
      gbpTry = USDTRY && USDGBP ? USDTRY / USDGBP : null

      // ❌ Commented out until plan upgraded
      /*
      try {
        const marketstackKey = process.env.MARKETSTACK_API_KEY
        const brentRes = await fetch(
          `http://api.marketstack.com/v1/eod?access_key=${marketstackKey}&symbols=BCOMCO.INDX&limit=1`
        )
        const brentData = await brentRes.json()
        console.log('brentData', brentData)
        brent = brentData?.data?.[0]?.close ?? brent
      } catch (brentErr) {
        console.error('❌ Failed to fetch Brent price:', brentErr)
      }
      */

      cachedExchangeData = { usdTry, eurTry, gbpTry, brent }
      lastFetched = now
    } else {
      ;({ usdTry, eurTry, gbpTry, brent } = cachedExchangeData ?? {
        usdTry: null,
        eurTry: null,
        gbpTry: null,
        brent: 83.42,
      })
    }

    const fuelPricesPath = path.join(
      process.cwd(),
      'src',
      'data',
      'fuelPrices.json'
    )
    const fuelPricesRaw = await fs.readFile(fuelPricesPath, 'utf-8')
    const fuelPrices: Record<string, FuelPrice> = JSON.parse(fuelPricesRaw)

    res.status(200).json({
      brent,
      usdTry,
      eurTry,
      gbpTry,
      fuelPrices,
    })
  } catch (err) {
    console.error('❌ Error in /api/live-data:', err)
    res.status(500).json({ error: 'Failed to fetch live data' })
  }
}
