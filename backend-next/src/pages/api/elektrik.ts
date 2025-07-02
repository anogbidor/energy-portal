import type { NextApiRequest, NextApiResponse } from 'next'
import type { Client } from 'soap'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const WSDL_URL =
  'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint?wsdl'

type Data = { success: true; data: unknown } | { success: false; error: string }

// Typed client interface for dynamic async methods
interface SoapClientWithAsyncMethods extends Client {
  [methodName: string]: ((args: unknown) => Promise<unknown>) | unknown
}

let soapClient: SoapClientWithAsyncMethods | null = null

// Cache storage
let cachedData: unknown = null
let lastFetchedAt = 0
const CACHE_TTL = 1000 * 60 * 20 // 20 minutes

// License status mapping (Turkish -> API codes)
const LISANS_STATUS_MAP: Record<string, string> = {
  Sonlandırıldı: 'SONLANDIRILDI',
  'İptal Edildi': 'IPTAL_EDILDI',
  'Süresi Doldu': 'SURESI_DOLDU',
  'Yürürlükten Kaldırıldı': 'YURURLUKTEN_KALDIRILDI',
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const method = 'elektrikDagitimLisansiSorgula'

  // Use query param or default
  let lisansDurumu =
    typeof req.query.lisansDurumu === 'string'
      ? req.query.lisansDurumu
      : 'ONAYLANDI'

  // Map Turkish status to API status code if exists
  if (LISANS_STATUS_MAP[lisansDurumu]) {
    lisansDurumu = LISANS_STATUS_MAP[lisansDurumu]
  }

  // Return cached data if fresh
  if (cachedData && Date.now() - lastFetchedAt < CACHE_TTL) {
    console.log('Serving cached elektrik data')
    return res.status(200).json({ success: true, data: cachedData })
  }

  try {
    if (!soapClient) {
      const soap = await import('soap')
      soapClient = (await soap.createClientAsync(
        WSDL_URL
      )) as SoapClientWithAsyncMethods
      soapClient.setEndpoint(
        'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint'
      )
    }

    const methodAsyncName = method + 'Async'
    const methodFn = soapClient[methodAsyncName]

    if (typeof methodFn === 'function') {
      const args = { lisansDurumu }
      const result = await methodFn.call(soapClient, args)
      if (Array.isArray(result) && result.length > 0) {
        cachedData = result[0]
        lastFetchedAt = Date.now()
        return res.status(200).json({ success: true, data: cachedData })
      } else {
        return res
          .status(500)
          .json({ success: false, error: 'Invalid SOAP response' })
      }
    } else {
      return res
        .status(400)
        .json({ success: false, error: `Method ${method} not found` })
    }
  } catch (error: unknown) {
    let message = 'Unknown error'
    if (error instanceof Error) message = error.message
    return res.status(500).json({ success: false, error: message })
  }
}
