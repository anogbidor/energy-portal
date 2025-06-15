import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  CurrencyPoundIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useRef, useState } from 'react'
import { useLiveData } from '../hooks/useLiveData'
import LoadingSpinner from './LoadingSpinner'

export default function Hero() {
  const tickerRef = useRef<HTMLDivElement>(null)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHoveringTicker, setIsHoveringTicker] = useState(false)

  const { data, loading, error } = useLiveData()

  useEffect(() => {
    const tickerElement = tickerRef.current
    if (!tickerElement) return

    let animationFrame: number
    let position = 0
    const speed = isHoveringTicker ? 0 : 1.2

    const animate = () => {
      position -= speed
      if (position <= -tickerElement.scrollWidth / 2) {
        position = 0
      }
      tickerElement.style.transform = `translateX(${position}px)`
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [isHoveringTicker])

  const filters = [
    'Brent',
    'LPG',
    'Doğal Gaz',
    'Elektrik',
    'Akaryakıt',
    'EPDK',
    'Döviz',
    'TÜPRAŞ',
  ]

  if (loading)
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-[#1fa637]'>
        <div className='animate-pulse text-white text-lg mb-2'>
          <LoadingSpinner />
        </div>
        <div className='text-white text-lg'>Veriler yükleniyor</div>
      </div>
    )

  if (error || !data)
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#1fa637]'>
        <div className='bg-red-100 border-l-4 border-red-500 p-4 max-w-md'>
          <div className='flex items-center'>
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
              <p className='text-sm text-red-700'>
                {error || 'Veri alınamadı'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )

  const tickerItems = [
    {
      name: 'Benzin',
      price: data.fuelPrices.istanbul.benzin,
      change: 2.3,
      unit: '₺/L',
      icon: '⛽',
    },
    {
      name: 'LPG',
      price: data.fuelPrices.istanbul.lpg,
      change: -0.8,
      unit: '₺/L',
      icon: '🔥',
    },
    {
      name: 'Dolar',
      price: data.usdTry,
      change: 1.2,
      unit: '₺',
      icon: '$',
    },
    {
      name: 'Euro',
      price: data.eurTry,
      change: -0.5,
      unit: '₺',
      icon: '€',
    },
    {
      name: 'Sterlin',
      price: data.gbpTry,
      change: 0.7,
      unit: '₺',
      icon: <CurrencyPoundIcon className='h-4 w-4 inline' />,
    },
    {
      name: 'Elektrik',
      price: 3.12,
      change: 0.3,
      unit: '₺/kWh',
      icon: '⚡',
    },
    {
      name: 'Doğal Gaz',
      price: 5.87,
      change: 1.2,
      unit: '₺/m³',
      icon: '⛽',
    },
  ]

  const duplicatedItems = [...tickerItems, ...tickerItems]

  return (
    <section className='bg-[#1fa637] text-white relative pb-28 overflow-hidden'>
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
        <div className='absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
        <div className='absolute bottom-0 left-1/2 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'></div>
      </div>

      <div className='container mx-auto px-4 py-16 text-center relative z-10'>
        <h1 className='text-5xl font-bold tracking-tight mb-4'>
          Enerji ve Döviz <span className='text-yellow-300'>Piyasaları</span>
        </h1>
        <p className='mt-4 text-xl text-blue-100 max-w-2xl mx-auto'>
          Türkiye'nin en güncel enerji ve döviz fiyatları
        </p>

        <div className='mt-8 flex justify-center relative max-w-2xl mx-auto'>
          <div className='relative w-full'>
            <MagnifyingGlassIcon className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Brent, Sterlin, Dolar, Elektrik fiyatları ara...'
              className='w-full pl-12 pr-6 py-3 rounded-full bg-white/80 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 shadow-lg transition-all duration-200 border border-white/20'
            />
            <button className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-900 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-800 transition-colors'>
              Ara
            </button>
          </div>
        </div>

        <div className='mt-8 flex flex-wrap justify-center gap-3'>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() =>
                setSelectedFilter((prev) => (prev === filter ? null : filter))
              }
              className={`py-2.5 px-5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedFilter === filter
                  ? 'bg-yellow-400 text-gray-900 shadow-md hover:bg-yellow-500'
                  : 'bg-white/10 hover:bg-white/10 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {selectedFilter && (
          <div className='mt-4 animate-fade-in'>
            <p className='inline-flex items-center text-sm text-yellow-200 bg-white/50 px-4 py-2 rounded-full'>
              <span>Seçilen filtre:</span>
              <strong className='ml-1 bg-yellow-400/20 px-2 py-0.5 rounded-full'>
                {selectedFilter}
              </strong>
              <button
                onClick={() => setSelectedFilter(null)}
                className='ml-2 text-white/70 hover:text-white'
              >
                ×
              </button>
            </p>
          </div>
        )}

        <div className='mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {tickerItems.map((item) => (
            <div
              key={item.name}
              className='bg-white/35 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/10 transition-all duration-200 cursor-pointer hover:shadow-lg group'
            >
              <div className='flex items-center justify-between'>
                <div className='text-sm text-white flex items-center'>
                  <span className='mr-2'>{item.icon}</span>
                  {item.name}
                </div>
                <div
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.change >= 0
                      ? 'bg-green-900/30 text-green-300'
                      : 'bg-red-900/30 text-red-300'
                  }`}
                >
                  {item.change >= 0 ? (
                    <ArrowUpIcon className='-ml-0.5 mr-0.5 h-3 w-3' />
                  ) : (
                    <ArrowDownIcon className='-ml-0.5 mr-0.5 h-3 w-3' />
                  )}
                  {Math.abs(item.change)}%
                </div>
              </div>
              <div className='mt-2 text-2xl font-bold tracking-tight'>
                {typeof item.price === 'number'
                  ? `${item.price.toFixed(2)}`
                  : '—'}
                <span className='ml-1 text-sm text-blue-200'>{item.unit}</span>
              </div>
              <div className='mt-1 text-xs text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity'>
                {new Date().toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className='absolute bottom-0 left-0 right-0 bg-[#1A202C] backdrop-blur-sm overflow-hidden border-t border-white/10'
        onMouseEnter={() => setIsHoveringTicker(true)}
        onMouseLeave={() => setIsHoveringTicker(false)}
      >
        <div className='container mx-auto px-4'>
          <div className='flex items-center py-3'>
            <div className='flex items-center font-bold mr-4 whitespace-nowrap'>
              <span className='text-yellow-300'>CANLI</span>
              <span className='ml-2 text-white'>PİYASA</span>
              <div className='ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
            </div>

            <div className='relative flex-1 overflow-hidden'>
              <div
                ref={tickerRef}
                className='whitespace-nowrap inline-flex items-center'
              >
                {duplicatedItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className='inline-flex items-center mx-6 py-1 transition-all hover:text-yellow-300 group'
                  >
                    <span className='font-medium flex items-center'>
                      <span className='mr-1.5 opacity-70 group-hover:opacity-100'>
                        {item.icon}
                      </span>
                      {item.name}
                    </span>
                    <span className='mx-2 text-white/90'>
                      {typeof item.price === 'number'
                        ? `${item.price.toFixed(2)}`
                        : '—'}
                      <span className='text-white/60 ml-0.5'>{item.unit}</span>
                    </span>
                    <span
                      className={`inline-flex items-center text-sm font-semibold ${
                        item.change >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}
                    >
                      {item.change >= 0 ? (
                        <ArrowUpIcon className='h-3.5 w-3.5 mr-0.5' />
                      ) : (
                        <ArrowDownIcon className='h-3.5 w-3.5 mr-0.5' />
                      )}
                      {Math.abs(item.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
