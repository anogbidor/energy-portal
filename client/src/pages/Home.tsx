import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CurrencyDollarIcon,
  NewspaperIcon,
  BoltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import ExchangeRates from '../components/ExchangeRates'
import FuelPrice from '../components/FuelPrice'
import Hero from '../components/Hero'
import NewsCard from '../components/NewsCard'
import { useNewsFeed } from '../hooks/useNewsFeed'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function Home() {
  const { news, loading, error } = useNewsFeed()
  const featuredNews = news?.slice(0, 3) // Show only 3 featured news items

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Hero />

      <section className='py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
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
            <p className='text-sm text-green-600 mt-1'>↑ Dünden 2.4% artış</p>
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
            <p className='text-sm text-red-600 mt-1'>↓ Dünden %0,8 azalış</p>
          </div>
        </div>

        {/* Fuel Prices Section */}
        <div className='mb-12 bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-800 flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 text-red-500 mr-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
              Anlık Akaryakıt Fiyatları
            </h2>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
              CANLI
            </span>
          </div>
          <FuelPrice />
        </div>

        {/* Exchange Rates Section */}
        <div className='mb-12 bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
            <CurrencyDollarIcon className='h-6 w-6 text-green-600 mr-2' />
            Döviz Kurları
          </h2>
          <ExchangeRates />
        </div>

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
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {featuredNews?.map((item) => (
                <NewsCard
                  key={`${item.title}-${item.date}`}
                  title={item.title}
                  date={item.date}
                  category={item.category}
                  excerpt={item.excerpt}
                  imageUrl={item.imageUrl}
                  link={item.link}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className='bg-[#1fa637] rounded-xl p-8 text-white shadow-lg'>
          <div className='max-w-2xl mx-auto text-center'>
            <h3 className='text-2xl font-bold mb-4'>
              Enerji Analizlerine Erişin
            </h3>
            <p className='mb-6 text-blue-100'>
              Premium üyelik ile detaylı raporlara, tarihsel verilere ve özel
              analizlere erişebilirsiniz.
            </p>
            <Link
              to='/premium'
              className='inline-flex items-center justify-center bg-white hover:bg-white/70 text-blue-900 font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg'
              aria-label='Premium üyelik sayfasına git'
            >
              Premium Üye Ol
              <ArrowRightIcon className='h-5 w-5 ml-2' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
