// Cross-checks every EPDK field name our ingestion code actually reads
// against what EPDK's live API really sends, on both endpoint shapes
// (dagitici and bayilik -- confirmed these use different field names for
// the same concept in at least one case: iptalSonaErdimeAciklama vs
// iptalSonaErdirmeAciklama). A field we read that never appears in a
// live sample is either a typo or genuinely unsent by EPDK -- either
// way, worth a human look before trusting it.
//
// Usage: node --env-file=.env.local --import tsx scripts/audit-epdk-field-names.ts
//
// Only samples the petrol dagitici + petrol bayilik services (2 EPDK
// calls total, mindful of EPDK's strict rate limit) -- other markets
// share the same underlying schema per record type, so this isn't
// re-verified per market on every run. Re-run manually whenever a new
// field is added to EpdkLicenseRecord, or if EPDK's API ever changes.
import { LICENSE_STATUSES, queryEpdkGatewayWithRetry } from '../src/lib/epdkGateway'

// Every field EpdkLicenseRecord declares and mapRecord() actually reads
// in ingestLicenses.ts. Keep this list in sync by hand -- it's
// deliberately not auto-derived from the interface, since the whole
// point is a second, independent statement of "these are the fields we
// depend on" to check against reality.
const FIELDS_WE_READ = [
  'lisansNo',
  'lisansDurumu',
  'lisansSahibiUnvani',
  'lisansSahibi',
  'vergiNo',
  'baslangicTarihi',
  'bitisTarihi',
  'iptalSonaErdirmeTarihi',
  'iptalSonaErdirmeAciklama',
  'iptalSonaErdimeAciklama',
  'il',
  'ilce',
  'adres',
  'tesisAdresi',
  'dagiticiLisansNo',
  'dagitimSirketi',
  'dagiticiIleYapilanSozlesmeBaslangicTarihi',
  'dagiticiIleYapilanSozlesmeBitisTarihi',
  'kategorisi',
  'kacakciliktanIptalEdildi',
]

async function fetchRecords(serviceName: string, params: Record<string, unknown>) {
  return queryEpdkGatewayWithRetry<Record<string, unknown>[]>(serviceName, params, 1)
}

function keysOf(records: Record<string, unknown>[]) {
  const keys = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) keys.add(key)
  }
  return keys
}

async function main() {
  console.log('Sampling live EPDK responses...')

  // One call for the dagitici sample; the resulting records also supply
  // a real distributor license number to query bayilik by, so this
  // never fetches the dagitici endpoint twice.
  const dagiticiRecords = await fetchRecords('petrolDagiticiLisansSorgula', {
    lisansDurumu: LICENSE_STATUSES,
  })
  const dagiticiKeys = keysOf(dagiticiRecords)
  console.log(`dagitici sample: ${dagiticiKeys.size} distinct keys`)

  const sampleLisansNo = dagiticiRecords[0]?.lisansNo as string | undefined
  if (!sampleLisansNo) {
    throw new Error('Could not get a sample distributor license number to query bayilik with')
  }

  const bayilikRecords = await fetchRecords('petrolBayilikLisansiSorgula', {
    dagiticiLisansNo: sampleLisansNo,
    lisansDurumu: LICENSE_STATUSES,
  })
  const bayilikKeys = keysOf(bayilikRecords)
  console.log(`bayilik sample (under ${sampleLisansNo}): ${bayilikKeys.size} distinct keys`)

  const allRealKeys = new Set([...dagiticiKeys, ...bayilikKeys])

  const missing = FIELDS_WE_READ.filter((field) => !allRealKeys.has(field))

  console.log('\n--- Result ---')
  if (missing.length === 0) {
    console.log('All fields we read match a real key in at least one live sample. ✅')
  } else {
    console.log(
      `${missing.length} field(s) we read never appeared in either live sample -- likely a typo or a field EPDK doesn't actually send:`
    )
    for (const field of missing) console.log(`  - ${field}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
