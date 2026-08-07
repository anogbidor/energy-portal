export type ExchangeRates = {
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
}

// Frankfurter (ECB reference rates) -- free, no API key, no quota.
// Switched from exchangerate.host after its free-tier monthly limit
// was exhausted; this has no key to run out. One call gives TRY/EUR/GBP
// per USD; EUR/TRY and GBP/TRY are derived the same way the old
// exchangerate.host-based code did (usdTry / (currency per USD)) since
// Frankfurter doesn't offer a direct TRY base. Shared by live-data.ts
// (serves the current rates) and the daily snapshot cron (persists
// them for the trend arrows) so there's one place that knows how to
// talk to this API.
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const res = await fetch(
    'https://api.frankfurter.dev/v1/latest?from=USD&to=TRY,EUR,GBP'
  )
  const data = await res.json()

  const usdTry = data?.rates?.TRY ?? null
  const usdEur = data?.rates?.EUR ?? null
  const usdGbp = data?.rates?.GBP ?? null

  return {
    usdTry,
    eurTry: usdTry && usdEur ? usdTry / usdEur : null,
    gbpTry: usdTry && usdGbp ? usdTry / usdGbp : null,
  }
}
