// Manual local trigger for the Bayilik (station/dealer) ingestion job.
// Usage: node --env-file=.env.local --import tsx scripts/run-ingest-bayilik-once.ts
import { runBayilikIngestion } from '../src/lib/ingestBayilik'

async function main() {
  const results = await runBayilikIngestion()
  console.log(JSON.stringify(results, null, 2))
}

main()
