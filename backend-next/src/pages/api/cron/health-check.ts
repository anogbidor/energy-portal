import type { NextApiRequest, NextApiResponse } from 'next'
import { checkIngestionHealth } from '@/lib/ingestionHealth'

// Designed to be polled by cron-job.org like any other job -- it
// already emails/notifies on a non-2xx response (the same mechanism
// that surfaced the "failed timeout" alerts earlier), so a stalled
// pipeline gets caught within one poll interval instead of sitting
// silent until someone happens to notice a discrepancy against EPDK's
// own site, which is how the bayilik stall this check exists for was
// actually found.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { healthy, checks } = await checkIngestionHealth()
    return res.status(healthy ? 200 : 500).json({ healthy, checks })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ healthy: false, error: message })
  }
}
