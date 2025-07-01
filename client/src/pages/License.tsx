import React from 'react'
import { useLicenses } from '../hooks/useLicenses'

type MarketType = 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'

const MARKET_TYPES: MarketType[] = ['petrol', 'lpg', 'dogalgaz', 'elektrik']
const TABLE_HEADERS = [
  'Lisans No',
  'Unvan',
  'Durum',
  'Başlangıç',
  'Bitiş',
  'İl / İlçe',
  'Vergi No',
]

export default function LicensesPage() {
  const { data, error, loading, setMarket } = useLicenses('lpg')
  const [activeMarket, setActiveMarket] = React.useState<MarketType>('lpg')

  const handleMarketChange = (market: MarketType) => {
    setMarket(market)
    setActiveMarket(market)
  }

  return (
    <main className='p-5 font-sans max-w-7xl mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Lisans Sorgulama</h1>
        <p className='text-gray-600 mt-1'>
          Enerji Piyasası Düzenleme Kurumu lisans bilgileri
        </p>
      </header>

      <nav
        className='flex gap-2 mb-6 flex-wrap'
        role='tablist'
        aria-label='Enerji piyasası seçimi'
      >
        {MARKET_TYPES.map((market) => {
          const isSelected = activeMarket === market
          return (
            <button
              type='button'
              key={market}
              onClick={() => handleMarketChange(market)}
              className={`px-4 py-2 rounded-md border font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-inner'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              role='tab'
              // aria-selected={`${isSelected}`}
              aria-controls={`${market}-tabpanel`}
              id={`${market}-tab`}
              tabIndex={isSelected ? 0 : -1}
            >
              {market.toUpperCase()}
            </button>
          )
        })}
      </nav>

      <section
        id={`${activeMarket}-tabpanel`}
        role='tabpanel'
        aria-labelledby={`${activeMarket}-tab`}
        tabIndex={0}
      >
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500'></div>
            <span className='sr-only'>Loading...</span>
          </div>
        ) : error ? (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-500'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        ) : data && data.return.length > 0 ? (
          <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-300'>
                <thead className='bg-gray-50'>
                  <tr>
                    {TABLE_HEADERS.map((header) => (
                      <th
                        key={header}
                        scope='col'
                        className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {data.return.map((item, i) => {
                    const info = item.lisansGenelBilgi
                    return (
                      <tr
                        key={`${info.lisansNo}-${i}`}
                        className='hover:bg-gray-50'
                      >
                        <td className='whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900'>
                          {info.lisansNo}
                        </td>
                        <td className='px-4 py-4 text-sm text-gray-500'>
                          {info.lisansSahibiUnvani}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              info.lisansDurumu === 'Aktif'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {info.lisansDurumu}
                          </span>
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                          {new Date(info.baslangicTarihi).toLocaleDateString(
                            'tr-TR'
                          )}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                          {new Date(info.bitisTarihi).toLocaleDateString(
                            'tr-TR'
                          )}
                        </td>
                        <td className='px-4 py-4 text-sm text-gray-500'>
                          {info.adres.il} / {info.adres.ilce || '-'}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                          {info.vergiNo}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className='text-center py-12 bg-gray-50 rounded-lg'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              Veri bulunamadı
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Seçtiğiniz piyasaya ait lisans bilgisi bulunmamaktadır.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
