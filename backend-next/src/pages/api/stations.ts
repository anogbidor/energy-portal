// backend/src/pages/api/stations.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { stations } from '../../data/stations'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  applyCors(req, res)
  // This data is static in-code, not a DB/API call -- safe to cache far
  // longer than the DB-backed routes.
  applyPublicCache(res, { sMaxAge: 3600, staleWhileRevalidate: 86400 })

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { method, query } = req

    switch (method) {
      case 'GET':
        const { city, district } = query

        let filtered = [...stations]

        if (city) {
          filtered = filtered.filter(
            (s) => s.city.toLowerCase() === city.toString().toLowerCase()
          )
        }

        if (district) {
          filtered = filtered.filter(
            (s) =>
              s.district.toLowerCase() === district.toString().toLowerCase()
          )
        }

        res.status(200).json(filtered)
        break

      default:
        res.setHeader('Allow', ['GET', 'OPTIONS'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
