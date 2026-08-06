import type { NextApiRequest, NextApiResponse } from 'next'
import { waitUntil } from '@vercel/functions'
import { runBayilikIngestion } from '@/lib/ingestBayilik'

// Each invocation only processes a small batch of distributors (see
// ingestBayilik.ts), so this is comfortably under Vercel Hobby's 300s
// ceiling; 290s is just a safety cap, not an expected duration.
export const config = {
  maxDuration: 290,
}

// Responds immediately and keeps the actual ingestion running in the
// background via waitUntil -- external pinger-style cron services (e.g.
// cron-job.org) are built around quick health-check-style requests, not
// waiting multiple minutes for a batch job to finish, and reported a
// hard timeout on this endpoint even though the run was completing
// successfully server-side. This makes the client-side timeout a
// non-issue: the trigger only needs to survive long enough to receive
// a 202, not the full run.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const market = typeof req.query.market === 'string' ? req.query.market : undefined

  waitUntil(
    runBayilikIngestion(market).catch((err) => {
      console.error('Bayilik ingestion failed in background:', err)
    })
  )

  return res.status(202).json({ started: true, market: market ?? 'all' })
}
