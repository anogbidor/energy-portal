import { useState, useEffect } from 'react'

type Market = 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'

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

interface Licenses {
  return: LicenseItem[]
}

interface UseLicensesResult {
  data?: Licenses
  error?: string
  loading: boolean
  setMarket: (market: Market) => void
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

const endpoints: Record<Market, string> = {
  petrol: `${API_BASE_URL}/api/petrolLicenses?method=petrolDagiticiLisansSorgula&lisansDurumu=ONAYLANDI`,
  lpg: `${API_BASE_URL}/api/lpg?method=lpgDagiticiLisansSorgula&lisansDurumu=ONAYLANDI`,
  dogalgaz: `${API_BASE_URL}/api/dogalgaz?method=dogalgazDagitimLisansSorgula&lisansDurumu=ONAYLANDI`,
  elektrik: `${API_BASE_URL}/api/elektrik?method=elektrikDagitimLisansiSorgula&lisansDurumu=ONAYLANDI`,
}

export function useLicenses(initialMarket: Market = 'lpg'): UseLicensesResult {
  const [market, setMarket] = useState<Market>(initialMarket)
  const [data, setData] = useState<Licenses>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!market) return

    const fetchData = async () => {
      setLoading(true)
      setError(undefined)
      setData(undefined)

      try {
        const res = await fetch(endpoints[market])
        const json = await res.json()

        if (json.success) {
          if (json.data && typeof json.data.return !== 'undefined') {
            setData(json.data)
          } else {
            setError('Invalid data format returned from API')
          }
        } else {
          setError(json.error || 'API returned error')
        }
      } catch (e) {
        setError(`Network error: ${e}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [market])

  return { data, error, loading, setMarket }
}
