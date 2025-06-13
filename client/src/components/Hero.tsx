import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const tickerRef = useRef<HTMLDivElement>(null)

  // Sample data - replace with real API data if needed
  const tickerItems = [
    { name: 'Benzin', price: 32.76, change: 2.3, unit: '₺/L' },
    { name: 'LPG', price: 15.42, change: -0.8, unit: '₺/L' },
    { name: 'Dolar', price: 32.15, change: 1.2, unit: '₺' },
    { name: 'Euro', price: 34.89, change: -0.5, unit: '₺' },
    { name: 'Elektrik', price: 3.12, change: 0.3, unit: '₺/kWh' },
    { name: 'Doğal Gaz', price: 5.87, change: 1.2, unit: '₺/m³' },
  ]

  // Duplicate for smooth scrolling loop
  const duplicatedItems = [...tickerItems, ...tickerItems]

  useEffect(() => {
    const tickerElement = tickerRef.current
    if (!tickerElement) return

    let animationFrame: number
    let position = 0
    const speed = 1.2

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
  }, [])

  return (
    <section className='bg-gradient-to-br from-blue-700 to-blue-500 text-white relative pb-16'>
      {/* Hero Content */}
      <div className='container mx-auto px-4 py-12 text-center'>
        <h1 className='text-4xl font-bold'>
          Türkiye Petrol ve Enerji Haberleri
        </h1>
        <p className='mt-4 text-lg'>
          Son gelişmeler, fiyatlar ve sektör içgörüleri
        </p>
      </div>

      {/* Live Ticker */}
      <div className='absolute bottom-0 left-0 right-0 bg-blue-800/90 backdrop-blur-sm overflow-hidden border-t border-white/10'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center py-3'>
            <span className='font-bold mr-4 whitespace-nowrap text-yellow-300'>
              CANLI PİYASA:
            </span>

            <div className='relative flex-1 overflow-hidden'>
              <div
                ref={tickerRef}
                className='whitespace-nowrap inline-flex items-center'
              >
                {duplicatedItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className='inline-flex items-center mx-4'
                  >
                    <span className='font-medium'>{item.name}</span>
                    <span className='mx-2 text-white/80'>
                      {item.price.toFixed(2)}
                      {item.unit}
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
