import { getSupabaseAdmin } from './supabaseAdmin'
import { DISTRIBUTOR_SERVICES } from './ingestLicenses'
import { BAYILIK_MARKETS } from './ingestBayilik'

export type HealthCheck = {
  name: string
  ok: boolean
  detail: string
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Thresholds are generous multiples of each pipeline's expected cadence,
// not the cadence itself -- the point is to catch a genuine stall (like
// the null-response bug that silently froze both bayilik queues for
// 1-32+ hours before anyone noticed), not to fire on ordinary jitter.
const DAGITICI_MAX_AGE_MS = 90 * MINUTE // runs every 15 min
const BAYILIK_MAX_AGE_MS: Record<string, number> = {
  petrol: 3 * HOUR, // full cycle ~64 min (32 distributors x 2 min)
  lpg: 6 * HOUR, // full cycle ~144 min (72 distributors x 2 min)
}
const SNAPSHOT_MAX_AGE_DAYS = 2 // once-daily jobs

function ageString(ms: number): string {
  const hours = ms / HOUR
  if (hours < 1) return `${Math.round(ms / MINUTE)}m`
  if (hours < 48) return `${hours.toFixed(1)}h`
  return `${(hours / 24).toFixed(1)}d`
}

// The distributor-license cron only runs 08:00-19:59 Europe/Istanbul
// (see ingest-licenses.yml / the matching cron-job.org schedule) --
// EPDK doesn't publish anything overnight, so there's a real, expected
// 12+ hour gap between the last tick before 20:00 and the first tick
// at 08:00 the next day. Checking a flat "ran in the last 90 minutes"
// threshold around the clock would flag this every single evening even
// though nothing is wrong -- confirmed directly: cron-job.org's own
// history showed unbroken 15-minute ticks all day with zero gaps, right
// up to the window's last one at 19:45, which is exactly what this
// check was flagging as "stalled." A 20-minute grace period after
// 08:00 absorbs the first tick's normal startup lag.
function isDagiticiActiveWindow(): boolean {
  const istanbulHour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Istanbul',
      hour: 'numeric',
      hour12: false,
      minute: 'numeric',
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'hour')?.value
  )
  const istanbulMinute = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Istanbul',
      minute: 'numeric',
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'minute')?.value
  )
  const minutesSinceMidnight = istanbulHour * 60 + istanbulMinute
  return minutesSinceMidnight >= 8 * 60 + 20 && minutesSinceMidnight < 20 * 60
}

export async function checkIngestionHealth(): Promise<{
  healthy: boolean
  checks: HealthCheck[]
}> {
  const supabase = getSupabaseAdmin()
  const checks: HealthCheck[] = []
  const now = Date.now()

  // Distributor (dagitici) ingestion -- one check per market. Only
  // enforced during the cron's own active window (see
  // isDagiticiActiveWindow) -- outside it, a gap is expected, not a
  // problem.
  const dagiticiWindowActive = isDagiticiActiveWindow()
  for (const { market } of DISTRIBUTOR_SERVICES) {
    const { data } = await supabase
      .from('ingestion_runs')
      .select('finished_at')
      .eq('market', market)
      .eq('license_type', 'dagitici')
      .eq('status', 'success')
      .order('finished_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const finishedAt = data?.finished_at ? new Date(data.finished_at).getTime() : null
    const age = finishedAt ? now - finishedAt : Infinity
    const withinThreshold = age <= DAGITICI_MAX_AGE_MS
    checks.push({
      name: `dagitici-ingest-${market}`,
      ok: !dagiticiWindowActive || withinThreshold,
      detail: finishedAt
        ? `last success ${ageString(age)} ago${
            !dagiticiWindowActive ? ' (outside active hours, not enforced)' : ''
          }`
        : 'never succeeded',
    })
  }

  // Bayilik (dealer) ingestion -- the oldest bayilik_last_fetched_at
  // among currently-active distributors is the real signal: if it's not
  // climbing roughly in step with wall-clock time, the queue is stuck
  // behind a distributor that keeps failing (this is exactly what
  // happened -- a null EPDK response was misread as a failure, so that
  // distributor never got marked checked and blocked everyone behind it).
  for (const market of BAYILIK_MARKETS) {
    const { data } = await supabase
      .from('licenses')
      .select('bayilik_last_fetched_at')
      .eq('market', market)
      .eq('license_type', 'dagitici')
      .eq('lisans_durumu', 'ONAYLANDI')
      .order('bayilik_last_fetched_at', { ascending: true, nullsFirst: true })
      .limit(1)
      .maybeSingle()

    const oldest = data?.bayilik_last_fetched_at
      ? new Date(data.bayilik_last_fetched_at).getTime()
      : null
    const age = oldest ? now - oldest : Infinity
    const maxAge = BAYILIK_MAX_AGE_MS[market] ?? 3 * HOUR
    checks.push({
      name: `bayilik-ingest-${market}`,
      ok: age <= maxAge,
      detail:
        oldest === null
          ? 'a distributor has never been checked'
          : `oldest distributor check is ${ageString(age)} old (max ${ageString(maxAge)})`,
    })
  }

  // Daily snapshot tables -- price history, network size, exchange rates.
  const snapshotChecks: { name: string; table: string; dateCol: string }[] = [
    { name: 'snapshot-prices', table: 'fuel_price_history', dateCol: 'tarih' },
    {
      name: 'snapshot-network',
      table: 'distributor_network_snapshots',
      dateCol: 'snapshot_date',
    },
    {
      name: 'snapshot-exchange-rates',
      table: 'exchange_rate_snapshots',
      dateCol: 'snapshot_date',
    },
  ]
  for (const { name, table, dateCol } of snapshotChecks) {
    const { data } = await supabase
      .from(table)
      .select(dateCol)
      .order(dateCol, { ascending: false })
      .limit(1)
      .maybeSingle()

    const latestDate = data
      ? (data as unknown as Record<string, string>)[dateCol]
      : null
    const ageDays = latestDate
      ? (now - new Date(latestDate).getTime()) / DAY
      : Infinity
    checks.push({
      name,
      ok: ageDays <= SNAPSHOT_MAX_AGE_DAYS,
      detail: latestDate
        ? `latest snapshot is ${ageDays.toFixed(1)}d old`
        : 'no snapshot ever recorded',
    })
  }

  return { healthy: checks.every((c) => c.ok), checks }
}
