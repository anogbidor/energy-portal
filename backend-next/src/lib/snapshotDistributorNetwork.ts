import { getSupabaseAdmin } from './supabaseAdmin'
import { BAYILIK_MARKETS } from './ingestBayilik'

// Records today's active-dealer count per distributor, for the
// network-health chart on the distributor detail page. Pure DB read --
// no EPDK calls at all, since this only counts rows we've already
// ingested. Only markets with a real bayilik (dealer) endpoint have a
// meaningful "network" to snapshot (petrol, lpg) -- distributor/dagitici
// counts alone (dogalgaz, elektrik) aren't a network in the same sense.
//
// Counts come from a grouped SQL query (distributor_dealer_counts RPC,
// see the migration) rather than one COUNT per distributor -- the
// original per-distributor version made ~104 round trips and took 90s+,
// well past cron-job.org's 30s max timeout, even though the job always
// finished successfully server-side regardless of the caller giving up.
export async function snapshotDistributorNetwork(): Promise<{
  rowsWritten: number
}> {
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)
  const rows: {
    market: string
    dagitici_lisans_no: string
    distributor_name: string
    active_dealer_count: number
    snapshot_date: string
  }[] = []

  for (const market of BAYILIK_MARKETS) {
    const { data: distributors, error: distributorsError } = await supabase
      .from('licenses')
      .select('lisans_no, lisans_sahibi_unvani')
      .eq('market', market)
      .eq('license_type', 'dagitici')
      .eq('lisans_durumu', 'ONAYLANDI')

    if (distributorsError) throw distributorsError

    const { data: counts, error: countsError } = await supabase.rpc(
      'distributor_dealer_counts',
      { p_market: market }
    )

    if (countsError) throw countsError

    const countByName = new Map<string, number>(
      (counts ?? []).map((row: { dagitim_sirketi: string; dealer_count: number }) => [
        row.dagitim_sirketi,
        row.dealer_count,
      ])
    )

    for (const distributor of distributors ?? []) {
      rows.push({
        market,
        dagitici_lisans_no: distributor.lisans_no,
        distributor_name: distributor.lisans_sahibi_unvani,
        active_dealer_count: countByName.get(distributor.lisans_sahibi_unvani) ?? 0,
        snapshot_date: today,
      })
    }
  }

  if (rows.length === 0) return { rowsWritten: 0 }

  const { error: upsertError } = await supabase
    .from('distributor_network_snapshots')
    .upsert(rows, { onConflict: 'market,dagitici_lisans_no,snapshot_date' })

  if (upsertError) throw upsertError

  return { rowsWritten: rows.length }
}
