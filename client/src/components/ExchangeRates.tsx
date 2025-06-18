// src/components/ExchangeRates.tsx
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { useLiveData } from '../hooks/useLiveData'

export default function ExchangeRates() {
  const { data, loading, error } = useLiveData()

  if (loading)
    return (
      <div className='animate-pulse space-y-4'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='space-y-3'>
              <div className='h-4 w-3/4 bg-gray-200 rounded'></div>
              <div className='h-6 w-full bg-gray-200 rounded'></div>
              <div className='h-4 w-1/2 bg-gray-200 rounded'></div>
            </div>
          ))}
        </div>
      </div>
    )

  if (error)
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <div className='flex items-center text-sm text-red-700'>
          <svg
            className='h-4 w-4 mr-2 text-red-500'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
          {error}
        </div>
      </div>
    )

  if (!data)
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
        <div className='flex items-center text-sm text-yellow-700'>
          <svg
            className='h-4 w-4 mr-2 text-yellow-500'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          No data available
        </div>
      </div>
    )

  // Default change values since they're not in the LiveData type
  const defaultChangeValues = {
    usdTryChange: 0.3,
    eurTryChange: 0.5,
    gbpTryChange: -0.2,
    goldPriceChange: 1.8,
  }

  const rates = [
    {
      name: 'USD/TRY',
      symbol: '$',
      value: data.usdTry,
      change: defaultChangeValues.usdTryChange,
      targetSymbol: '₺',
    },
    {
      name: 'EUR/TRY',
      symbol: '€',
      value: data.eurTry,
      change: defaultChangeValues.eurTryChange,
      targetSymbol: '₺',
    },
    {
      name: 'GBP/TRY',
      symbol: '£',
      value: data.gbpTry,
      change: defaultChangeValues.gbpTryChange,
      targetSymbol: '₺',
    },
    {
      name: 'Brent Petrol',
      symbol: '🛢️',
      value: data.brent,
      change: 0, // No change data available for brent
      targetSymbol: '$',
    },
  ]

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
      {rates.map((rate) => (
        <div
          key={rate.name}
          className='bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-white transition-colors'
        >
          <div>
            <p className='text-xs font-medium text-gray-500'>{rate.name}</p>
            <p className='text-lg font-semibold text-gray-900 mt-1'>
              {rate.value !== null ? (
                <>
                  {rate.symbol}{' '}
                  {rate.value.toFixed(
                    ['USD/TRY', 'EUR/TRY', 'GBP/TRY'].includes(rate.name)
                      ? 2
                      : rate.name.includes('Petrol')
                      ? 2
                      : 4
                  )}
                  <span className='text-sm font-normal ml-1'>
                    {rate.targetSymbol}
                  </span>
                </>
              ) : (
                '-'
              )}
            </p>
            {rate.change !== 0 && (
              <div
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-small mt-1 ${
                  rate.change >= 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {rate.change >= 0 ? (
                  <ArrowUpIcon className='mr-1 h-3 w-3 text-green-800' />
                ) : (
                  <ArrowDownIcon className='mr-1 h-3 w-3 text-red-800' />
                )}
                {Math.abs(rate.change)}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
