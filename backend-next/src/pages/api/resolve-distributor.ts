import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true; lisansNo: string | null } | { success: false; error: string }

// Bayi records never carry the distributor's own lisans_no -- EPDK's
// bayilik endpoint only sends the distributor's company name
// (dagitim_sirketi), never a license number for them (confirmed
// directly against live responses). Clicking a "Şirket" name in the
// list needs this lookup to get somewhere real to navigate to.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)
  applyPublicCache(res, { sMaxAge: 3600, staleWhileRevalidate: 86400 })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const market = typeof req.query.market === 'string' ? req.query.market : undefined
  const unvan = typeof req.query.unvan === 'string' ? req.query.unvan : undefined

  if (!market || !unvan) {
    return res.status(400).json({ success: false, error: 'market and unvan required' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('licenses')
      .select('lisans_no')
      .eq('market', market)
      .eq('license_type', 'dagitici')
      .eq('lisans_sahibi_unvani', unvan)
      .limit(1)
      .maybeSingle()

    if (error) throw error

    return res.status(200).json({ success: true, lisansNo: data?.lisans_no ?? null })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
