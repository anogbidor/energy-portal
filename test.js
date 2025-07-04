process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const soap = require('soap')

const WSDL_URL =
  'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint?wsdl'

async function testSoap() {
  try {
    const client = await soap.createClientAsync(WSDL_URL)
    client.setEndpoint(
      'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint'
    )

    // List all available async methods on the client
    const asyncMethods = Object.keys(client).filter(
      (key) => typeof client[key] === 'function' && key.endsWith('Async')
    )
    console.log('Available async methods:')
    asyncMethods.forEach((method) => {
      console.log(' -', method.replace('Async', ''))
    })

    const methodName = 'petrolDagiticiLisansSorgula'

    const args = {
      lisansDurumu: 'ONAYLANDI',
    }

    if (typeof client[methodName + 'Async'] === 'function') {
      const [result] = await client[methodName + 'Async'](args)
      console.log('SOAP call result:', JSON.stringify(result, null, 2))
    } else {
      console.error(`Method ${methodName}Async not found on client.`)
    }
  } catch (error) {
    console.error('SOAP call error:', error)
  }
}

testSoap()
