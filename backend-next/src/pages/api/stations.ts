// backend/src/pages/api/stations.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { stations } from '@/data/stations' // adjust path if needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers to allow your frontend origin (adjust if needed)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Simulated delay (optional)
  const delay = () => new Promise((resolve) => setTimeout(resolve, 500))

  try {
    await delay()

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
    console.error('❌ Server error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
