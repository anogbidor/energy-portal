// 🔹 src/components/ExchangeRates.tsx
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { useLiveData } from '../hooks/useLiveData'

export default function ExchangeRates() {
  const { data, loading, error } = useLiveData()

  if (loading)
    return (
      <div className='animate-pulse space-y-4'>
        <div className='h-6 w-1/3 bg-gray-200 rounded'></div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-16 bg-gray-100 rounded-lg'></div>
          ))}
        </div>
      </div>
    )

  if (error)
    return (
      <div className='bg-red-50 border-l-4 border-red-500 p-4'>
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
    )

  if (!data)
    return (
      <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-yellow-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <p className='text-sm text-yellow-700'>No data available</p>
          </div>
        </div>
      </div>
    )

  const rates = [
    {
      name: 'Brent (USD)',
      symbol: '',
      value: data.brent,
      change: 0.1,
      targetSymbol: '$',
    },
    {
      name: 'USD/TRY',
      symbol: '$',
      value: data.usdTry,
      change: 0.3,
      targetSymbol: '₺',
    },
    {
      name: 'EUR/TRY',
      symbol: '€',
      value: data.eurTry,
      change: 0.5,
      targetSymbol: '₺',
    },
    {
      name: 'GBP/TRY',
      symbol: '£',
      value: data.gbpTry,
      change: -0.2,
      targetSymbol: '₺',
    },
    {
      name: 'BTC/USD',
      symbol: '₿',
      value: 67245,
      change: 1.8,
      targetSymbol: '$',
    },
  ]

  return (
    <div className='space-y-4'>
      <h3 className='text-xl font-bold text-gray-800'>Döviz Kurları</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {rates.map((rate) => (
          <div
            key={rate.name}
            className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>{rate.name}</p>
                <div className='mt-1 flex items-baseline'>
                  <span className='text-2xl font-semibold text-gray-900'>
                    {rate.value !== null ? rate.value.toFixed(2) : '-'}
                  </span>
                </div>
              </div>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  rate.change >= 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {rate.change >= 0 ? (
                  <ArrowUpIcon className='-ml-0.5 mr-0.5 h-3 w-3 text-green-800' />
                ) : (
                  <ArrowDownIcon className='-ml-0.5 mr-0.5 h-3 w-3 text-red-800' />
                )}
                {rate.change >= 0 ? '+' : ''}
                {rate.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
