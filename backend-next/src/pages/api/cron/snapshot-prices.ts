import type { NextApiRequest, NextApiResponse } from 'next'
import { waitUntil } from '@vercel/functions'
import { snapshotPrices } from '@/lib/snapshotPrices'

export const config = {
  maxDuration: 60,
}

// See ingest-bayilik.ts for why this responds immediately -- the two
// sequential bulletin calls with a paced gap between them (see
// snapshotPrices.ts) take longer than an external pinger reliably waits.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  waitUntil(
    snapshotPrices().catch((err) => {
      console.error('Price snapshot failed in background:', err)
    })
  )

  return res.status(202).json({ started: true })
}
