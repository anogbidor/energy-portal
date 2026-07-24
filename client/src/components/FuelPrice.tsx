import { useLiveData } from '../hooks/useLiveData'
import FuelPriceCard from './FuelPriceCard'
import { ClockIcon } from '@heroicons/react/24/solid'

export default function FuelPrice() {
  const { data, loading, error } = useLiveData()

  if (loading) return <p>Yakıt fiyatları yükleniyor...</p>
  if (error) return <p>{error}</p>

  const items = [...(data?.fuelPrices ?? []), ...(data?.lpgPrices ?? [])]

  if (items.length === 0) return <p>Veri yok.</p>

  return (
    <section className='mb-12'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
        <div className='flex items-center text-sm text-gray-500'>
          <ClockIcon className='h-4 w-4 mr-1' />
          EPDK Bayi Satış Fiyatı Bülteni ({items[0].tarih})
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {items.map((item) => (
          <FuelPriceCard
            key={item.yakit}
            title={item.yakit}
            price={item.fiyat}
            unit={`/${item.olcuBirimi}`}
          />
        ))}
      </div>
    </section>
  )
}
