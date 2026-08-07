import { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useLiveData } from '../hooks/useLiveData'
import { useLicenseSummary } from '../hooks/useLicenseSummary'

type Stat = { name: string; value: number | null | undefined; unit: string }
type Slide = { heading: string; subheading: string; stats: Stat[] }

// Tailwind's build-time scanner needs literal class strings, not a
// template literal like `md:grid-cols-${n}` -- this covers the two
// column counts the slides below actually use.
const GRID_COLS: Record<number, string> = {
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
}

const SLIDE_INTERVAL_MS = 6000

export default function Hero() {
  const { data, loading: liveLoading, error } = useLiveData()
  // Same 14-day window LicenseSummaryTable requests further down this
  // same page -- matching it means this reuses that request's cache
  // instead of firing a second one.
  const { data: summary, loading: summaryLoading } = useLicenseSummary(14)

  const [currentSlide, setCurrentSlide] = useState(0)

  const benzin = data?.fuelPrices.find((item) => item.yakit.includes('Benzin'))
  const motorin = data?.fuelPrices.find((item) => item.yakit === 'Motorin')
  const otogaz = data?.lpgPrices.find((item) => item.yakit === 'Otogaz')
  const updatedOn = benzin?.tarih

  const todayStr = new Date().toISOString().slice(0, 10)
  const today = summary?.find((day) => day.date === todayStr)
  const MARKETS = ['petrol', 'lpg', 'dogalgaz', 'elektrik'] as const
  const sumField = (field: 'issued' | 'TRANSFER_EDILDI' | 'other') =>
    MARKETS.reduce((total, market) => {
      const activity = today?.counts[market]
      if (!activity) return total
      if (field === 'issued') return total + activity.issued
      if (field === 'TRANSFER_EDILDI') {
        return total + (activity.statuses['TRANSFER_EDILDI'] ?? 0)
      }
      const otherSum = Object.entries(activity.statuses)
        .filter(([key]) => key !== 'TRANSFER_EDILDI' && key !== 'UNVAN_DEGISIKLIGI')
        .reduce((sum, [, count]) => sum + count, 0)
      return total + otherSum
    }, 0)

  const slides: Slide[] = [
    {
      heading: 'Enerji ve Lisans Piyasaları',
      subheading:
        'EPDK lisans hareketleri, akaryakıt fiyatları ve döviz kurları — tek bir yerde.',
      stats: [
        { name: 'Benzin (95 Oktan)', value: benzin?.fiyat, unit: '₺/L' },
        { name: 'Motorin', value: motorin?.fiyat, unit: '₺/L' },
        { name: 'Otogaz (LPG)', value: otogaz?.fiyat, unit: '₺/L' },
        { name: 'USD/TRY', value: data?.usdTry, unit: '₺' },
      ],
    },
    {
      heading: 'Döviz ve Emtia Piyasaları',
      subheading: 'Güncel kurlar ve Brent petrol fiyatı.',
      stats: [
        { name: 'USD/TRY', value: data?.usdTry, unit: '₺' },
        { name: 'EUR/TRY', value: data?.eurTry, unit: '₺' },
        { name: 'GBP/TRY', value: data?.gbpTry, unit: '₺' },
        { name: 'Brent Petrol', value: data?.brent, unit: '$' },
      ],
    },
    {
      heading: 'Bugünkü Lisans Hareketleri',
      subheading: 'Petrol, LPG, doğalgaz ve elektrik piyasalarında bugün.',
      stats: [
        { name: 'Yeni Lisans', value: sumField('issued'), unit: '' },
        { name: 'Transfer Edildi', value: sumField('TRANSFER_EDILDI'), unit: '' },
        { name: 'Durum Değişikliği', value: sumField('other'), unit: '' },
      ],
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const loading = liveLoading || summaryLoading
  const active = slides[currentSlide]
  const cols = GRID_COLS[active.stats.length] ?? 'md:grid-cols-4'

  return (
    <section className='bg-brand-gold text-gray-900 relative'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center'>
        <div className='w-10 h-1 rounded-full bg-brand-purple mx-auto mb-5' />

        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight'>
          {active.heading}
        </h1>
        <p className='mt-4 text-base sm:text-lg text-gray-800 max-w-xl mx-auto'>
          {active.subheading}
        </p>

        <div
          className={`mt-10 grid grid-cols-2 ${cols} gap-3 max-w-3xl mx-auto`}
        >
          {loading ? (
            [...Array(active.stats.length)].map((_, i) => (
              <div
                key={i}
                className='animate-pulse bg-white/40 border border-black/10 rounded-xl p-4 h-[76px]'
              />
            ))
          ) : error ? (
            <div className='col-span-full text-sm text-red-800 font-medium'>{error}</div>
          ) : (
            active.stats.map((stat) => (
              <div
                key={stat.name}
                className='bg-white border border-black/5 rounded-xl p-4 text-left shadow-sm'
              >
                <p className='text-xs text-gray-500'>{stat.name}</p>
                <p className='mt-1 text-xl font-semibold text-gray-900'>
                  {stat.value !== undefined && stat.value !== null
                    ? stat.unit === '$' || stat.unit === '₺'
                      ? stat.value.toFixed(2)
                      : Math.round(stat.value)
                    : '—'}
                  {stat.unit && (
                    <span className='text-sm font-normal text-gray-400 ml-1'>
                      {stat.unit}
                    </span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>

        {currentSlide === 0 && updatedOn && (
          <p className='mt-4 text-xs text-gray-700'>
            EPDK bayi satış fiyatı bülteni · {updatedOn}
          </p>
        )}

        {/* Slide navigation */}
        <div className='flex items-center justify-center gap-2 mt-8'>
          {slides.map((slide, i) => (
            <button
              key={slide.heading}
              type='button'
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === i ? 'w-6 bg-brand-purple' : 'w-1.5 bg-black/20'
              }`}
              aria-label={`${i + 1}. slayta git`}
            />
          ))}
        </div>
      </div>

      <button
        type='button'
        onClick={prevSlide}
        className='hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors'
        aria-label='Önceki slayt'
      >
        <ChevronLeftIcon className='h-5 w-5 text-gray-700' />
      </button>
      <button
        type='button'
        onClick={nextSlide}
        className='hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors'
        aria-label='Sonraki slayt'
      >
        <ChevronRightIcon className='h-5 w-5 text-gray-700' />
      </button>
    </section>
  )
}
