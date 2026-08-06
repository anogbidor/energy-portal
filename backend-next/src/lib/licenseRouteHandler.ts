import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from './cors'
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
    applyPublicCache(res)

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    const date = typeof req.query.date === 'string' ? req.query.date : undefined

    try {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('licenses').select('*').eq('market', market)

      if (date) {
        // Date-filtered drill-down (from the homepage summary table)
        // includes every license type issued OR cancelled that day, plus
        // any license with a title-change/distributor-transfer event
        // effective that day -- those don't move baslangic_tarihi or
        // iptal_tarihi at all, so without this they'd 404 into an empty
        // table (see license-summary.ts for how these are counted).
        const { data: eventRows } = await supabase
          .from('license_events')
          .select('lisans_no')
          .eq('market', market)
          .eq('effective_at', date)
          .in('event_type', ['distributor_changed', 'unvan_changed'])

        const eventLisansNos = Array.from(
          new Set((eventRows ?? []).map((r) => r.lisans_no as string))
        )

        let orClause = `baslangic_tarihi.eq.${date},iptal_tarihi.eq.${date}`
        if (eventLisansNos.length > 0) {
          const inList = eventLisansNos.map((n) => `"${n}"`).join(',')
          orClause += `,lisans_no.in.(${inList})`
        }
        query = query.or(orClause)
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
