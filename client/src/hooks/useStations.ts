// client/src/hooks/useStations.ts
import { useEffect, useState } from 'react'

export interface Station {
  id: string
  name: string
  brand: string
  location: string
  city: string
  district: string
  coordinates: { lat: number; lng: number }
  openHours: string
  phone: string
  services: string[]
 fuelTypes: string[]
 address: string
 prices?: number
}

interface UseStationsOptions {
  city?: string
  district?: string
}

export function useStations({ city, district }: UseStationsOptions = {}) {
  const [data, setData] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (city) params.append('city', city)
        if (district) params.append('district', district)

        const res = await fetch(
          `http://localhost:3000/api/stations?${params.toString()}`
        )

        if (!res.ok) {
          throw new Error(
            res.status === 404 ? 'Stations not found' : 'Server error'
          )
        }

        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [city, district])

  return {
    data,
    loading,
    error,
    isEmpty: !loading && data.length === 0,
  }
}
