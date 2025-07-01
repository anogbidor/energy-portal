import { useState, useEffect } from 'react'

type Market = 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'

export interface LicenseItem {
  lisansGenelBilgi: {
    lisansNo: string
    lisansSahibiUnvani: string
    lisansDurumu: string // this will be mapped below
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

const STATUS_LABELS: Record<string, string> = {
  SONLANDIRILDI: 'Sonlandırıldı',
  IPTAL_EDILDI: 'İptal Edildi',
  SURESI_DOLDU: 'Süresi Doldu',
  YURURLUKTEN_KALDIRILDI: 'Yürürlükten Kaldırıldı',
  // You can add more mappings here if needed
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
          if (json.data && Array.isArray(json.data.return)) {
            // Map lisansDurumu code to label for each license item
            const mappedData = {
              ...json.data,
              return: json.data.return.map((item: LicenseItem) => {
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
              }),
            }
            setData(mappedData)
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
