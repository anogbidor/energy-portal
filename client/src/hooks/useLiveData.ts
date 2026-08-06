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

// Module-level cache + in-flight dedup: useLiveData is called
// independently by Hero, ExchangeRates, MarketsSideBar, and FuelPrice --
// without this, rendering Home or Prices fires 2+ simultaneous duplicate
// fetches for the exact same data, and every single navigation back to
// either page re-shows a loading spinner for data that hasn't changed.
let cache: LiveData | null = null
let inFlight: Promise<LiveData> | null = null

function fetchLiveData(): Promise<LiveData> {
  if (inFlight) return inFlight
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

  inFlight = fetch(`${API_BASE_URL}/api/live-data`)
    .then((res) => res.json())
    .then((json: LiveData) => {
      cache = json
      return json
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

export function useLiveData() {
  const [data, setData] = useState<LiveData | null>(cache)
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchLiveData()
      .then((json) => {
        if (cancelled) return
        setData(json)
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        if (!cache) setError('Veri alınamadı')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
