import type { NextApiRequest, NextApiResponse } from 'next'
import { runBayilikIngestion } from '@/lib/ingestBayilik'

// Each invocation only makes a single EPDK call now (see
// ingestBayilik.ts), normally finishing in a few seconds; this is just a
// generous safety cap in case of a slow upstream response.
export const config = {
  maxDuration: 60,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const market = typeof req.query.market === 'string' ? req.query.market : undefined
  const results = await runBayilikIngestion(market)
  return res.status(200).json({ results })
}
