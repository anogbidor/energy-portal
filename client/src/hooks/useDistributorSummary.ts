import { useEffect, useState } from 'react'
import type { Market } from './useLicenses'

export interface DistributorSummaryRow {
  lisansNo: string
  lisansSahibiUnvani: string
  aktif: number
  iptal: number
  transferIn: number
  transferOut: number
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

const cache = new Map<Market, DistributorSummaryRow[]>()
const inFlight = new Map<Market, Promise<DistributorSummaryRow[]>>()

function fetchSummary(market: Market): Promise<DistributorSummaryRow[]> {
  const existing = inFlight.get(market)
  if (existing) return existing

  const promise = (async () => {
    const res = await fetch(`${API_BASE_URL}/api/distributor-summary?market=${market}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'API error')
    cache.set(market, json.data)
    return json.data as DistributorSummaryRow[]
  })()

  inFlight.set(market, promise)
  return promise.finally(() => inFlight.delete(market))
}

export function useDistributorSummary(market: Market) {
  const cached = cache.get(market)
  const [data, setData] = useState<DistributorSummaryRow[] | null>(cached ?? null)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fromCache = cache.get(market)

    if (fromCache) {
      setData(fromCache)
      setLoading(false)
    } else {
      setLoading(true)
      setData(null)
    }
    setError(null)

    fetchSummary(market)
      .then((rows) => {
        if (cancelled) return
        setData(rows)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Hata')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [market])

  return { data, loading, error }
}
