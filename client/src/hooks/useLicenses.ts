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
  // The distributor a bayi belongs to -- null for a dagitici record
  // itself, since a distributor has no "parent" distributor. Was
  // already sent by the API (licenseApiShape.ts) but never declared
  // here, so nothing outside LicenseDetail's own inline type could
  // actually read it.
  dagitimSirketi?: string | null
  // True when this license has a distributor-transfer event in its
  // history even though its own status stayed ONAYLANDI throughout --
  // lets the table show a "Transfer Edildi" marker under "Yürürlükte"
  // for a license that changed hands.
  hasTransferred?: boolean
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

const endpoints: Record<Market, string> = {
  petrol: `${API_BASE_URL}/api/petrolLicenses`,
  lpg: `${API_BASE_URL}/api/lpg`,
  dogalgaz: `${API_BASE_URL}/api/dogalgaz`,
  elektrik: `${API_BASE_URL}/api/elektrik`,
}

function cacheKey(market: Market, date?: string) {
  return `${market}|${date ?? ''}`
}

function buildUrl(market: Market, date?: string) {
  return date
    ? `${endpoints[market]}?date=${encodeURIComponent(date)}`
    : endpoints[market]
}

// Module-level, not component state -- survives unmount/remount so
// switching tabs or navigating away and back doesn't re-trigger a
// visible loading spinner for data we already have. Each entry also
// tracks its own in-flight promise so concurrent callers (e.g. a
// prefetch racing the page's own mount) share one fetch instead of
// firing it twice.
const cache = new Map<string, LicenseItem[]>()
const inFlight = new Map<string, Promise<LicenseItem[]>>()

async function fetchLicenses(market: Market, date?: string): Promise<LicenseItem[]> {
  const key = cacheKey(market, date)
  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = (async () => {
    const res = await fetch(buildUrl(market, date))
    const json = await res.json()
    if (!json.success) {
      throw new Error(json.error || 'API returned error')
    }
    const items = json.data as LicenseItem[]
    cache.set(key, items)
    return items
  })()

  inFlight.set(key, promise)
  try {
    return await promise
  } finally {
    inFlight.delete(key)
  }
}

// Warms the cache for a market ahead of the /license page actually
// mounting -- called once on app load for the default market (see
// App.tsx) so the page can render from cache instantly instead of
// showing a spinner on first visit.
export function prefetchLicenses(market: Market, date?: string) {
  fetchLicenses(market, date).catch(() => {
    // Prefetch failures are silent -- the page's own fetch (with a
    // real error state) runs if/when it actually mounts.
  })
}

interface UseLicensesResult {
  data: LicenseItem[] | null
  error?: string
  loading: boolean
  setMarket: (market: Market) => void
}

export function useLicenses(
  initialMarket: Market = 'petrol',
  date?: string
): UseLicensesResult {
  const [market, setMarket] = useState<Market>(initialMarket)
  const cached = cache.get(cacheKey(market, date))
  const [data, setData] = useState<LicenseItem[] | null>(cached ?? null)
  const [error, setError] = useState<string>()
  // Only show the loading state when there's nothing cached to show
  // immediately -- a cache hit renders straight away and revalidates
  // silently in the background.
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false
    const key = cacheKey(market, date)
    const fromCache = cache.get(key)

    if (fromCache) {
      setData(fromCache)
      setLoading(false)
    } else {
      setLoading(true)
      setData(null)
    }
    setError(undefined)

    fetchLicenses(market, date)
      .then((items) => {
        if (cancelled) return
        setData(items)
      })
      .catch((e) => {
        if (cancelled) return
        if (!fromCache) setError(`Network error: ${e}`)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [market, date])

  return { data, error, loading, setMarket }
}
