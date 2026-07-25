import { useEffect, useState } from 'react'

export interface LicenseEvent {
  id: string
  market: string
  license_type: string
  lisans_no: string
  event_type: 'issued' | 'status_changed' | 'distributor_changed' | 'updated'
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  note: string | null
  effective_at: string | null
  detected_at: string
  licenses: {
    lisans_sahibi_unvani: string | null
    il: string | null
    ilce: string | null
  } | null
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

export function useLicenseEvents(limit = 5) {
  const [data, setData] = useState<LicenseEvent[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/events?limit=${limit}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || 'API error')
        setData(json.data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Hata'))
      .finally(() => setLoading(false))
  }, [limit])

  return { data, loading, error }
}
