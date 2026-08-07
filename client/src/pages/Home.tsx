import { Link } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import {
  ArrowRightIcon,
  NewspaperIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import Hero from '../components/Hero'
import { useNewsFeed } from '../hooks/useNewsFeed'
import ErrorMessage from '../components/ErrorMessage'
import MarketsSideBar from '../components/MarketsSideBar'
import LicenseSummaryTable from '../components/LicenseSummaryTable'
import PriceTicker from '../components/PriceTicker'

export default function Home() {
  const { news, loading, error } = useNewsFeed()
  const featuredNews = useMemo(() => news?.slice(0, 3) || [], [news])
  const moreNews = useMemo(() => news?.slice(3, 9) || [], [news])
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-rotate slides
  useEffect(() => {
    if (featuredNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredNews.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [featuredNews])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredNews.length)
  }

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredNews.length) % featuredNews.length
    )
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Hero />
      <PriceTicker />

      <section className='py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
        {/* License Summary Table */}
        <LicenseSummaryTable />

        <div className='flex flex-col lg:flex-row gap-6 mt-6'>
          {/* Left Sidebar - Piyasalar - Hidden on mobile */}
          <div className='hidden lg:block lg:w-72 flex-shrink-0 order-first'>
            <MarketsSideBar />
          </div>

          {/* Main content area */}
          <div className='flex-1 w-full'>
            {/* News Section */}
            <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-200'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
                <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <NewspaperIcon className='h-5 w-5 text-gray-400 mr-2' />
                  Son Enerji Haberleri
                </h2>
                <Link
                  to='/news'
                  className='text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center transition-colors'
                  aria-label='Tüm haberleri görüntüle'
                >
                  Tüm Haberler <ArrowRightIcon className='h-4 w-4 ml-1' />
                </Link>
              </div>

              {loading ? (
                <div className='bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 animate-pulse'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='h-3 w-20 bg-gray-200 rounded' />
                    <div className='h-3 w-16 bg-gray-200 rounded' />
                  </div>
                  <div className='h-6 w-3/4 bg-gray-200 rounded mb-3' />
                  <div className='h-3.5 w-full bg-gray-200 rounded mb-2' />
                  <div className='h-3.5 w-2/3 bg-gray-200 rounded mb-4' />
                  <div className='h-3.5 w-24 bg-gray-200 rounded' />
                </div>
              ) : error ? (
                <ErrorMessage message={error} />
              ) : featuredNews.length === 0 ? (
                <div className='text-center py-12 text-gray-500'>
                  Henüz haber bulunmamaktadır
                </div>
              ) : (
                <div className='relative'>
                  {/* Carousel Container */}
                  <div className='relative overflow-hidden rounded-lg'>
                    <div
                      className='flex transition-transform duration-300 ease-in-out'
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {featuredNews.map((item) => (
                        <div
                          key={`${item.title}-${item.date}`}
                          className='w-full flex-shrink-0'
                        >
                          <div className='bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2'>
                              <span className='text-xs font-semibold text-gray-500'>
                                {item.source} · {item.category || 'GENEL'}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {item.date}
                              </span>
                            </div>
                            <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-3'>
                              {item.title}
                            </h3>
                            <p className='text-gray-600 mb-4 line-clamp-2'>
                              {item.excerpt}
                            </p>
                            <a
                              href={item.link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-gray-900 hover:text-gray-600 text-sm font-medium flex items-center'
                            >
                              Haberin Devamı
                              <ArrowRightIcon className='h-4 w-4 ml-1' />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {featuredNews.length > 1 && (
                    <>
                      <button
                        title='Onceki Haber'
                        type='button'
                        onClick={prevSlide}
                        className='absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10'
                        aria-label='Önceki haber'
                      >
                        <ChevronLeftIcon className='h-5 w-5 text-gray-600' />
                      </button>
                      <button
                        title='Sonraki Haber'
                        type='button'
                        onClick={nextSlide}
                        className='absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10'
                        aria-label='Sonraki haber'
                      >
                        <ChevronRightIcon className='h-5 w-5 text-gray-600' />
                      </button>
                    </>
                  )}

                  {/* Navigation Dots */}
                  {featuredNews.length > 1 && (
                    <div className='flex justify-center mt-4 sm:mt-6 space-x-2'>
                      {featuredNews.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-1.5 rounded-full transition-all ${
                            currentSlide === index
                              ? 'w-6 bg-brand-purple'
                              : 'w-1.5 bg-gray-300'
                          }`}
                          aria-label={`${index + 1}. habere git`}
                        />
                      ))}
                    </div>
                  )}

                  {/* More headlines below the carousel */}
                  {moreNews.length > 0 && (
                    <ul className='mt-6 pt-6 border-t border-gray-100 divide-y divide-gray-100'>
                      {moreNews.map((item) => (
                        <li key={`${item.title}-${item.date}`} className='py-3'>
                          <a
                            href={item.link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-start justify-between gap-4 group'
                          >
                            <div className='min-w-0'>
                              <p className='text-sm font-medium text-gray-900 group-hover:text-brand-purple transition-colors truncate'>
                                {item.title}
                              </p>
                              <p className='text-xs text-gray-500 mt-0.5'>
                                {item.source} · {item.date}
                              </p>
                            </div>
                            <ArrowRightIcon className='h-4 w-4 text-gray-300 group-hover:text-brand-purple transition-colors flex-shrink-0 mt-0.5' />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
