// src/components/ExchangeRates.tsx
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid'
import { useLiveData, type Trend } from '../hooks/useLiveData'

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === 'up') return <ArrowTrendingUpIcon className='h-4 w-4 text-green-600' />
  if (trend === 'down') return <ArrowTrendingDownIcon className='h-4 w-4 text-red-600' />
  return null
}

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
    { name: 'USD/TRY', symbol: '$', value: data.usdTry, trend: data.trends.usdTry },
    { name: 'EUR/TRY', symbol: '€', value: data.eurTry, trend: data.trends.eurTry },
    { name: 'GBP/TRY', symbol: '£', value: data.gbpTry, trend: data.trends.gbpTry },
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
            <p className='text-lg font-semibold text-gray-900 mt-1 flex items-center gap-1'>
              {rate.value !== null ? (
                <>
                  {rate.symbol} {rate.value.toFixed(2)}
                  <span className='text-sm font-normal ml-0.5'>₺</span>
                  <TrendArrow trend={rate.trend} />
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
