import { getSupabaseAdmin } from './supabaseAdmin'
import { LICENSE_STATUSES, queryEpdkGatewayWithRetry } from './epdkGateway'
import {
  ingestLicenses,
  type EpdkLicenseRecord,
  type IngestRunSummary,
} from './ingestLicenses'

const LICENSE_TYPE = 'bayilik'

// Unlike the distributor endpoints, Bayilik (dealer/station) queries
// require a dagiticiLisansNo -- there's no "give me everything" call. To
// get the full station list you fetch it once per distributor and merge.
// Scoped to currently-active (ONAYLANDI) distributors for now: an
// already-terminated distributor is very unlikely to still have live
// dealers under it, and querying every distributor ever (361+159 records,
// most long inactive) against a gateway that's already shown it throttles
// aggressively isn't worth the load for what it would likely add.
const BAYILIK_SERVICES: { market: string; serviceName: string }[] = [
  { market: 'petrol', serviceName: 'petrolBayilikLisansiSorgula' },
  { market: 'lpg', serviceName: 'lpgBayilikLisansiSorgula' },
]

export const BAYILIK_MARKETS = BAYILIK_SERVICES.map((s) => s.market)

// EPDK's throttle turned out to trigger on far fewer calls than expected
// (seen tripping after just 2-3 requests within a short window during
// testing), so this is deliberately conservative -- better a slow ingestion
// run than one that reliably fails partway through.
const DELAY_BETWEEN_CALLS_MS = 2000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Optionally scoped to a single market: with a conservative 2s
// inter-request delay, both markets combined (93 distributors) risks
// getting close to Vercel Hobby's 300s function ceiling once retries are
// factored in, so the cron route calls this once per market instead of
// both together in one invocation.
export async function runBayilikIngestion(
  onlyMarket?: string
): Promise<IngestRunSummary[]> {
  const supabase = getSupabaseAdmin()
  const results: IngestRunSummary[] = []
  const services = onlyMarket
    ? BAYILIK_SERVICES.filter((s) => s.market === onlyMarket)
    : BAYILIK_SERVICES

  for (const { market, serviceName } of services) {
    const { data: run } = await supabase
      .from('ingestion_runs')
      .insert({ market, license_type: LICENSE_TYPE, status: 'running' })
      .select('id')
      .single()

    try {
      const { data: distributors, error: distributorsError } = await supabase
        .from('licenses')
        .select('lisans_no')
        .eq('market', market)
        .eq('license_type', 'dagitici')
        .eq('lisans_durumu', 'ONAYLANDI')

      if (distributorsError) throw distributorsError

      const allRecords: EpdkLicenseRecord[] = []

      for (const { lisans_no: dagiticiLisansNo } of distributors ?? []) {
        const records = await queryEpdkGatewayWithRetry<EpdkLicenseRecord[]>(
          serviceName,
          { dagiticiLisansNo, lisansDurumu: LICENSE_STATUSES }
        )
        allRecords.push(...records)
        await sleep(DELAY_BETWEEN_CALLS_MS)
      }

      const result = await ingestLicenses(market, LICENSE_TYPE, allRecords)

      await supabase
        .from('ingestion_runs')
        .update({
          finished_at: new Date().toISOString(),
          records_seen: result.recordsSeen,
          events_created: result.eventsCreated,
          status: 'success',
        })
        .eq('id', run?.id)

      results.push({ market, status: 'success', ...result })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      await supabase
        .from('ingestion_runs')
        .update({
          finished_at: new Date().toISOString(),
          status: 'error',
          error_message: message,
        })
        .eq('id', run?.id)

      results.push({ market, status: 'error', error: message })
    }
  }

  return results
}
