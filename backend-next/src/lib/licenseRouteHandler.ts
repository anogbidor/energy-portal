import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from './cors'
import { getSupabaseAdmin } from './supabaseAdmin'
import { toLicenseApiShape } from './licenseApiShape'

type Data = { success: true; data: unknown[] } | { success: false; error: string }

// All 4 markets' distributor-license routes are now thin reads against the
// `licenses` table (populated by the ingestion job) instead of live EPDK
// proxies -- no more in-memory caching either, since a Postgres read is
// fast and isn't subject to EPDK's own rate limiting.
export function createLicenseRoute(market: string) {
  return async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    applyCors(req, res)

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    const date = typeof req.query.date === 'string' ? req.query.date : undefined

    try {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('licenses').select('*').eq('market', market)

      if (date) {
        // Date-filtered drill-down (from the homepage summary table)
        // includes every license type issued OR cancelled that day --
        // the summary counts this backs track issuance and cancellation
        // as separate activity per license (see license-summary.ts), so
        // the detail view has to match both or cancellations would 404
        // into an empty table.
        query = query.or(`baslangic_tarihi.eq.${date},iptal_tarihi.eq.${date}`)
      } else {
        // Default (no date): the existing /license page's per-market tabs,
        // which have only ever shown distributor-level licenses.
        query = query.eq('license_type', 'dagitici')
      }

      const { data, error } = await query
      if (error) throw error

      return res.status(200).json({
        success: true,
        data: (data ?? []).map(toLicenseApiShape),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return res.status(500).json({ success: false, error: message })
    }
  }
}
