import type { NextApiRequest, NextApiResponse } from 'next'
import { runDistributorIngestion } from '@/lib/ingestLicenses'

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

  const results = await runDistributorIngestion()
  return res.status(200).json({ results })
}
