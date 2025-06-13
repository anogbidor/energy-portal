// 🔹 src/pages/Home.tsx
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CurrencyDollarIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline'
import {
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  LightBulbIcon,
} from '@heroicons/react/24/solid'
import ExchangeRates from '../components/ExchangeRates'
import FuelPriceCard from '../components/FuelPriceCard'
import Hero from '../components/Hero'
import NewsCard from '../components/NewsCard'

export default function Home() {
  const fuelData = [
    {
      title: 'Benzin',
      price: 32.76,
      change: 2.3,
      icon: FireIcon,
      unit: 'TL/L',
    },
    {
      title: 'LPG',
      price: 15.42,
      change: -0.8,
      icon: BoltIcon,
      unit: 'TL/L',
    },
    {
      title: 'Elektrik',
      price: 3.12,
      icon: LightBulbIcon,
      unit: 'TL/kWh',
    },
    {
      title: 'Doğal Gaz',
      price: 5.87,
      change: 1.2,
      icon: FireIcon,
      unit: 'TL/m³',
    },
  ]

  const newsData = [
    {
      title: 'Yakıt Dağıtıcıları İçin Yeni Düzenlemeler',
      date: '27 Mayıs 2025',
      category: 'Regülasyon',
      excerpt: 'Enerji Piyasası Düzenleme Kurumu yeni düzenlemeleri duyurdu...',
    },
    {
      title: 'Petrol Fiyatlarında Küresel Dalgalanma',
      date: '26 Mayıs 2025',
      category: 'Piyasa',
      excerpt: 'Uluslararası piyasalarda ham petrol fiyatları %3 arttı...',
    },
    {
      title: 'Enerji Sektöründe Yeni Yatırımlar',
      date: '25 Mayıs 2025',
      category: 'Yatırım',
      excerpt:
        'Yerli ve yabancı yatırımcılar enerji sektörüne 2 milyar TL yatırım...',
    },
  ]

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Hero />

      <section className='py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
        {/* Fuel Prices Section */}
        <div className='mb-12'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 flex items-center'>
              <ChartBarIcon className='h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2' />
              Güncel Enerji Fiyatları
            </h2>
            <div className='flex items-center text-sm text-gray-500'>
              <ClockIcon className='h-4 w-4 mr-1' />
              Son Güncelleme: 28 Mayıs 2025, 09:45
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {fuelData.map((fuel) => (
              <FuelPriceCard
                key={`${fuel.title}-${fuel.price}`}
                title={fuel.title}
                price={fuel.price}
                change={fuel.change}
                icon={fuel.icon}
                unit={fuel.unit}
              />
            ))}
          </div>
        </div>

        {/* Exchange Rates Section */}
        <div className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center'>
            <CurrencyDollarIcon className='h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2' />
            Döviz Kurları
          </h2>
          <ExchangeRates />
        </div>

        {/* News Section */}
        <div className='mb-12'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 flex items-center'>
              <NewspaperIcon className='h-6 w-6 sm:h-8 sm:w-8 text-red-500 mr-2' />
              Enerji Haberleri
            </h2>
            <Link
              to='/news'
              className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center'
              aria-label='Tüm haberleri görüntüle'
            >
              Tüm Haberler <ArrowRightIcon className='h-4 w-4 ml-1' />
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {newsData.map((news) => (
              <NewsCard
                key={`${news.title}-${news.date}`}
                title={news.title}
                date={news.date}
                category={news.category}
                excerpt={news.excerpt}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white'>
          <div className='max-w-2xl mx-auto text-center'>
            <h3 className='text-2xl font-bold mb-4'>
              Enerji Analizlerine Erişin
            </h3>
            <p className='mb-6'>
              Premium üyelik ile detaylı raporlara, tarihsel verilere ve özel
              analizlere erişebilirsiniz.
            </p>
            <Link
              to='/premium'
              className='inline-block bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 px-6 rounded-lg transition duration-200'
              aria-label='Premium üyelik sayfasına git'
            >
              Premium Üye Ol
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
