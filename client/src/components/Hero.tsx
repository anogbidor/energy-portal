import { useLiveData } from '../hooks/useLiveData'

export default function Hero() {
  const { data, loading, error } = useLiveData()

  const benzin = data?.fuelPrices.find((item) => item.yakit.includes('Benzin'))
  const motorin = data?.fuelPrices.find((item) => item.yakit === 'Motorin')
  const otogaz = data?.lpgPrices.find((item) => item.yakit === 'Otogaz')

  const stats = [
    { name: 'Benzin (95 Oktan)', value: benzin?.fiyat, unit: '₺/L' },
    { name: 'Motorin', value: motorin?.fiyat, unit: '₺/L' },
    { name: 'Otogaz (LPG)', value: otogaz?.fiyat, unit: '₺/L' },
    { name: 'USD/TRY', value: data?.usdTry, unit: '₺' },
  ]

  const updatedOn = benzin?.tarih

  return (
    <section className='bg-gray-950 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center'>
        <div className='w-10 h-1 rounded-full bg-brand-gold mx-auto mb-5' />
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight'>
          Enerji ve Lisans Piyasaları
        </h1>
        <p className='mt-4 text-base sm:text-lg text-gray-400 max-w-xl mx-auto'>
          EPDK lisans hareketleri, akaryakıt fiyatları ve döviz kurları — tek
          bir yerde.
        </p>

        <div className='mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto'>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className='animate-pulse bg-white/5 border border-white/10 rounded-xl p-4 h-[76px]'
              />
            ))
          ) : error ? (
            <div className='col-span-full text-sm text-red-300'>{error}</div>
          ) : (
            stats.map((stat) => (
              <div
                key={stat.name}
                className='bg-white/5 border border-white/10 rounded-xl p-4 text-left'
              >
                <p className='text-xs text-gray-400'>{stat.name}</p>
                <p className='mt-1 text-xl font-semibold'>
                  {stat.value !== undefined && stat.value !== null
                    ? stat.value.toFixed(2)
                    : '—'}
                  <span className='text-sm font-normal text-gray-500 ml-1'>
                    {stat.unit}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>

        {updatedOn && (
          <p className='mt-4 text-xs text-gray-500'>
            EPDK bayi satış fiyatı bülteni · {updatedOn}
          </p>
        )}
      </div>
    </section>
  )
}
