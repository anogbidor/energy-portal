import { useEffect, useState } from 'react'

export interface LicenseSummaryDay {
  date: string
  counts: {
    petrol: number
    lpg: number
    dogalgaz: number
    elektrik: number
  }
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

export function useLicenseSummary(days: number) {
  const [data, setData] = useState<LicenseSummaryDay[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE_URL}/api/license-summary?days=${days}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || 'API error')
        setData(json.data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Hata'))
      .finally(() => setLoading(false))
  }, [days])

  return { data, loading, error }
}
