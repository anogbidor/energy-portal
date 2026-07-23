import { getSupabaseAdmin } from './supabaseAdmin'
import { LICENSE_STATUSES, queryEpdkGateway } from './epdkGateway'

// Shape covers both the "dagitici" (distributor) and "bayilik" (dealer)
// EPDK endpoints -- field names differ (e.g. lisansSahibiUnvani vs
// lisansSahibi, adres vs tesisAdresi), so everything is optional here and
// mapRecord() below reconciles it.
export interface EpdkLicenseRecord {
  lisansNo: string
  lisansDurumu: string
  lisansSahibiUnvani?: string
  lisansSahibi?: string
  vergiNo?: string
  baslangicTarihi?: string
  bitisTarihi?: string
  iptalSonaErdirmeTarihi?: string
  iptalSonaErdimeAciklama?: string | null
  il?: string | null
  ilce?: string | null
  adres?: string
  tesisAdresi?: string
  dagiticiLisansNo?: string
  dagitimSirketi?: string
  dagiticiIleYapilanSozlesmeBaslangicTarihi?: string
  dagiticiIleYapilanSozlesmeBitisTarihi?: string
  kategorisi?: string
  kacakciliktanIptalEdildi?: number
  [key: string]: unknown
}

interface IngestResult {
  recordsSeen: number
  recordsSkipped: number
  eventsCreated: number
}

// Fields whose changes are worth recording as a market-movement event.
const TRACKED_FIELDS = [
  'lisans_durumu',
  'lisans_sahibi_unvani',
  'bitis_tarihi',
  'dagitim_sirketi',
  'dagitici_lisans_no',
] as const

function isCorrupted(value: unknown): boolean {
  return typeof value === 'string' && value.includes('�')
}

// Normalizes to a plain YYYY-MM-DD string. This matters for the diff below,
// not just storage: EPDK returns full ISO datetimes (e.g.
// "2036-09-01T00:00:00Z"), but Postgres `date` columns read back as plain
// "2036-09-01" -- comparing those two forms directly would flag every
// record as "changed" on every run, which is exactly what happened before
// this fix (100% of records were flagged, a dead giveaway of a format
// mismatch rather than real diffs).
function toDateOrNull(value: string | undefined | null): string | null {
  if (!value) return null
  return value.slice(0, 10)
}

function mapRecord(
  market: string,
  licenseType: string,
  record: EpdkLicenseRecord
) {
  return {
    market,
    license_type: licenseType,
    lisans_no: record.lisansNo,
    lisans_durumu: record.lisansDurumu,
    lisans_sahibi_unvani: record.lisansSahibiUnvani ?? record.lisansSahibi ?? null,
    vergi_no: record.vergiNo ?? null,
    baslangic_tarihi: toDateOrNull(record.baslangicTarihi),
    bitis_tarihi: toDateOrNull(record.bitisTarihi),
    iptal_tarihi: toDateOrNull(record.iptalSonaErdirmeTarihi),
    iptal_aciklama: record.iptalSonaErdimeAciklama ?? null,
    il: record.il ?? null,
    ilce: record.ilce ?? null,
    adres: record.adres ?? record.tesisAdresi ?? null,
    dagitici_lisans_no: record.dagiticiLisansNo ?? null,
    dagitim_sirketi: record.dagitimSirketi ?? null,
    sozlesme_baslangic_tarihi: toDateOrNull(
      record.dagiticiIleYapilanSozlesmeBaslangicTarihi
    ),
    sozlesme_bitis_tarihi: toDateOrNull(
      record.dagiticiIleYapilanSozlesmeBitisTarihi
    ),
    kategorisi: record.kategorisi ?? null,
    kacakciliktan_iptal:
      typeof record.kacakciliktanIptalEdildi === 'number'
        ? record.kacakciliktanIptalEdildi === 1
        : null,
    raw: record,
  }
}

type MappedRecord = ReturnType<typeof mapRecord>

