import { useEffect, useState } from 'react'
import type { Market } from './useLicenses'

export interface NetworkSnapshotRow {
  active_dealer_count: number
  snapshot_date: string
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

export function useNetworkHistory(
  market?: Market,
  lisansNo?: string,
  days = 90
) {
  const [data, setData] = useState<NetworkSnapshotRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!market || !lisansNo) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(
      `${API_BASE_URL}/api/network-history?market=${market}&lisansNo=${encodeURIComponent(
        lisansNo
      )}&days=${days}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || 'API error')
        if (!cancelled) setData(json.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Hata')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [market, lisansNo, days])

  return { data, loading, error }
}
