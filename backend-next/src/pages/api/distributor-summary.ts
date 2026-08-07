import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors, applyPublicCache } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Row = {
  lisansNo: string
  lisansSahibiUnvani: string
  aktif: number
  iptal: number
  transferIn: number
  transferOut: number
}

type Data = { success: true; data: Row[] } | { success: false; error: string }

const MARKETS = ['petrol', 'lpg', 'dogalgaz', 'elektrik']

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)
  applyPublicCache(res, { sMaxAge: 900, staleWhileRevalidate: 3600 })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const market = typeof req.query.market === 'string' ? req.query.market : 'petrol'
  if (!MARKETS.includes(market)) {
    return res.status(400).json({ success: false, error: 'Invalid market' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('distributor_movement_summary', {
      p_market: market,
    })

    if (error) throw error

    const rows: Row[] = (data ?? []).map(
      (row: {
        lisans_no: string
        lisans_sahibi_unvani: string
        aktif: number
        iptal: number
        transfer_in: number
        transfer_out: number
      }) => ({
        lisansNo: row.lisans_no,
        lisansSahibiUnvani: row.lisans_sahibi_unvani,
        aktif: row.aktif,
        iptal: row.iptal,
        transferIn: row.transfer_in,
        transferOut: row.transfer_out,
      })
    )

    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
