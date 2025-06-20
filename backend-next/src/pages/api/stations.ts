// backend/src/pages/api/stations.ts
import type { NextApiRequest, NextApiResponse } from 'next'

let stations = [
  {
    id: '1',
    name: 'Petrolsa Station - Kadıköy',
    location: 'İstanbul / Kadıköy',
    city: 'İstanbul',
    district: 'Kadıköy',
    coordinates: { lat: 40.983, lng: 29.032 },
    openHours: '07:00 - 23:00',
    phone: '+90 212 555 5555',
  },
  {
    id: '2',
    name: 'Petrolsa Station - Ankara Merkez',
    location: 'Ankara / Çankaya',
    city: 'Ankara',
    district: 'Çankaya',
    coordinates: { lat: 39.92, lng: 32.854 },
    openHours: '24 Saat Açık',
    phone: '+90 312 666 6666',
  },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      res.status(200).json(stations)
      break

    case 'POST':
      const newStation = req.body
      if (!newStation?.name || !newStation?.coordinates) {
        res.status(400).json({ error: 'Eksik veri' })
        return
      }
      newStation.id = Date.now().toString()
      stations.push(newStation)
      res.status(201).json(newStation)
      break

    case 'PUT':
      const updated = req.body
      stations = stations.map((s) => (s.id === updated.id ? updated : s))
      res.status(200).json(updated)
      break

    case 'DELETE':
      const { id } = req.query
      stations = stations.filter((s) => s.id !== id)
      res.status(200).json({ message: `İstasyon ${id} silindi` })
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
