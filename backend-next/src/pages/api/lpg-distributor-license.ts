process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import type { NextApiRequest, NextApiResponse } from 'next'

const WSDL_URL =
  'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint?wsdl'

function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173') // Replace '*' with your frontend origin in production
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization'
  )
}

interface LpgDistributorLicenseResponse {
  LicenseNumber?: string
  DistributorName?: string
  ValidUntil?: string
}

type Data = {
  result?: LpgDistributorLicenseResponse
  error?: string
}

interface LisansSoapClient {
  lpgDagiticiLisansSorgulaAsync(
    args: Record<string, unknown>
  ): Promise<[LpgDistributorLicenseResponse]>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // Dynamically import soap to fix import issues
    const soap = await import('soap')

    // Create client and assert to our typed interface
    const clientRaw = await soap.createClientAsync(WSDL_URL)
    const client: LisansSoapClient = clientRaw as unknown as LisansSoapClient

    const args: Record<string, unknown> = {} // Fill with needed params

    const [result] = await client.lpgDagiticiLisansSorgulaAsync(args)

    console.log('SOAP Response:', result)

    res.status(200).json({ result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('SOAP call failed:', message)
    res.status(500).json({ error: message })
  }
}
