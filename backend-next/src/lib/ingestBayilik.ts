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
// Scoped to currently-active (ONAYLANDI) distributors: an already-
// terminated distributor is very unlikely to still have live dealers
// under it.
const BAYILIK_SERVICES: { market: string; serviceName: string }[] = [
  { market: 'petrol', serviceName: 'petrolBayilikLisansiSorgula' },
  { market: 'lpg', serviceName: 'lpgBayilikLisansiSorgula' },
]

export const BAYILIK_MARKETS = BAYILIK_SERVICES.map((s) => s.market)

// EPDK's sustained rate limit turned out to be far stricter than initial
// testing suggested: a single call could trip a 429 even ~5-10s after the
// previous one succeeded, and retrying with backoff did not reliably
// recover within a session. Rather than guess further at the exact safe
// rate, this processes a small batch of distributors per invocation with
// a generous gap between calls, and relies on being triggered repeatedly
// (every few minutes, see .github/workflows/ingest-bayilik.yml) to cycle
// through the full distributor list over time.
const BATCH_SIZE = 5
const DELAY_BETWEEN_CALLS_MS = 20000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
      // How many active distributors haven't been checked even once yet,
      // BEFORE this batch runs. If any remain, we're still in the initial
      // backfill cycle -- newly-seen bayilik records this batch are first
      // observations, not real "issued" events. Once every distributor has
      // been checked at least once, later cycles' new records are real
      // events (a genuinely new dealer license appeared since we last
      // looked at that specific distributor).
      const { count: neverCheckedCount } = await supabase
        .from('licenses')
        .select('id', { count: 'exact', head: true })
        .eq('market', market)
        .eq('license_type', 'dagitici')
        .eq('lisans_durumu', 'ONAYLANDI')
        .is('bayilik_last_fetched_at', null)

      const stillBackfilling = (neverCheckedCount ?? 0) > 0

      const { data: distributors, error: distributorsError } = await supabase
        .from('licenses')
        .select('id, lisans_no')
        .eq('market', market)
        .eq('license_type', 'dagitici')
        .eq('lisans_durumu', 'ONAYLANDI')
        .order('bayilik_last_fetched_at', { ascending: true, nullsFirst: true })
        .limit(BATCH_SIZE)

      if (distributorsError) throw distributorsError

      const allRecords: EpdkLicenseRecord[] = []
      const now = new Date().toISOString()
      let failures = 0

      // A failure on one distributor must not lose the records already
      // fetched from earlier ones in this same batch, and must not mark
      // that distributor "checked" -- it needs to stay eligible so the
      // next cron tick picks it up again instead of skipping ahead of it.
      for (const { id, lisans_no: dagiticiLisansNo } of distributors ?? []) {
        try {
          // Only 1 retry here, not the default -- a failed distributor
          // naturally gets picked up by the next cron tick 5 minutes
          // later, which is a better recovery strategy than retrying
          // harder in-process against what turned out to be a
          // multi-minute-plus quota, not a short burst window.
          const records = await queryEpdkGatewayWithRetry<EpdkLicenseRecord[]>(
            serviceName,
            { dagiticiLisansNo, lisansDurumu: LICENSE_STATUSES },
            1
          )
          allRecords.push(...records)

          // Mark this distributor checked regardless of how many dealers
          // it returned, so one with zero current dealers doesn't get
          // retried ahead of distributors never checked at all.
          await supabase
            .from('licenses')
            .update({ bayilik_last_fetched_at: now })
            .eq('id', id)
        } catch (error) {
          failures++
          console.error(
            `Bayilik fetch failed for ${dagiticiLisansNo} (${market}):`,
            error instanceof Error ? error.message : error
          )
        }

        await sleep(DELAY_BETWEEN_CALLS_MS)
      }

      const result = await ingestLicenses(
        market,
        LICENSE_TYPE,
        allRecords,
        stillBackfilling
      )

      await supabase
        .from('ingestion_runs')
        .update({
          finished_at: new Date().toISOString(),
          records_seen: result.recordsSeen,
          events_created: result.eventsCreated,
          status: 'success',
          error_message:
            failures > 0
              ? `${failures}/${distributors?.length ?? 0} distributors failed this batch (will retry next run)`
              : null,
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
