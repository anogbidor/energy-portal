import { Resend } from 'resend'

// Resend's sandbox mode (no verified domain yet -- see NOTIFY_EMAIL)
// can only send from their shared onboarding@resend.dev address and
// only to the account owner's own verified email, not arbitrary
// recipients. That's fine here: this only ever notifies the site
// owner, never the subscriber/inquirer themselves (a real
// confirmation email to them needs a verified domain first).
const FROM = 'Enerjipost <onboarding@resend.dev>'

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

// Failures here are logged, never thrown -- a notification email not
// sending shouldn't fail the actual signup/inquiry, which already
// succeeded by the time this runs.
export async function notifyOwner(subject: string, text: string): Promise<void> {
  const resend = getResend()
  const to = process.env.NOTIFY_EMAIL
  if (!resend || !to) {
    console.warn('notifyOwner skipped: RESEND_API_KEY or NOTIFY_EMAIL not set')
    return
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, text })
  } catch (error) {
    console.error('notifyOwner failed:', error)
  }
}
