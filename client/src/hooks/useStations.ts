// client/src/hooks/useStations.ts
import { useEffect, useState } from 'react'

export interface Station {
  id: string
  name: string
  location: string
  city: string
  district: string
  coordinates: { lat: number; lng: number }
  openHours: string
  phone: string
}

export function useStations() {
  const [data, setData] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/stations')
        if (!res.ok) throw new Error('Sunucu hatası')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
