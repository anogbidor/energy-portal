import type { NextApiRequest, NextApiResponse } from 'next'
import { snapshotPrices } from '@/lib/snapshotPrices'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const market = req.query.market === 'lpg' ? 'lpg' : 'petrol'

  try {
    const result = await snapshotPrices(market)
    return res.status(200).json({ success: true, market, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
