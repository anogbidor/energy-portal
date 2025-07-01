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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method = 'petrolDagiticiLisansSorgula', lisansDurumu = 'ONAYLANDI' } =
    req.query

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

    const methodAsyncName = String(method) + 'Async'

    const methodFn = soapClient[methodAsyncName]

    if (typeof methodFn === 'function') {
      const args = { lisansDurumu: String(lisansDurumu) }
      // methodFn returns Promise<any>, but we keep it unknown here
      const result = await methodFn.call(soapClient, args)
      // Result is expected to be an array with one item
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
