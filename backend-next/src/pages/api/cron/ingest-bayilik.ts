import type { NextApiRequest, NextApiResponse } from 'next'
import { runBayilikIngestion } from '@/lib/ingestBayilik'

// Scoped to one market per invocation (see ingestBayilik.ts) to stay
// comfortably under Vercel Hobby's 300s function ceiling even with retries.
export const config = {
  maxDuration: 290,
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
