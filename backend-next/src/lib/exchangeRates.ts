export type ExchangeRates = {
  usdTry: number | null
  eurTry: number | null
  gbpTry: number | null
}

// exchangerate.host's /live endpoint only gives USD-based quotes
// (USDTRY, USDEUR, USDGBP), so EUR/TRY and GBP/TRY are derived by
// dividing USD/TRY by USD/EUR and USD/GBP respectively. Shared by
// live-data.ts (serves the current rates) and the daily snapshot cron
// (persists them for the trend arrows) so there's one place that knows
// how to talk to this API.
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const apiKey = process.env.EXCHANGE_API_KEY
  const res = await fetch(`https://api.exchangerate.host/live?access_key=${apiKey}`)
  const data = await res.json()

  const USDTRY = data?.quotes?.USDTRY ?? null
  const USDEUR = data?.quotes?.USDEUR ?? null
  const USDGBP = data?.quotes?.USDGBP ?? null

  return {
    usdTry: USDTRY,
    eurTry: USDTRY && USDEUR ? USDTRY / USDEUR : null,
    gbpTry: USDTRY && USDGBP ? USDTRY / USDGBP : null,
  }
}
