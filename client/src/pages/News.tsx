import { useNewsFeed } from '../hooks/useNewsFeed'
import { useState } from 'react'
import {
  NewspaperIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  SunIcon,
} from '@heroicons/react/24/outline'

export default function NewsPage() {
  const { news, loading, error } = useNewsFeed()
  const [activeCategory, setActiveCategory] = useState<string>('Tümü')
  const [visibleNewsCount, setVisibleNewsCount] = useState(10)

  const filteredNews = news?.filter(
    (item) => activeCategory === 'Tümü' || item.category === activeCategory
  )

  const featuredNews = filteredNews?.[0]
  const remainingNews = filteredNews?.slice(1, visibleNewsCount)

  const categories = [
    { name: 'Tümü', icon: <NewspaperIcon className='h-4 w-4' /> },
    { name: 'Güncel', icon: <ClockIcon className='h-4 w-4' /> },
    { name: 'Petrol', icon: <FireIcon className='h-4 w-4' /> },
    { name: 'Elektrik', icon: <BoltIcon className='h-4 w-4' /> },
    { name: 'Yenilenebilir', icon: <SunIcon className='h-4 w-4' /> },
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Enerji Haberleri
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Türkiye ve dünyadan enerji sektöründeki son gelişmeler
          </p>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400'></div>
          </div>
        )}

        {error && <p className='text-sm text-gray-500 mb-6'>{error}</p>}

        {/* Category Filters */}
        <div className='mb-8 overflow-x-auto'>
          <div className='flex gap-2 pb-2'>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name)
                  setVisibleNewsCount(9)
                }}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                  activeCategory === category.name
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && filteredNews && (
          <div className='space-y-8'>
            {/* Featured News (First Article) */}
            {featuredNews && (
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <div className='md:flex'>
                  <div className='md:flex-shrink-0 md:w-1/2 bg-gray-100 flex items-center justify-center'>
                    {featuredNews.imageUrl ? (
                      <img
                        className='h-64 w-full object-cover md:h-full'
                        src={featuredNews.imageUrl}
                        alt={featuredNews.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className='text-gray-400 p-8 text-center'>
                        <NewspaperIcon className='h-12 w-12 mx-auto' />
                        <p className='text-sm mt-2'>Resim Yok</p>
                      </div>
                    )}
                  </div>
                  <div className='p-6 md:p-8'>
                    <div className='text-xs font-medium text-gray-500'>
                      {featuredNews.category} · Öne Çıkan
                    </div>
                    <a
                      href={featuredNews.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block mt-2 text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors'
                    >
                      {featuredNews.title}
                    </a>
                    <p className='mt-2 text-sm text-gray-500'>
                      {featuredNews.date}
                    </p>
                    <div
                      className='mt-4 text-gray-600 text-sm prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{ __html: featuredNews.excerpt }}
                    />
                    <a
                      href={featuredNews.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center mt-5 px-4 py-2 text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors'
                    >
                      Haberin Devamı
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* News Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
              {remainingNews?.map((item, index) => (
                <div
                  key={index}
                  className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors'
                >
                  <div className='h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden'>
                    {item.imageUrl ? (
                      <img
                        className='h-full w-full object-cover'
                        src={item.imageUrl}
                        alt={item.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className='text-gray-400 p-4 text-center'>
                        <NewspaperIcon className='h-10 w-10 mx-auto' />
                      </div>
                    )}
                  </div>
                  <div className='p-5'>
                    <div className='flex items-center text-xs text-gray-500 mb-2'>
                      <span className='font-medium'>{item.category}</span>
                      <span className='mx-1.5'>·</span>
                      <span>{item.date}</span>
                    </div>
                    <a
                      href={item.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors mb-2'
                    >
                      {item.title}
                    </a>
                    <div
                      className='text-gray-600 text-sm line-clamp-3 mb-3 prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{ __html: item.excerpt }}
                    />
                    <a
                      href={item.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors'
                    >
                      Devamını oku →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
