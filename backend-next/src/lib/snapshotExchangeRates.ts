import { getSupabaseAdmin } from './supabaseAdmin'
import { fetchExchangeRates } from './exchangeRates'

// Persists today's USD/EUR/GBP-TRY rates so live-data.ts can compare
// against the most recent earlier snapshot and return a real up/down
// trend instead of nothing. Idempotent: re-running on the same day just
// upserts the same rows.
export async function snapshotExchangeRates(): Promise<{ rowsWritten: number }> {
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  const rates = await fetchExchangeRates()

  const rows = (
    [
      ['usdTry', rates.usdTry],
      ['eurTry', rates.eurTry],
      ['gbpTry', rates.gbpTry],
    ] as const
  )
    .filter(([, value]) => value !== null)
    .map(([pair, value]) => ({
      pair,
      value: value as number,
      snapshot_date: today,
    }))

  if (rows.length === 0) return { rowsWritten: 0 }

  const { error } = await supabase
    .from('exchange_rate_snapshots')
    .upsert(rows, { onConflict: 'pair,snapshot_date' })

  if (error) throw error

  return { rowsWritten: rows.length }
}
