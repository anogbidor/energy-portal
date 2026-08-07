import { useEffect, useState } from 'react'
import type { LicenseItem, Market } from './useLicenses'

export type EventType =
  | 'issued'
  | 'status_changed'
  | 'unvan_changed'
  | 'distributor_changed'
  | 'updated'

export interface HistoryEvent {
  eventType: EventType
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  note: string | null
  effectiveAt: string | null
}

export interface LicenseDetailData {
  license: LicenseItem & {
    licenseType: string
    dagitimSirketi?: string | null
    market: string
  }
  network: LicenseItem[] | null
  networkCount: number | null
  history: HistoryEvent[] | null
  relatedLicenses: (LicenseItem & { market: string; licenseType: string })[] | null
  relatedLicensesCount: number | null
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

function cacheKey(market: Market, lisansNo: string, page: number) {
  return `${market}|${lisansNo}|${page}`
}

// Module-level cache + in-flight dedup, same pattern as useLicenses --
// this is also what backs hover-prefetch on table rows (see
// LicenseTable's onMouseEnter): a hover primes the cache well before a
// click, so by the time someone actually clicks through the data is
// often already sitting there instead of showing a spinner.
const cache = new Map<string, LicenseDetailData>()
const inFlight = new Map<string, Promise<LicenseDetailData>>()

function fetchDetail(
  market: Market,
  lisansNo: string,
  page: number
): Promise<LicenseDetailData> {
  const key = cacheKey(market, lisansNo, page)
  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = (async () => {
    const res = await fetch(
      `${API_BASE_URL}/api/license-detail?market=${market}&lisansNo=${encodeURIComponent(
        lisansNo
      )}&page=${page}`
    )
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'API error')
    cache.set(key, json.data)
    return json.data as LicenseDetailData
  })()

  inFlight.set(key, promise)
  return promise.finally(() => inFlight.delete(key))
}

// Called on row hover in LicenseTable -- fires the fetch early without
// anyone waiting on it.
export function prefetchLicenseDetail(market: Market, lisansNo: string) {
  fetchDetail(market, lisansNo, 1).catch(() => {
    // Swallowed -- the page's own fetch (with a real error state) runs
    // if/when it actually mounts.
  })
}

// page only matters for a dagitici's dealer network -- the backend caps
// it at 40 rows per page and returns the real total count separately,
// since PostgREST won't return more than 1000 rows from one query no
// matter what's asked for, and a distributor can have several thousand
// dealers (e.g. Petrol Ofisi has 6,096).
export function useLicenseDetail(market?: Market, lisansNo?: string, page = 1) {
  const cached =
    market && lisansNo ? cache.get(cacheKey(market, lisansNo, page)) : undefined
  const [data, setData] = useState<LicenseDetailData | null>(cached ?? null)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!market || !lisansNo) return
    let cancelled = false
    const key = cacheKey(market, lisansNo, page)
    const fromCache = cache.get(key)

    if (fromCache) {
      setData(fromCache)
      setLoading(false)
    } else {
      setLoading(true)
      setData(null)
    }
    setError(null)

    fetchDetail(market, lisansNo, page)
      .then((json) => {
        if (cancelled) return
        setData(json)
      })
      .catch((err) => {
        if (cancelled) return
        if (!fromCache) setError(err instanceof Error ? err.message : 'Hata')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [market, lisansNo, page])

  return { data, loading, error }
}

// Lightweight count-only lookup for the "typing a distributor's license
// number shows how many dealers are under them" inline hint -- avoids
// pulling the full (potentially thousands-long) dealer list just to
// show a number while someone is still typing.
export async function fetchNetworkCount(
  market: Market,
  lisansNo: string
): Promise<number | null> {
  const res = await fetch(
    `${API_BASE_URL}/api/license-detail?market=${market}&lisansNo=${encodeURIComponent(
      lisansNo
    )}&countOnly=true`
  )
  const json = await res.json()
  if (!json.success) return null
  return json.data.networkCount ?? null
}

// Bayi records never carry the distributor's own lisans_no (EPDK's
// bayilik endpoint only sends the distributor's name, never a license
// number for them) -- clicking a "Şirket" name in the list needs this
// to resolve somewhere real to navigate to.
export async function resolveDistributor(
  market: Market,
  unvan: string
): Promise<string | null> {
  const res = await fetch(
    `${API_BASE_URL}/api/resolve-distributor?market=${market}&unvan=${encodeURIComponent(
      unvan
    )}`
  )
  const json = await res.json()
  if (!json.success) return null
  return json.lisansNo ?? null
}
