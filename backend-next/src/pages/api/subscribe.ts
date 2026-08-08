import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '@/lib/cors'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { notifyOwner } from '@/lib/email'

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

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ success: false, error: 'Geçerli bir e-posta adresi girin' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })

    if (error) throw error

    await notifyOwner(
      'Yeni bülten aboneliği',
      `${email} bültene abone oldu.`
    )

    return res.status(200).json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}
