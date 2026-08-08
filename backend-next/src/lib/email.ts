import { Resend } from 'resend'

// enerjipost.com is verified with Resend (DKIM/SPF confirmed directly --
// a test send to an arbitrary, non-account-owner address succeeded),
// so this can send to anyone now, not just the account's own email.
const FROM = 'Enerjipost <bildirim@enerjipost.com>'

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

// Shared by the owner-notification helper below and, eventually,
// subscriber-facing emails (welcome/confirmation) now that the domain
// is verified and can send to arbitrary recipients.
async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn('sendEmail skipped: RESEND_API_KEY not set')
    return
  }
  await resend.emails.send({ from: FROM, to, subject, text })
}

// Failures here are logged, never thrown -- a notification email not
// sending shouldn't fail the actual signup/inquiry, which already
// succeeded by the time this runs.
export async function notifyOwner(subject: string, text: string): Promise<void> {
  const to = process.env.NOTIFY_EMAIL
  if (!to) {
    console.warn('notifyOwner skipped: NOTIFY_EMAIL not set')
    return
  }

  try {
    await sendEmail(to, subject, text)
  } catch (error) {
    console.error('notifyOwner failed:', error)
  }
}
