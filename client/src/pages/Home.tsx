import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import {
  ArrowRightIcon,
  CurrencyDollarIcon,
  NewspaperIcon,
  BoltIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import Hero from '../components/Hero'
import { useNewsFeed } from '../hooks/useNewsFeed'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Sidebar from '../components/SideBar'
import MarketsSidebar from '../components/MarketsSideBar'
import { useState, useEffect } from 'react'

export default function Home() {
  const { news, loading, error } = useNewsFeed()
  const featuredNews = useMemo(() => news?.slice(0, 3) || [], [news])
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

      <section className='py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Sidebar - Piyasalar */}
          <div className='lg:w-72 flex-shrink-0 order-first'>
            <MarketsSidebar />
          </div>

          {/* Main content area */}
          <div className='flex-1'>
            {/* News Section */}
            <div className='mb-12 bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
                <h2 className='text-2xl font-bold text-gray-800 flex items-center'>
                  <NewspaperIcon className='h-6 w-6 text-red-500 mr-2' />
                  Son Enerji Haberleri
                </h2>
                <Link
                  to='/news'
                  className='text-green-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors'
                  aria-label='Tüm haberleri görüntüle'
                >
                  Tüm Haberler <ArrowRightIcon className='h-4 w-4 ml-1' />
                </Link>
              </div>

              {loading ? (
                <div className='flex justify-center py-12'>
                  <LoadingSpinner />
                  <div className='text-black text-lg'>Veriler yükleniyor</div>
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
                      className='flex transition-[transform] duration-300 ease-in-out'
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {featuredNews.map((item) => (
                        <div
                          key={`${item.title}-${item.date}`}
                          className='w-full flex-shrink-0'
                        >
                          <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
                            <div className='flex items-center justify-between mb-3'>
                              <span className='text-xs font-semibold text-gray-500'>
                                {item.category || 'GENEL'} - ÖNE ÇIKAN
                              </span>
                              <span className='text-xs text-gray-500'>
                                {item.date}
                              </span>
                            </div>
                            <h3 className='text-xl font-bold text-gray-800 mb-3'>
                              {item.title}
                            </h3>
                            <p className='text-gray-600 mb-4 line-clamp-2'>
                              {item.excerpt}
                            </p>
                            <Link
                              to={item.link}
                              className='text-green-600 hover:text-green-700 text-sm font-medium flex items-center'
                            >
                              Haberin Devamı
                              <ArrowRightIcon className='h-4 w-4 ml-1' />
                            </Link>
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
                    <div className='flex justify-center mt-6 space-x-2'>
                      {featuredNews.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-2 w-8 rounded-full transition-all ${
                            currentSlide === index
                              ? 'bg-green-600'
                              : 'bg-gray-300'
                          }`}
                          aria-label={`${index + 1}. habere git`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats Section */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                <div className='flex items-center mb-4'>
                  <BoltIcon className='h-6 w-6 text-blue-600 mr-2' />
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Elektrik Tüketimi
                  </h3>
                </div>
                <p className='text-2xl font-bold text-gray-900'>48,542 MWh</p>
                <p className='text-sm text-green-600 mt-1'>
                  ↑ Dünden 2.4% artış
                </p>
              </div>

              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                <div className='flex items-center mb-4'>
                  <ChartBarIcon className='h-6 w-6 text-green-600 mr-2' />
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Yenilenebilir Enerji
                  </h3>
                </div>
                <p className='text-2xl font-bold text-gray-900'>34.2%</p>
                <p className='text-sm text-green-600 mt-1'>
                  ↑ Geçen aydan %1,8 artış
                </p>
              </div>

              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                <div className='flex items-center mb-4'>
                  <CurrencyDollarIcon className='h-6 w-6 text-yellow-500 mr-2' />
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Petrol Fiyatı
                  </h3>
                </div>
                <p className='text-2xl font-bold text-gray-900'>₺28.45</p>
                <p className='text-sm text-red-600 mt-1'>
                  ↓ Dünden %0,8 azalış
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className='bg-[#1fa637] rounded-xl p-8 text-white shadow-lg'>
              <div className='max-w-2xl mx-auto text-center'>
                <h3 className='text-2xl font-bold mb-4'>
                  Enerji Analizlerine Erişin
                </h3>
                <p className='mb-6 text-blue-100'>
                  Premium üyelik ile detaylı raporlara, tarihsel verilere ve
                  özel analizlere erişebilirsiniz.
                </p>
                <Link
                  to='/premium'
                  className='inline-flex items-center justify-center bg-white hover:bg-gray-100 text-blue-900 font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg'
                  aria-label='Premium üyelik sayfasına git'
                >
                  Premium Üye Ol
                  <ArrowRightIcon className='h-5 w-5 ml-2' />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Lisans Hareketler */}
          <div className='lg:w-72 flex-shrink-0'>
            <Sidebar />
          </div>
        </div>
      </section>
    </div>
  )
}
