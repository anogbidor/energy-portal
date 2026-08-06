import type { NextApiRequest, NextApiResponse } from 'next'
import { snapshotDistributorNetwork } from '@/lib/snapshotDistributorNetwork'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const result = await snapshotDistributorNetwork()
    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
