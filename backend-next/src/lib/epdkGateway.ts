import https from 'https'

const EPDK_GATEWAY_HOST = 'apigateway.epdk.gov.tr'

export class EpdkGatewayError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'EpdkGatewayError'
    this.statusCode = statusCode
  }
}

// EPDK's gateway expects a JSON body on a GET request, which the standard
// fetch() API refuses to send (`GET/HEAD cannot have body`), so this uses
// the lower-level https module instead.
export function queryEpdkGateway<T = unknown>(
  serviceName: string,
  body: Record<string, unknown>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)

    const req = https.request(
      {
        hostname: EPDK_GATEWAY_HOST,
        path: `/${serviceName}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => {
          raw += chunk
        })
        res.on('end', () => {
          if (!res.statusCode || res.statusCode >= 400) {
            reject(
              new EpdkGatewayError(
                `EPDK gateway ${serviceName} returned ${res.statusCode}: ${raw}`,
                res.statusCode
              )
            )
            return
          }
          try {
            resolve(JSON.parse(raw) as T)
          } catch (err) {
            reject(
              new EpdkGatewayError(
                `Failed to parse EPDK gateway response for ${serviceName}: ${
                  (err as Error).message
                }`
              )
            )
          }
        })
      }
    )

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// EPDK's gateway throttles far more aggressively than its own error
// message ("reaching Throttling limit") suggests -- confirmed in practice
// where even two calls a few seconds apart triggered a 429. Any call site
// making more than an occasional single request should go through this
// rather than queryEpdkGateway directly.
export async function queryEpdkGatewayWithRetry<T = unknown>(
  serviceName: string,
  body: Record<string, unknown>,
  maxRetries = 4
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryEpdkGateway<T>(serviceName, body)
    } catch (error) {
      lastError = error
      const isThrottled =
        error instanceof EpdkGatewayError && error.statusCode === 429
      if (!isThrottled || attempt === maxRetries) throw error
      await sleep(2000 * 2 ** attempt) // 2s, 4s, 8s, 16s
    }
  }
  throw lastError
}

// Verified against the gateway's own validation error (it rejects an
// invalid lisansDurumu with a 400 that lists the accepted values) --
// this is the same set for every market's dagitici/bayilik endpoint.
export const LICENSE_STATUSES = [
  'ONAYLANDI',
  'SONLANDIRILDI',
  'IPTAL_EDILDI',
  'IADE_EDILDI',
  'FAALIYETI_GECICI_DURDURULDU',
]
