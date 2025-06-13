// 🔹 components/FuelPrice.tsx
import FuelPriceCard from './FuelPriceCard'

export default function FuelPrice() {
  return (
    <section className='my-6'>
      <h2 className='text-2xl font-semibold mb-4'>Güncel Yakıt Fiyatları</h2>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <FuelPriceCard title='Benzin' price={32.76} change={2.3} />
        <FuelPriceCard title='LPG' price={15.42} change={-0.8} />
        <FuelPriceCard title='Elektrik' price={3.12} />
        <FuelPriceCard title='Doğal Gaz' price={5.87} change={1.2} />
      </div>
    </section>
  )
}
