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

// Simple in-memory cache
let lastFetched: number | null = null
let cachedExchangeData: {
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
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
    const brent = 83.42 // Placeholder

    let usdTry: number | null = null
    let eurTry: number | null = null
    let gbpTry: number | null = null

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

      const USDTRY: number | null = exchangeData?.quotes?.USDTRY ?? null
      const USDEUR: number | null = exchangeData?.quotes?.USDEUR ?? null
      const USDGBP: number | null = exchangeData?.quotes?.USDGBP ?? null

      usdTry = USDTRY
      eurTry = USDTRY !== null && USDEUR !== null ? USDTRY / USDEUR : null
      gbpTry = USDTRY !== null && USDGBP !== null ? USDTRY / USDGBP : null

      cachedExchangeData = { usdTry, eurTry, gbpTry }
      lastFetched = now
    } else {
      ;;({ usdTry, eurTry, gbpTry } = cachedExchangeData ?? {
        usdTry: null,
        eurTry: null,
        gbpTry: null,
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
