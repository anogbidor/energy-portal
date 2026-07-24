// Manual local trigger for one Bayilik (station/dealer) ingestion batch.
// Usage: node --env-file=.env.local --import tsx scripts/run-ingest-bayilik-once.ts [market]
import { runBayilikIngestion } from '../src/lib/ingestBayilik'

async function main() {
  const market = process.argv[2]
  const results = await runBayilikIngestion(market)
  console.log(JSON.stringify(results, null, 2))
}

main()
