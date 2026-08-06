import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { toLicenseApiShape } from '@/lib/licenseApiShape'

type Data = { success: true; data: unknown } | { success: false; error: string }

// Single-license detail view. Three things, for both dagitici
// (distributor) and bayilik (dealer) records alike:
//
// 1. network / networkCount -- dagitici only: every bayilik currently
//    under it. Matched by company name (dagitim_sirketi /
//    lisans_sahibi_unvani), not license number -- EPDK's bayilik
//    responses were checked directly (raw column) and never include a
//    distributor license-number field at all, only the distributor's
//    name -- so dagitici_lisans_no on bayilik rows has been unpopulated
//    since it was written; it isn't a real field EPDK sends.
//
// 2. history -- every event_type ever recorded for this exact license
//    (issued, status changes, title changes, distributor transfers),
//    not just transfers. This is the full lifecycle of one specific
//    license number.
//
// 3. relatedLicenses -- every OTHER license (any market, any type)
//    sharing this record's vergi_no. A dealer applicant's tax ID is the
//    one reliable key linking all of their licenses together across
//    different stations/markets/distributors over time -- the point is
//    to let a distributor evaluating a bayi see the applicant's full
//    track record before signing them, not just this one station.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const market = typeof req.query.market === 'string' ? req.query.market : undefined
  const lisansNo =
    typeof req.query.lisansNo === 'string' ? req.query.lisansNo : undefined
  const countOnly = req.query.countOnly === 'true'
  const pageParam =
    typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : NaN
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const PAGE_SIZE = 40

  if (!market || !lisansNo) {
    return res
      .status(400)
      .json({ success: false, error: 'market and lisansNo are required' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: licenseRow, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('market', market)
      .eq('lisans_no', lisansNo)
      .maybeSingle()

    if (licenseError) throw licenseError
    if (!licenseRow) {
      return res.status(404).json({ success: false, error: 'Lisans bulunamadı' })
    }

    const license = toLicenseApiShape(licenseRow)
    const isDistributor = licenseRow.license_type === 'dagitici'

    let network: unknown[] | null = null
    let networkCount: number | null = null

    if (isDistributor) {
      const distributorName = licenseRow.lisans_sahibi_unvani as string

      // The real count, from its own head:true query -- PostgREST caps
      // a row-returning query at 1000 by default (server-side; .limit()
      // on the client can't override it, confirmed directly against
      // this project), so a distributor with more dealers than that
      // (e.g. Petrol Ofisi's real 6,096) needs actual pagination, not
      // one big fetch.
      const { count, error: countError } = await supabase
        .from('licenses')
        .select('id', { count: 'exact', head: true })
        .eq('market', market)
        .eq('license_type', 'bayilik')
        .eq('dagitim_sirketi', distributorName)
      if (countError) throw countError
      networkCount = count ?? 0

      if (!countOnly) {
        const from = (page - 1) * PAGE_SIZE
        const { data: bayiRows, error: bayiError } = await supabase
          .from('licenses')
          .select('*')
          .eq('market', market)
          .eq('license_type', 'bayilik')
          .eq('dagitim_sirketi', distributorName)
          .order('lisans_sahibi_unvani', { ascending: true })
          .range(from, from + PAGE_SIZE - 1)
        if (bayiError) throw bayiError
        network = (bayiRows ?? []).map(toLicenseApiShape)
      }

      if (countOnly) {
        return res.status(200).json({
          success: true,
          data: {
            license,
            network: null,
            networkCount,
            history: null,
            relatedLicenses: null,
            relatedLicensesCount: null,
          },
        })
      }
    }

    // Full lifecycle for this exact license, every event type -- not
    // just transfers. Applies to both dagitici and bayilik: a
    // distributor's own status or title can change too.
    const { data: eventRows, error: eventsError } = await supabase
      .from('license_events')
      .select('event_type, old_value, new_value, note, effective_at')
      .eq('market', market)
      .eq('lisans_no', lisansNo)
      .order('effective_at', { ascending: true })

    if (eventsError) throw eventsError

    const history = (eventRows ?? []).map((row) => ({
      eventType: row.event_type,
      oldValue: row.old_value,
      newValue: row.new_value,
      note: row.note,
      effectiveAt: row.effective_at,
    }))

    // Cross-reference by tax ID: every other license this same legal
    // entity holds or has held, anywhere -- the actual "know everything
    // about this applicant" feature. Skipped if vergi_no is missing
    // (a handful of withdrawn applications never got one from EPDK).
    let relatedLicenses: unknown[] | null = null
    let relatedLicensesCount: number | null = null
    const vergiNo = licenseRow.vergi_no as string | null
    if (vergiNo) {
      const { count: relatedCount, error: relatedCountError } = await supabase
        .from('licenses')
        .select('id', { count: 'exact', head: true })
        .eq('vergi_no', vergiNo)
        .neq('lisans_no', lisansNo)
      if (relatedCountError) throw relatedCountError
      relatedLicensesCount = relatedCount ?? 0

      const { data: relatedRows, error: relatedError } = await supabase
        .from('licenses')
        .select('*')
        .eq('vergi_no', vergiNo)
        .neq('lisans_no', lisansNo)
        .limit(200)
      if (relatedError) throw relatedError
      relatedLicenses = (relatedRows ?? []).map(toLicenseApiShape)
    }

    return res.status(200).json({
      success: true,
      data: {
        license,
        network,
        networkCount,
        history,
        relatedLicenses,
        relatedLicensesCount,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
