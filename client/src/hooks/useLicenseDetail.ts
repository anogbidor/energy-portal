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

// page only matters for a dagitici's dealer network -- the backend caps
// it at 40 rows per page and returns the real total count separately,
// since PostgREST won't return more than 1000 rows from one query no
// matter what's asked for, and a distributor can have several thousand
// dealers (e.g. Petrol Ofisi has 6,096).
export function useLicenseDetail(market?: Market, lisansNo?: string, page = 1) {
  const [data, setData] = useState<LicenseDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!market || !lisansNo) return
    setLoading(true)
    setError(null)
    fetch(
      `${API_BASE_URL}/api/license-detail?market=${market}&lisansNo=${encodeURIComponent(
        lisansNo
      )}&page=${page}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || 'API error')
        setData(json.data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Hata'))
      .finally(() => setLoading(false))
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
