import type { NextApiRequest, NextApiResponse } from 'next'
import type { Client } from 'soap'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const WSDL_URL =
  'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint?wsdl'

type Data = { success: true; data: unknown } | { success: false; error: string }

// Define a safe typed client interface for dynamic async methods
interface SoapClientWithAsyncMethods extends Client {
  [methodName: string]: ((args: unknown) => Promise<unknown>) | unknown
}

let soapClient: SoapClientWithAsyncMethods | null = null

// License status mapping (Turkish -> API codes)
const LISANS_STATUS_MAP: Record<string, string> = {
  Sonlandırıldı: 'SONLANDIRILDI',
  'İptal Edildi': 'IPTAL_EDILDI',
  'Süresi Doldu': 'SURESI_DOLDU',
  'Yürürlükten Kaldırıldı': 'YURURLUKTEN_KALDIRILDI',
}

function enableCors(req: NextApiRequest, res: NextApiResponse<Data>): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*') // allow all origins, adjust as needed for production
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (enableCors(req, res)) return

  let { method = 'petrolDagiticiLisansSorgula', lisansDurumu = 'ONAYLANDI' } =
    req.query

  // Ensure strings
  method = String(method)
  lisansDurumu = String(lisansDurumu)

  // Map Turkish status to API code if present
  if (LISANS_STATUS_MAP[lisansDurumu]) {
    lisansDurumu = LISANS_STATUS_MAP[lisansDurumu]
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
        return res.status(200).json({ success: true, data: result[0] })
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