// Pulls current rows for (market, licenseType), diffs the fresh EPDK
// records against them, and writes both tables in one batched upsert +
// one batched insert -- not a per-record loop -- since this runs inside a
// time-limited serverless function and a market can have 300+ records.
export async function ingestLicenses(
  market: string,
  licenseType: string,
  records: EpdkLicenseRecord[]
): Promise<IngestResult> {
  const supabase = getSupabaseAdmin()

  const { count: priorSuccessCount } = await supabase
    .from('ingestion_runs')
    .select('id', { count: 'exact', head: true })
    .eq('market', market)
    .eq('license_type', licenseType)
    .eq('status', 'success')

  // On the very first ingestion for a (market, licenseType), every record
  // is "new" to us but not actually news -- don't flood license_events
  // with hundreds of synthetic "issued" rows for licenses that have
  // existed for years. Diffing starts meaning something from run 2 on.
  const isFirstRun = !priorSuccessCount

  const { data: existingRows } = await supabase
    .from('licenses')
    .select('*')
    .eq('market', market)
    .eq('license_type', licenseType)

  const existingByLisansNo = new Map(
    (existingRows ?? []).map((row) => [row.lisans_no as string, row])
  )

  const now = new Date().toISOString()
  const events: Record<string, unknown>[] = []

  // A handful of records (e.g. withdrawn/IADE_EDILDI applications) never
  // got assigned a license number by EPDK at all -- lisansNo is genuinely
  // null in their own data, not a mapping issue. There's nothing to key or
  // diff them by, so they're skipped rather than forcing a fake identifier.
  const recordsWithLisansNo = records.filter((record) => record.lisansNo)
  const recordsSkipped = records.length - recordsWithLisansNo.length

  const upsertRows: (MappedRecord & {
    first_seen_at: string
    last_seen_at: string
    updated_at: string
  })[] = recordsWithLisansNo.map((record) => {
    const mapped = mapRecord(market, licenseType, record)
    const existing = existingByLisansNo.get(mapped.lisans_no)

    // EPDK's own API intermittently serves corrupted Turkish characters --
    // confirmed via raw bytes containing literal U+FFFD replacement chars
    // for the same field on different calls, not a mapping/encoding issue
    // here. If the incoming value is corrupted but we already have a clean
    // stored one, keep the clean one rather than regressing it.
    if (existing) {
      for (const field of TRACKED_FIELDS) {
        if (isCorrupted(mapped[field]) && !isCorrupted(existing[field])) {
          ;(mapped as Record<string, unknown>)[field] = existing[field]
        }
      }
    }

    if (!existing) {
      if (!isFirstRun) {
        events.push({
          lisans_no: mapped.lisans_no,
          market,
          license_type: licenseType,
          event_type: 'issued',
          new_value: mapped,
          effective_at: mapped.baslangic_tarihi,
        })
      }
      return { ...mapped, first_seen_at: now, last_seen_at: now, updated_at: now }
    }

    // A field is only a real "change" when both sides are clean text --
    // a corrupted value on either side (whether we're about to overwrite
    // old garbage with a clean pull, or vice versa) is EPDK's encoding
    // noise, not a market event, even though the stored value still gets
    // updated to whichever side is clean.
    const changed: Record<string, { old: unknown; new: unknown }> = {}
    for (const field of TRACKED_FIELDS) {
      if (
        existing[field] !== mapped[field] &&
        !isCorrupted(existing[field]) &&
        !isCorrupted(mapped[field])
      ) {
        changed[field] = { old: existing[field], new: mapped[field] }
      }
    }

    if (!isFirstRun && Object.keys(changed).length > 0) {
      const isDistributorChange =
        'dagitim_sirketi' in changed || 'dagitici_lisans_no' in changed
      const isStatusChange = 'lisans_durumu' in changed

      events.push({
        lisans_no: mapped.lisans_no,
        market,
        license_type: licenseType,
        event_type: isDistributorChange
          ? 'distributor_changed'
          : isStatusChange
          ? 'status_changed'
          : 'updated',
        old_value: Object.fromEntries(
          Object.entries(changed).map(([k, v]) => [k, v.old])
        ),
        new_value: Object.fromEntries(
          Object.entries(changed).map(([k, v]) => [k, v.new])
        ),
        note: mapped.iptal_aciklama,
        effective_at: mapped.iptal_tarihi ?? mapped.baslangic_tarihi,
      })
    }

    return {
      ...mapped,
      first_seen_at: existing.first_seen_at,
      last_seen_at: now,
      updated_at: now,
    }
  })

  const { data: upserted, error: upsertError } = await supabase
    .from('licenses')
    .upsert(upsertRows, { onConflict: 'market,license_type,lisans_no' })
    .select('id, lisans_no')

  if (upsertError) throw upsertError

  if (events.length > 0 && upserted) {
    const idByLisansNo = new Map(
      upserted.map((row) => [row.lisans_no as string, row.id])
    )
    const eventsWithLicenseId = events.map((event) => ({
      ...event,
      license_id: idByLisansNo.get(event.lisans_no as string) ?? null,
    }))

    const { error: eventsError } = await supabase
      .from('license_events')
      .insert(eventsWithLicenseId)
    if (eventsError) throw eventsError
  }

  return {
    recordsSeen: records.length,
    recordsSkipped,
    eventsCreated: events.length,
  }
}

const LICENSE_TYPE = 'dagitici'

export const DISTRIBUTOR_SERVICES: { market: string; serviceName: string }[] = [
  { market: 'petrol', serviceName: 'petrolDagiticiLisansSorgula' },
  { market: 'lpg', serviceName: 'lpgDagiticiLisansiSorgula' },
  { market: 'dogalgaz', serviceName: 'dogalgazDagitimLisansiSorgula' },
  { market: 'elektrik', serviceName: 'elektrikDagitimLisansiSorgula' },
]

export type IngestRunSummary =
  | ({ market: string; status: 'success' } & IngestResult)
  | { market: string; status: 'error'; error: string }

// Single entry point for running the distributor ingestion across all 4
// markets, including the ingestion_runs bookkeeping that isFirstRun above
// depends on. Both the cron route and the local manual-trigger script call
// this, so there's exactly one code path -- no risk of the two drifting
// out of sync with each other again.
export async function runDistributorIngestion(): Promise<IngestRunSummary[]> {
  const supabase = getSupabaseAdmin()
  const results: IngestRunSummary[] = []

  for (const { market, serviceName } of DISTRIBUTOR_SERVICES) {
    const { data: run } = await supabase
      .from('ingestion_runs')
      .insert({ market, license_type: LICENSE_TYPE, status: 'running' })
      .select('id')
      .single()

    try {
      const records = await queryEpdkGateway<EpdkLicenseRecord[]>(
        serviceName,
        { lisansDurumu: LICENSE_STATUSES }
      )

      const result = await ingestLicenses(market, LICENSE_TYPE, records)

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
