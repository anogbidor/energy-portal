import type { NextApiRequest, NextApiResponse } from 'next'
import { waitUntil } from '@vercel/functions'
import { snapshotDistributorNetwork } from '@/lib/snapshotDistributorNetwork'

export const config = {
  maxDuration: 120,
}

// See ingest-bayilik.ts for why this responds immediately -- ~200
// sequential DB round-trips (count + upsert per distributor) took ~85s
// in direct testing, which is exactly what tripped cron-job.org's
// default timeout even though the run itself completed successfully.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  waitUntil(
    snapshotDistributorNetwork().catch((err) => {
      console.error('Network snapshot failed in background:', err)
    })
  )

  return res.status(202).json({ started: true })
}
