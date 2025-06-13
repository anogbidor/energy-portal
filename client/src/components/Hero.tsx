import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  const tickerRef = useRef<HTMLDivElement>(null)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHoveringTicker, setIsHoveringTicker] = useState(false)

  const tickerItems = [
    { name: 'Benzin', price: 32.76, change: 2.3, unit: '₺/L' },
    { name: 'LPG', price: 15.42, change: -0.8, unit: '₺/L' },
    { name: 'Dolar', price: 32.15, change: 1.2, unit: '₺' },
    { name: 'Euro', price: 34.89, change: -0.5, unit: '₺' },
    { name: 'Elektrik', price: 3.12, change: 0.3, unit: '₺/kWh' },
    { name: 'Doğal Gaz', price: 5.87, change: 1.2, unit: '₺/m³' },
  ]

  const duplicatedItems = [...tickerItems, ...tickerItems]

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

  return (
    <section className='bg-gradient-to-br from-blue-800 to-blue-600 text-white relative pb-28 overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
        <div className='absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
        <div className='absolute bottom-0 left-1/2 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'></div>
      </div>

      <div className='container mx-auto px-4 py-16 text-center relative z-10'>
        <h1 className='text-5xl font-bold tracking-tight mb-4'>
          Enerji Piyasalarında <span className='text-yellow-300'>Anlık</span>{' '}
          Veriler
        </h1>
        <p className='mt-4 text-xl text-blue-100 max-w-2xl mx-auto'>
          Türkiye'nin en güncel enerji fiyatları, haberleri ve analizleri
        </p>

        {/* Search Bar */}
        <div className='mt-8 flex justify-center relative max-w-2xl mx-auto'>
          <div className='relative w-full'>
            <MagnifyingGlassIcon className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Brent, Tüpraş, Pompa fiyatları ara...'
              className='w-full pl-12 pr-6 py-3 rounded-full text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 shadow-lg transition-all duration-200'
            />
            <button className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors'>
              Ara
            </button>
          </div>
        </div>

        {/* Filter Chips */}
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
                  : 'bg-white/10 hover:bg-white/20 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Selected filter indicator */}
        {selectedFilter && (
          <div className='mt-4 animate-fade-in'>
            <p className='inline-flex items-center text-sm text-yellow-200 bg-white/10 px-4 py-2 rounded-full'>
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

        {/* Stats Cards */}
        <div className='mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {tickerItems.slice(0, 6).map((item) => (
            <div
              key={item.name}
              className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200 cursor-pointer hover:shadow-lg'
            >
              <div className='text-sm text-blue-100'>{item.name}</div>
              <div className='mt-1 text-xl font-bold'>
                {item.price.toFixed(2)}
                {item.unit}
              </div>
              <div
                className={`mt-1 text-xs font-medium inline-flex items-center ${
                  item.change >= 0 ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {item.change >= 0 ? (
                  <ArrowUpIcon className='h-3 w-3 mr-1' />
                ) : (
                  <ArrowDownIcon className='h-3 w-3 mr-1' />
                )}
                {Math.abs(item.change)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Ticker */}
      <div
        className='absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900/90 to-blue-800/90 backdrop-blur-sm overflow-hidden border-t border-white/10'
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
                    className='inline-flex items-center mx-6 py-1 transition-all hover:text-yellow-300'
                  >
                    <span className='font-medium'>{item.name}</span>
                    <span className='mx-2 text-white/90'>
                      {item.price.toFixed(2)}
                      <span className='text-white/60'>{item.unit}</span>
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
