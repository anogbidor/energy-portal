// src/components/ExchangeRates.tsx
import { useLiveData } from '../hooks/useLiveData'

export default function ExchangeRates() {
  const { data, loading, error } = useLiveData()

  if (loading)
    return (
      <div className='animate-pulse space-y-4'>
        <div className='grid grid-cols-3 gap-3'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='space-y-3'>
              <div className='h-4 w-3/4 bg-gray-200 rounded'></div>
              <div className='h-6 w-full bg-gray-200 rounded'></div>
            </div>
          ))}
        </div>
      </div>
    )

  if (error) return <p className='text-sm text-gray-500'>{error}</p>

  if (!data) return <p className='text-sm text-gray-500'>Veri yok.</p>

  const rates = [
    { name: 'USD/TRY', symbol: '$', value: data.usdTry },
    { name: 'EUR/TRY', symbol: '€', value: data.eurTry },
    { name: 'GBP/TRY', symbol: '£', value: data.gbpTry },
  ]

  return (
    <div className='grid grid-cols-3 gap-3'>
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
                  {rate.symbol} {rate.value.toFixed(2)}
                  <span className='text-sm font-normal ml-1'>₺</span>
                </>
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
