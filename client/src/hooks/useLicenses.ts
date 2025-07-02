// src/hooks/useLicenses.ts
import { useState, useEffect } from 'react'

export type Market = 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'

export interface LicenseItem {
  lisansGenelBilgi: {
    lisansNo: string
    lisansSahibiUnvani: string
    lisansDurumu: string
    baslangicTarihi: string
    bitisTarihi: string
    iptalTarihi?: string
    adres: {
      il?: string
      ilce?: string
      mahalleCaddeSokak?: string
    }
    vergiNo: string
  }
  digerPiyasaFaaliyetTurleri?: string[]
  satisiYapilacakYakitTurleri?: string[]
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

const STATUSES = [
  'ONAYLANDI',
  'SONLANDIRILDI',
  'IPTAL_EDILDI',
  'SURESI_DOLDU',
  'YURURLUKTEN_KALDIRILDI',
  'FAALIYETI_GECICI_DURDURULDU',
]

const endpoints: Record<Market, string> = {
  petrol: `${API_BASE_URL}/api/petrolLicenses?method=petrolDagiticiLisansSorgula`,
  lpg: `${API_BASE_URL}/api/lpg?method=lpgDagiticiLisansSorgula`,
  dogalgaz: `${API_BASE_URL}/api/dogalgaz?method=dogalgazDagitimLisansSorgula`,
  elektrik: `${API_BASE_URL}/api/elektrik?method=elektrikDagitimLisansiSorgula`,
}

const STATUS_LABELS: Record<string, string> = {
  ONAYLANDI: 'Yürürlükte',
  SONLANDIRILDI: 'Sonlandırıldı',
  IPTAL_EDILDI: 'İptal Edildi',
  SURESI_DOLDU: 'Süresi Doldu',
  YURURLUKTEN_KALDIRILDI: 'Yürürlükten Kaldırıldı',
  FAALIYETI_GECICI_DURDURULDU: 'Faaliyeti Geçici Durduruldu',
}

interface UseLicensesResult {
  data: LicenseItem[] | null
  error?: string
  loading: boolean
  setMarket: (market: Market) => void
}

export function useLicenses(initialMarket: Market = 'lpg'): UseLicensesResult {
  const [market, setMarket] = useState<Market>(initialMarket)
  const [data, setData] = useState<LicenseItem[] | null>(null)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!market) return

    const fetchAllStatuses = async () => {
      setLoading(true)
      setError(undefined)
      setData(null)

      try {
        const allResults: LicenseItem[] = []

        // Fetch for each status, then concat results
        for (const status of STATUSES) {
          const url = `${endpoints[market]}&lisansDurumu=${status}`
          const res = await fetch(url)
          const json = await res.json()

          if (json.success && json.data && Array.isArray(json.data.return)) {
            allResults.push(...json.data.return)
          } else if (!json.success) {
            throw new Error(json.error || 'API returned error')
          }
        }

        // Remove duplicates by lisansNo (if any)
        const uniqueResults = allResults.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.lisansGenelBilgi.lisansNo === item.lisansGenelBilgi.lisansNo
            )
        )

        // Map lisansDurumu code to label
        const mappedResults = uniqueResults.map((item) => {
          const code = item.lisansGenelBilgi.lisansDurumu
            .toUpperCase()
            .replace(/\s+/g, '_')
          return {
            ...item,
            lisansGenelBilgi: {
              ...item.lisansGenelBilgi,
              lisansDurumu:
                STATUS_LABELS[code] || item.lisansGenelBilgi.lisansDurumu,
            },
          }
        })

        setData(mappedResults)
      } catch (e) {
        setError(`Network error: ${e}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAllStatuses()
  }, [market])

  return { data, error, loading, setMarket }
}
