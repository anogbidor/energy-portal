import type { NextApiRequest, NextApiResponse } from 'next'
import { runBayilikIngestion } from '@/lib/ingestBayilik'

// Each invocation only processes a small batch of distributors (see
// ingestBayilik.ts), so this is comfortably under Vercel Hobby's 300s
// ceiling; 290s is just a safety cap, not an expected duration.
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
