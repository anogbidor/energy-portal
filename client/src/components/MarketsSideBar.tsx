// src/components/MarketsSidebar.tsx
import { Link } from 'react-router-dom'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useLiveData } from '../hooks/useLiveData'

const CURRENCIES = [
  { key: 'usdTry', name: 'USD/TRY', symbol: '$' },
  { key: 'eurTry', name: 'EUR/TRY', symbol: '€' },
  { key: 'gbpTry', name: 'GBP/TRY', symbol: '£' },
] as const

export default function MarketsSideBar() {
  const { data, loading, error } = useLiveData()

  return (
    <aside className='w-72 bg-white p-5 rounded-xl border border-gray-200 sticky top-20 h-fit'>
      <div className='flex items-center gap-2 mb-4'>
        <CurrencyDollarIcon className='h-5 w-5 text-gray-400' />
        <h3 className='text-sm font-semibold text-gray-900'>Döviz Kurları</h3>
      </div>

      {loading ? (
        <div className='animate-pulse space-y-2'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-11 bg-gray-100 rounded-lg' />
          ))}
        </div>
      ) : error ? (
        <p className='text-sm text-gray-500'>Veri yüklenemedi</p>
      ) : (
        <ul className='space-y-1'>
          {CURRENCIES.map((c) => {
            const value = data?.[c.key]
            return (
              <li
                key={c.key}
                className='flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-gray-50'
              >
                <span className='text-sm text-gray-600'>{c.name}</span>
                <span className='text-sm font-medium text-gray-900'>
                  {value != null ? `${c.symbol}${value.toFixed(2)}` : '—'}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <Link
        to='/prices'
        className='mt-3 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors'
      >
        Tüm Fiyatlar
      </Link>
    </aside>
  )
}
