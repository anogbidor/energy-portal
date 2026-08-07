import { useSearchParams, Link } from 'react-router-dom'
import { useDistributorSummary } from '../hooks/useDistributorSummary'
import type { Market } from '../hooks/useLicenses'

const MARKETS: { market: Market; label: string }[] = [
  { market: 'petrol', label: 'Petrol' },
  { market: 'lpg', label: 'LPG' },
]

function isMarket(value: string | null): value is Market {
  return value === 'petrol' || value === 'lpg'
}

export default function DistributorSummary() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlMarket = searchParams.get('market')
  const market = isMarket(urlMarket) ? urlMarket : 'petrol'

  const { data, loading, error } = useDistributorSummary(market)

  const setMarket = (next: Market) => {
    setSearchParams({ market: next })
  }

  const marketLabel = MARKETS.find((m) => m.market === market)?.label ?? market

  return (
    <main className='bg-gray-50 min-h-screen'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-10'>
        <header className='mb-6 text-center'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            {marketLabel} Piyasası Dağıtım Şirketleri
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Her dağıtıcının bayi ağındaki aktif, iptal ve transfer hareketleri
          </p>
        </header>

        <nav className='mb-6'>
          <div className='flex justify-center gap-1 bg-white border border-gray-200 p-1 rounded-full max-w-xs mx-auto'>
            {MARKETS.map(({ market: m, label }) => (
              <button
                key={m}
                type='button'
                onClick={() => setMarket(m)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  market === m
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
          {loading ? (
            <div className='p-4 space-y-2'>
              {[...Array(10)].map((_, i) => (
                <div key={i} className='h-9 bg-gray-100 rounded animate-pulse' />
              ))}
            </div>
          ) : error ? (
            <p className='p-6 text-sm text-gray-500 text-center'>Veri yüklenemedi</p>
          ) : !data || data.length === 0 ? (
            <p className='p-6 text-sm text-gray-500 text-center'>Veri bulunamadı</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
                      Ünvan
                    </th>
                    <th className='px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
                      Aktif
                    </th>
                    <th className='px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
                      İptal
                    </th>
                    <th className='px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
                      Transfer
                    </th>
                    <th className='px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
                      Kaybedilen
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {data.map((row, i) => (
                    <tr
                      key={row.lisansNo}
                      className={`hover:bg-gray-50 transition-colors ${
                        i % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className='px-4 py-2.5 text-sm'>
                        <Link
                          to={`/license/detail?market=${market}&lisansNo=${encodeURIComponent(
                            row.lisansNo
                          )}`}
                          className='font-medium text-brand-purple hover:text-brand-purple-dark'
                        >
                          {row.lisansSahibiUnvani}
                        </Link>
                      </td>
                      <td className='px-3 py-2.5 text-sm text-right tabular-nums text-gray-900'>
                        {row.aktif.toLocaleString('tr-TR')}
                      </td>
                      <td className='px-3 py-2.5 text-sm text-right tabular-nums text-gray-500'>
                        {row.iptal.toLocaleString('tr-TR')}
                      </td>
                      <td className='px-3 py-2.5 text-sm text-right tabular-nums text-green-700'>
                        {row.transferIn.toLocaleString('tr-TR')}
                      </td>
                      <td className='px-3 py-2.5 text-sm text-right tabular-nums text-red-600'>
                        {row.transferOut.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className='mt-4 text-xs text-gray-400 text-center'>
          Transfer ve kaybedilen sayıları yakın zamanda takibe alınmıştır ve
          EPDK'nın tam geçmişini yansıtmaz — zaman içinde birikir. Aktif ve
          iptal sayıları güncel EPDK verisidir.
        </p>
      </div>
    </main>
  )
}
