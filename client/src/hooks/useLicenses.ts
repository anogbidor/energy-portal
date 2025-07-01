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
  setStatus: (status: string) => void // <-- added
  status: string // <-- added
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

// Instead of fixed endpoints, we build URLs dynamically now
const methodForMarket: Record<Market, string> = {
  petrol: 'petrolDagiticiLisansSorgula',
  lpg: 'lpgDagiticiLisansSorgula',
  dogalgaz: 'dogalgazDagitimLisansSorgula',
  elektrik: 'elektrikDagitimLisansiSorgula',
}

const STATUS_LABELS: Record<string, string> = {
  ONAYLANDI: 'Yürürlükte',
  SONLANDIRILDI: 'Sonlandırıldı',
  IPTAL_EDILDI: 'İptal Edildi',
  SURESI_DOLDU: 'Süresi Doldu',
  YURURLUKTEN_KALDIRILDI: 'Yürürlükten Kaldırıldı',
  FAALIYETI_GECICI_DURDURULDU: 'Faaliyeti Geçici Durduruldu',
}

export function useLicenses(
  initialMarket: Market = 'lpg',
  initialStatus: string = 'ONAYLANDI' // <-- added initialStatus
): UseLicensesResult {
  const [market, setMarket] = useState<Market>(initialMarket)
  const [status, setStatus] = useState<string>(initialStatus) // <-- added status state
  const [data, setData] = useState<Licenses>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!market || !status) return

    const fetchData = async () => {
      setLoading(true)
      setError(undefined)
      setData(undefined)

      try {
        // Build URL dynamically based on current market and status
        const url = `${API_BASE_URL}/api/${market}?method=${methodForMarket[market]}&lisansDurumu=${status}`

        const res = await fetch(url)
        const json = await res.json()

        if (json.success) {
          if (json.data && Array.isArray(json.data.return)) {
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
  }, [market, status]) // <-- listen to both market and status changes

  return { data, error, loading, setMarket, setStatus, status } // <-- expose setStatus and status
}
