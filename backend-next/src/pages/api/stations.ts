// backend/src/pages/api/stations.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { stations } from '../../data/stations'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://energy-portal-stage.vercel.app', // replace with your actual Vercel frontend URL
  ]

  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*') // or consider restricting in production
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

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
