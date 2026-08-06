// src/hooks/useLicenses.ts
import { useState, useEffect } from 'react'

export type Market = 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'

export interface LicenseItem {
  lisansNo: string
  lisansSahibiUnvani: string
  lisansDurumu: string
  baslangicTarihi: string
  bitisTarihi: string
  iptalSonaErdirmeTarihi?: string
  iptalSonaErdimeAciklama?: string | null
  vergiNo: string
  il?: string | null
  ilce?: string | null
  adres?: string
  digerPiyasaFaaliyetTurleri?: string[]
  satisiYapilacakYakitTurleri?: string[]
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

const endpoints: Record<Market, string> = {
  petrol: `${API_BASE_URL}/api/petrolLicenses`,
  lpg: `${API_BASE_URL}/api/lpg`,
  dogalgaz: `${API_BASE_URL}/api/dogalgaz`,
  elektrik: `${API_BASE_URL}/api/elektrik`,
}

interface UseLicensesResult {
  data: LicenseItem[] | null
  error?: string
  loading: boolean
  setMarket: (market: Market) => void
}

export function useLicenses(
  initialMarket: Market = 'lpg',
  date?: string
): UseLicensesResult {
  const [market, setMarket] = useState<Market>(initialMarket)
  const [data, setData] = useState<LicenseItem[] | null>(null)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLicenses = async () => {
      setLoading(true)
      setError(undefined)
      setData(null)

      try {
        const url = date
          ? `${endpoints[market]}?date=${encodeURIComponent(date)}`
          : endpoints[market]
        const res = await fetch(url)
        const json = await res.json()

        if (!json.success) {
          throw new Error(json.error || 'API returned error')
        }

        setData(json.data as LicenseItem[])
      } catch (e) {
        setError(`Network error: ${e}`)
      } finally {
        setLoading(false)
      }
    }

    fetchLicenses()
  }, [market, date])

  return { data, error, loading, setMarket }
}
