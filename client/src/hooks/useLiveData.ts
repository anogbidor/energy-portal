import { useEffect, useState } from 'react'

export type FuelPriceItem = {
  yakit: string
  fiyat: number
  olcuBirimi: string
  tarih: string
}

export type LiveData = {
  brent: number | null
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
  fuelPrices: FuelPriceItem[]
  lpgPrices: FuelPriceItem[]
}

export function useLiveData() {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

  const [data, setData] = useState<LiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/live-data`)
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Veri alınamadı')
        setLoading(false)
      })
  }, [API_BASE_URL])

  return { data, loading, error }
}
