import { useLiveData } from '../hooks/useLiveData'
import FuelPriceCard from './FuelPriceCard'
import { ClockIcon } from '@heroicons/react/24/outline'

export default function FuelPrice() {
  const { data, loading, error } = useLiveData()

  if (loading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='animate-pulse h-[72px] rounded-xl bg-gray-100'
          />
        ))}
      </div>
    )
  }

  if (error) return <p className='text-sm text-gray-500'>{error}</p>

  const items = [...(data?.fuelPrices ?? []), ...(data?.lpgPrices ?? [])]

  if (items.length === 0) {
    return <p className='text-sm text-gray-500'>Veri yok.</p>
  }

  return (
    <div>
      <div className='flex items-center text-xs text-gray-500 mb-4'>
        <ClockIcon className='h-4 w-4 mr-1' />
        EPDK Bayi Satış Fiyatı Bülteni · {items[0].tarih}
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {items.map((item) => (
          <FuelPriceCard
            key={item.yakit}
            title={item.yakit}
            price={item.fiyat}
            unit={`/${item.olcuBirimi}`}
          />
        ))}
      </div>
    </div>
  )
}
