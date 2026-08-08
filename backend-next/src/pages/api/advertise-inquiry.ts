import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Data = { success: true } | { success: false; error: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS'])
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  const company =
    typeof req.body?.company === 'string' ? req.body.company.trim() : null
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''

  if (!name || !EMAIL_PATTERN.test(email) || !message) {
    return res
      .status(400)
      .json({ success: false, error: 'Ad, geçerli bir e-posta ve mesaj zorunludur' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('advertising_inquiries')
      .insert({ name, email, company, message })

    if (error) throw error

    return res.status(200).json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
