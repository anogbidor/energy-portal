import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { LICENSE_STATUSES, queryEpdkGateway } from '@/lib/epdkGateway'

const SERVICE_NAME = 'lpgDagiticiLisansiSorgula'
const CACHE_TTL = 1000 * 60 * 20 // 20 minutes

type Data =
  | { success: true; data: unknown[] }
  | { success: false; error: string }

let cachedData: unknown[] | null = null
let lastFetchedAt = 0

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (cachedData && Date.now() - lastFetchedAt < CACHE_TTL) {
    return res.status(200).json({ success: true, data: cachedData })
  }

  try {
    const data = await queryEpdkGateway<unknown[]>(SERVICE_NAME, {
      lisansDurumu: LICENSE_STATUSES,
    })
    cachedData = data
    lastFetchedAt = Date.now()
    return res.status(200).json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
