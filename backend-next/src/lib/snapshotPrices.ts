import { getSupabaseAdmin } from './supabaseAdmin'
import { fetchBulletin } from './fuelBulletin'

const BULLETIN_SERVICE: Record<string, string> = {
  petrol: 'petrolBayiSatisFiyatBulten',
  lpg: 'lpgBayiSatisFiyatBultenGunluk',
}

// Persists today's fuel/LPG bulletin into fuel_price_history --
// live-data.ts only ever served the current bulletin without storing
// it, so there was no way to chart a price trend. Idempotent: re-running
// on the same day's bulletin just upserts the same rows.
//
// One market per call, not both in one sweep: EPDK's rate limit applies
// broadly enough that two calls fired close together risk tripping it
// (observed directly: a call that succeeds alone returned empty right
// after a second call landed within the same second). Callers are
// expected to schedule petrol and lpg as separate cron invocations a
// few minutes apart, the same way ingest-bayilik already staggers its
// per-market runs -- this keeps each invocation fast instead of paying
// an in-process sleep to space out two calls in one request.
export async function snapshotPrices(
  market: 'petrol' | 'lpg'
): Promise<{ rowsWritten: number }> {
  const supabase = getSupabaseAdmin()

  const prices = await fetchBulletin(BULLETIN_SERVICE[market])

  // The LPG bulletin has been observed including at least one row with
  // no "Yakıt" label at all (a real price, unit "Adet" -- likely a
  // cylinder/deposit line item rather than an actual fuel type), which
  // fuel_price_history's not-null constraint correctly rejects. Rather
  // than let one such row fail the day's snapshot, skip anything
  // without a usable fuel-type name -- yakit is what every query and
  // chart groups by, so a row without one isn't useful to store anyway.
  const rows = prices
    .map((p) => ({
      market,
      yakit: p.yakit,
      fiyat: p.fiyat,
      olcu_birimi: p.olcuBirimi,
      tarih: p.tarih,
    }))
    .filter((row) => {
      if (!row.yakit) {
        console.warn('Skipping price row with no yakit label:', row)
        return false
      }
      return true
    })

  if (rows.length === 0) return { rowsWritten: 0 }

  const { error } = await supabase
    .from('fuel_price_history')
    .upsert(rows, { onConflict: 'market,yakit,tarih' })

  if (error) throw error

  return { rowsWritten: rows.length }
}
