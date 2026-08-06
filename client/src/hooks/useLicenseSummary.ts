import { useEffect, useState } from 'react'

export interface MarketActivity {
  issued: number
  statuses: Record<string, number>
}

export interface LicenseSummaryDay {
  date: string
  counts: {
    petrol: MarketActivity
    lpg: MarketActivity
    dogalgaz: MarketActivity
    elektrik: MarketActivity
  }
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

// Keyed by `days` so stepping the "Daha fazla göster" window and
// navigating away from the homepage and back doesn't re-show a loading
// state for a window already fetched this session.
const cache = new Map<number, LicenseSummaryDay[]>()
const inFlight = new Map<number, Promise<LicenseSummaryDay[]>>()

function fetchSummary(days: number): Promise<LicenseSummaryDay[]> {
  const existing = inFlight.get(days)
  if (existing) return existing

  const promise = (async () => {
    const res = await fetch(`${API_BASE_URL}/api/license-summary?days=${days}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'API error')
    cache.set(days, json.data)
    return json.data as LicenseSummaryDay[]
  })()

  inFlight.set(days, promise)
  return promise.finally(() => inFlight.delete(days))
}

export function useLicenseSummary(days: number) {
  const cached = cache.get(days)
  const [data, setData] = useState<LicenseSummaryDay[] | null>(cached ?? null)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fromCache = cache.get(days)

    if (fromCache) {
      setData(fromCache)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)

    fetchSummary(days)
      .then((items) => {
        if (cancelled) return
        setData(items)
      })
      .catch((err) => {
        if (cancelled) return
        if (!fromCache) setError(err instanceof Error ? err.message : 'Hata')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [days])

  return { data, loading, error }
}
