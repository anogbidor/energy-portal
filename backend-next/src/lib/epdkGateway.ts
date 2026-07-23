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
