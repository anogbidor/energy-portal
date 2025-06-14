import { useLiveData } from '../hooks/useLiveData'
import FuelPriceCard from './FuelPriceCard'
import {  ClockIcon } from '@heroicons/react/24/solid'

export default function FuelPrice() {
  const { data, loading, error } = useLiveData()

  if (loading) return <p>Yakıt fiyatları yükleniyor...</p>
  if (error) return <p>{error}</p>
  if (!data || !data.fuelPrices?.istanbul) return <p>Veri yok.</p>

  const istanbulPrices = data.fuelPrices.istanbul

  return (
    <section className='mb-12'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
        
        <div className='flex items-center text-sm text-gray-500'>
          <ClockIcon className='h-4 w-4 mr-1' />
          Son Güncelleme: Anlık Veri
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {istanbulPrices.benzin !== undefined && (
          <FuelPriceCard
            title='Benzin'
            price={istanbulPrices.benzin}
            change={2.3}
            unit='₺/L'
          />
        )}
        {istanbulPrices.motorin !== undefined && (
          <FuelPriceCard
            title='Motorin'
            price={istanbulPrices.motorin}
            change={1.1}
            unit='₺/L'
          />
        )}
        {istanbulPrices.lpg !== undefined && (
          <FuelPriceCard
            title='LPG'
            price={istanbulPrices.lpg}
            change={-0.8}
            unit='₺/L'
          />
        )}
        <FuelPriceCard title='Elektrik' price={3.12} unit='₺/kWh' />
        <FuelPriceCard
          title='Doğal Gaz'
          price={5.87}
          change={1.2}
          unit='₺/m³'
        />
      </div>
    </section>
  )
}
