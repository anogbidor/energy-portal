import { useSearchParams, Link } from 'react-router-dom'
import { useDistributorSummary } from '../hooks/useDistributorSummary'
import type { Market } from '../hooks/useLicenses'
import SegmentedTabs from '../components/ui/SegmentedTabs'

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

        <nav className='mb-6 flex justify-center'>
          <SegmentedTabs
            options={MARKETS.map(({ market: value, label }) => ({ value, label }))}
            value={market}
            onChange={setMarket}
          />
        </nav>

        <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
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
                <thead>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500'>
                      Ünvan
                    </th>
                    <th className='px-3 py-3 text-right text-xs font-medium text-gray-500'>
                      Aktif
                    </th>
                    <th className='px-3 py-3 text-right text-xs font-medium text-gray-500'>
                      İptal
                    </th>
                    <th className='px-3 py-3 text-right text-xs font-medium text-gray-500'>
                      Transfer
                    </th>
                    <th className='px-3 py-3 text-right text-xs font-medium text-gray-500'>
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
                      <td className='px-4 py-3 text-sm'>
                        <Link
                          to={`/license/detail?market=${market}&lisansNo=${encodeURIComponent(
                            row.lisansNo
                          )}`}
                          className='font-medium text-brand-purple hover:text-brand-purple-dark'
                        >
                          {row.lisansSahibiUnvani}
                        </Link>
                      </td>
                      <td className='px-3 py-3 text-sm text-right tabular-nums text-gray-900'>
                        {row.aktif.toLocaleString('tr-TR')}
                      </td>
                      <td className='px-3 py-3 text-sm text-right tabular-nums text-gray-500'>
                        {row.iptal.toLocaleString('tr-TR')}
                      </td>
                      <td className='px-3 py-3 text-sm text-right tabular-nums text-green-700'>
                        {row.transferIn.toLocaleString('tr-TR')}
                      </td>
                      <td className='px-3 py-3 text-sm text-right tabular-nums text-red-600'>
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
