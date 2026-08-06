import type { NextApiRequest, NextApiResponse } from 'next'
import { waitUntil } from '@vercel/functions'
import { runDistributorIngestion } from '@/lib/ingestLicenses'

export const config = {
  maxDuration: 120,
}

// See ingest-bayilik.ts for why this responds immediately instead of
// waiting for the run to finish -- external cron pingers time out
// well before a multi-market ingestion run completes.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically
  // when CRON_SECRET is set as a project env var; this also lets us
  // trigger it manually with the same header.
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  waitUntil(
    runDistributorIngestion().catch((err) => {
      console.error('Distributor ingestion failed in background:', err)
    })
  )

  return res.status(202).json({ started: true })
}
