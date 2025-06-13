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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  // ✅ Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // ✅ Respond to preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const brent = 83.42

    const exchangeRes = await fetch(
      'https://api.exchangerate.host/latest?base=USD&symbols=TRY,EUR,GBP'
    )
    const exchangeData = await exchangeRes.json()

    const usdTry = exchangeData?.rates?.TRY ?? null
    const eurTry = exchangeData?.rates?.EUR ?? null
    const gbpTry = exchangeData?.rates?.GBP ?? null

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
