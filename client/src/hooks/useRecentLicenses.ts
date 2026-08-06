import { useEffect, useState } from 'react'

export interface RecentLicense {
  market: string
  licenseType: string
  lisansNo: string
  lisansDurumu: string
  lisansSahibiUnvani: string | null
  vergiNo: string | null
  baslangicTarihi: string | null
  bitisTarihi: string | null
  iptalSonaErdirmeTarihi: string | null
  iptalSonaErdimeAciklama: string | null
  il: string | null
  ilce: string | null
  adres: string | null
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

export function useRecentLicenses(months = 3, limit = 30) {
  const [data, setData] = useState<RecentLicense[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/recent-licenses?months=${months}&limit=${limit}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || 'API error')
        setData(json.data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Hata'))
      .finally(() => setLoading(false))
  }, [months, limit])

  return { data, loading, error }
}
