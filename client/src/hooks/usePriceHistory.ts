import { useEffect, useState } from 'react'
import type { Market } from './useLicenses'

export interface PriceHistoryRow {
  yakit: string
  fiyat: number
  olcu_birimi: string | null
  tarih: string
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

const cache = new Map<string, PriceHistoryRow[]>()
const inFlight = new Map<string, Promise<PriceHistoryRow[]>>()

function cacheKey(market: Market, days: number) {
  return `${market}|${days}`
}

function fetchHistory(market: Market, days: number): Promise<PriceHistoryRow[]> {
  const key = cacheKey(market, days)
  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = (async () => {
    const res = await fetch(
      `${API_BASE_URL}/api/price-history?market=${market}&days=${days}`
    )
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'API error')
    cache.set(key, json.data)
    return json.data as PriceHistoryRow[]
  })()

  inFlight.set(key, promise)
  return promise.finally(() => inFlight.delete(key))
}

export function usePriceHistory(market: Market, days = 30) {
  const cached = cache.get(cacheKey(market, days))
  const [data, setData] = useState<PriceHistoryRow[] | null>(cached ?? null)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fromCache = cache.get(cacheKey(market, days))
    if (fromCache) {
      setData(fromCache)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)

    fetchHistory(market, days)
      .then((rows) => {
        if (!cancelled) setData(rows)
      })
      .catch((err) => {
        if (!cancelled && !fromCache) {
          setError(err instanceof Error ? err.message : 'Hata')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [market, days])

  return { data, loading, error }
}

// Groups flat rows by fuel type, sorted oldest-first per group -- what
// the sparkline component actually wants to render.
export function groupByYakit(rows: PriceHistoryRow[]) {
  const groups = new Map<string, { tarih: string; fiyat: number }[]>()
  for (const row of rows) {
    if (!groups.has(row.yakit)) groups.set(row.yakit, [])
    groups.get(row.yakit)!.push({ tarih: row.tarih, fiyat: row.fiyat })
  }
  return groups
}
