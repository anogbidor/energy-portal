// One-off full backfill for a single market's Bayilik data, looping the
// normal small-batch ingestion until every active distributor has been
// checked at least once. Safe to re-run -- it naturally stops once nothing
// is left unfetched.
// Usage: node --env-file=.env.local --import tsx scripts/backfill-bayilik-market.ts <market>
import { getSupabaseAdmin } from '../src/lib/supabaseAdmin'
import { runBayilikIngestion } from '../src/lib/ingestBayilik'

async function main() {
  const market = process.argv[2]
  if (!market) {
    console.error('Usage: backfill-bayilik-market.ts <market>')
    process.exit(1)
  }

  const supabase = getSupabaseAdmin()

  for (let batch = 1; ; batch++) {
    const { count: remaining } = await supabase
      .from('licenses')
      .select('id', { count: 'exact', head: true })
      .eq('market', market)
      .eq('license_type', 'dagitici')
      .eq('lisans_durumu', 'ONAYLANDI')
      .is('bayilik_last_fetched_at', null)

    if (!remaining || remaining === 0) {
      console.log(`Done -- no unfetched distributors left for ${market}.`)
      break
    }

    console.log(`Batch ${batch}: ${remaining} distributors still unfetched for ${market}...`)
    const results = await runBayilikIngestion(market)
    console.log(JSON.stringify(results, null, 2))

    if (results.some((r) => r.status === 'error')) {
      console.error('A batch errored -- stopping so it can be inspected before continuing.')
      break
    }
  }
}

main()
