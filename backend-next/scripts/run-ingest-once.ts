// Manual local trigger for the license ingestion job, without needing the
// Next.js dev server running.
// Usage: node --env-file=.env.local --import tsx scripts/run-ingest-once.ts
import { runDistributorIngestion } from '../src/lib/ingestLicenses'

async function main() {
  const results = await runDistributorIngestion()
  console.log(JSON.stringify(results, null, 2))
}

main()
