import type { NextApiRequest, NextApiResponse } from 'next'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://energy-portal-stage.vercel.app',
]

export function applyCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
