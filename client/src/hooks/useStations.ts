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

function cacheKey(city?: string, district?: string) {
  return `${city ?? ''}|${district ?? ''}`
}

// Keyed by city+district so switching filters and switching back
// doesn't re-show a loading state for a combination already fetched
// this session.
const cache = new Map<string, Station[]>()
const inFlight = new Map<string, Promise<Station[]>>()

function fetchStations(
  apiBaseUrl: string,
  city?: string,
  district?: string
): Promise<Station[]> {
  const key = cacheKey(city, district)
  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = (async () => {
    const params = new URLSearchParams()
    if (city) params.append('city', city)
    if (district) params.append('district', district)

    const res = await fetch(`${apiBaseUrl}/api/stations?${params.toString()}`)
    if (!res.ok) {
      throw new Error(res.status === 404 ? 'Stations not found' : 'Server error')
    }
    const json = (await res.json()) as Station[]
    cache.set(key, json)
    return json
  })()

  inFlight.set(key, promise)
  return promise.finally(() => inFlight.delete(key))
}

export function useStations({ city, district }: UseStationsOptions = {}) {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''
  const key = cacheKey(city, district)
  const cached = cache.get(key)

  const [data, setData] = useState<Station[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fromCache = cache.get(key)

    if (fromCache) {
      setData(fromCache)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)

    fetchStations(API_BASE_URL, city, district)
      .then((json) => {
        if (cancelled) return
        setData(json)
      })
      .catch((err) => {
        if (cancelled) return
        if (!fromCache) setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [city, district, API_BASE_URL, key])

  return {
    data,
    loading,
    error,
    isEmpty: !loading && data.length === 0,
  }
}
