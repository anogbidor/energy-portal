import { getSupabaseAdmin } from './supabaseAdmin'
import { BAYILIK_MARKETS } from './ingestBayilik'

// Records today's active-dealer count per distributor, for the
// network-health chart on the distributor detail page. Pure DB read --
// no EPDK calls at all, since this only counts rows we've already
// ingested. Only markets with a real bayilik (dealer) endpoint have a
// meaningful "network" to snapshot (petrol, lpg) -- distributor/dagitici
// counts alone (dogalgaz, elektrik) aren't a network in the same sense.
export async function snapshotDistributorNetwork(): Promise<{
  rowsWritten: number
}> {
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)
  let rowsWritten = 0

  for (const market of BAYILIK_MARKETS) {
    const { data: distributors, error: distributorsError } = await supabase
      .from('licenses')
      .select('lisans_no, lisans_sahibi_unvani')
      .eq('market', market)
      .eq('license_type', 'dagitici')
      .eq('lisans_durumu', 'ONAYLANDI')

    if (distributorsError) throw distributorsError

    for (const distributor of distributors ?? []) {
      const { count, error: countError } = await supabase
        .from('licenses')
        .select('id', { count: 'exact', head: true })
        .eq('market', market)
        .eq('license_type', 'bayilik')
        .eq('dagitim_sirketi', distributor.lisans_sahibi_unvani)
        .eq('lisans_durumu', 'ONAYLANDI')

      if (countError) throw countError

      const { error: upsertError } = await supabase
        .from('distributor_network_snapshots')
        .upsert(
          {
            market,
            dagitici_lisans_no: distributor.lisans_no,
            distributor_name: distributor.lisans_sahibi_unvani,
            active_dealer_count: count ?? 0,
            snapshot_date: today,
          },
          { onConflict: 'market,dagitici_lisans_no,snapshot_date' }
        )

      if (upsertError) throw upsertError
      rowsWritten += 1
    }
  }

  return { rowsWritten }
}
