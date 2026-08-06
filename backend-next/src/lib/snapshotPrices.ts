import { getSupabaseAdmin } from './supabaseAdmin'
import { fetchBulletin } from './fuelBulletin'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Persists today's fuel/LPG bulletin into fuel_price_history --
// live-data.ts only ever served the current bulletin without storing
// it, so there was no way to chart a price trend. Idempotent: re-running
// on the same day's bulletin just upserts the same rows.
//
// The two bulletin calls are sequential with a pause between them, not
// Promise.all -- EPDK's rate limit turned out to apply broadly enough
// that two calls fired at once risk tripping it (observed directly: a
// call that succeeds alone returned empty right after a second call
// landed within the same second). This only needs to succeed once a
// day, so there's no reason to risk it for a few saved seconds.
export async function snapshotPrices(): Promise<{ rowsWritten: number }> {
  const supabase = getSupabaseAdmin()

  const fuelPrices = await fetchBulletin('petrolBayiSatisFiyatBulten')
  await sleep(20000)
  const lpgPrices = await fetchBulletin('lpgBayiSatisFiyatBultenGunluk')

  // The LPG bulletin has been observed including at least one row with
  // no "Yakıt" label at all (a real price, unit "Adet" -- likely a
  // cylinder/deposit line item rather than an actual fuel type), which
  // fuel_price_history's not-null constraint correctly rejects. Rather
  // than let one such row fail the whole day's snapshot, skip anything
  // without a usable fuel-type name -- yakit is what every query and
  // chart groups by, so a row without one isn't useful to store anyway.
  const rows = [
    ...fuelPrices.map((p) => ({
      market: 'petrol',
      yakit: p.yakit,
      fiyat: p.fiyat,
      olcu_birimi: p.olcuBirimi,
      tarih: p.tarih,
    })),
    ...lpgPrices.map((p) => ({
      market: 'lpg',
      yakit: p.yakit,
      fiyat: p.fiyat,
      olcu_birimi: p.olcuBirimi,
      tarih: p.tarih,
    })),
  ].filter((row) => {
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
