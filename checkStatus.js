// // checkStatus.js
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// import soap from 'soap'

// const WSDL_URL =
//   'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint?wsdl'

// async function checkStatuses() {
//   const client = await soap.createClientAsync(WSDL_URL)
//   client.setEndpoint(
//     'https://lisansws.epdk.gov.tr/services/lisansPublicProxy.lisansPublicProxyHttpSoap11Endpoint'
//   )

//   const statuses = [
//     'ONAYLANDI',
//     'SONLANDIRILDI',
//     'IPTAL_EDILDI',
//     'SURESI_DOLDU',
//     'YURURLUKTEN_KALDIRILDI',
//     'FAALIYETI_GECICI_DURDURULDU',
//   ]

//   for (const status of statuses) {
//     try {
//       const result = await client.dogalgazDagitimLisansiSorgulaAsync({
//         lisansDurumu: status,
//       })
//       console.log(
//         `Status: ${status} => Items found: ${result[0]?.return?.length || 0}`
//       )
//     } catch (err) {
//       console.error(`Status: ${status} => Error: ${err.message || err}`)
//     }
//   }
// }

// checkStatuses()
