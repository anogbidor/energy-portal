import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { toLicenseApiShape } from '@/lib/licenseApiShape'

type Data = { success: true; data: unknown } | { success: false; error: string }

// Single-license detail view backing the "who's under this distributor /
// which distributor is this dealer under, and where were they before"
// feature: for a dagitici (distributor), returns every bayilik (dealer)
// license currently under it; for a bayilik, returns its full
// distributor-transfer history reconstructed from license_events
// (event_type='distributor_changed'), which was already being detected
// and stored but never surfaced anywhere until now.
//
// The dagitici<->bayilik link is matched by company name
// (dagitim_sirketi / lisans_sahibi_unvani), not license number. EPDK's
// bayilik responses were checked directly (raw column) and never include
// a distributor license-number field at all -- only the distributor's
// name -- so dagitici_lisans_no on bayilik rows has been unpopulated
// (always null) since it was written; it isn't a real field EPDK sends.
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

    if (licenseRow.license_type === 'dagitici') {
      const distributorName = licenseRow.lisans_sahibi_unvani as string

      if (countOnly) {
        const { count, error: countError } = await supabase
          .from('licenses')
          .select('id', { count: 'exact', head: true })
          .eq('market', market)
          .eq('license_type', 'bayilik')
          .eq('dagitim_sirketi', distributorName)
        if (countError) throw countError

        return res.status(200).json({
          success: true,
          data: { license, networkCount: count ?? 0, network: null, history: null },
        })
      }

      const { data: bayiRows, error: bayiError } = await supabase
        .from('licenses')
        .select('*')
        .eq('market', market)
        .eq('license_type', 'bayilik')
        .eq('dagitim_sirketi', distributorName)
        .order('lisans_sahibi_unvani', { ascending: true })

      if (bayiError) throw bayiError

      const network = (bayiRows ?? []).map(toLicenseApiShape)

      return res.status(200).json({
        success: true,
        data: { license, network, networkCount: network.length, history: null },
      })
    }

    // Bayilik: reconstruct the full distributor-transfer timeline from
    // the event log rather than only showing the current dagitim_sirketi
    // already on the record.
    const { data: eventRows, error: eventsError } = await supabase
      .from('license_events')
      .select('old_value, new_value, effective_at')
      .eq('market', market)
      .eq('lisans_no', lisansNo)
      .eq('event_type', 'distributor_changed')
      .order('effective_at', { ascending: true })

    if (eventsError) throw eventsError

    const history = (eventRows ?? []).map((row) => {
      const oldValue = row.old_value as Record<string, unknown> | null
      const newValue = row.new_value as Record<string, unknown> | null
      return {
        fromDistributor: oldValue?.dagitim_sirketi ?? null,
        toDistributor: newValue?.dagitim_sirketi ?? null,
        effectiveAt: row.effective_at,
      }
    })

    return res.status(200).json({
      success: true,
      data: { license, network: null, networkCount: null, history },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
