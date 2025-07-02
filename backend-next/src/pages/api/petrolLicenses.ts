import type { NextApiRequest, NextApiResponse } from 'next'
import type { Client } from 'soap'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const WSDL_URL =
  'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint?wsdl'

type Data = { success: true; data: unknown } | { success: false; error: string }

interface SoapClientWithAsyncMethods extends Client {
  [methodName: string]: ((args: unknown) => Promise<unknown>) | unknown
}

let soapClient: SoapClientWithAsyncMethods | null = null

// Cache object
let cache: {
  timestamp: number
  data: unknown | null
} = {
  timestamp: 0,
  data: null,
}

const CACHE_TTL = 1000 * 60 * 20 // 1 hour in milliseconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const now = Date.now()

  // If cache is valid, return cached data
  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return res.status(200).json({ success: true, data: cache.data })
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

    const method = 'petrolDagiticiLisansSorgula'
    const methodAsyncName = method + 'Async'
    const methodFn = soapClient[methodAsyncName]

    if (typeof methodFn === 'function') {
      const args = { lisansDurumu: 'ONAYLANDI' }
      const result = await methodFn.call(soapClient, args)
      if (Array.isArray(result) && result.length > 0) {
        const responseData = result[0]
        // Update cache
        cache = {
          timestamp: now,
          data: responseData,
        }
        return res.status(200).json({ success: true, data: responseData })
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
