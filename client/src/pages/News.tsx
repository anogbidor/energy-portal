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
  const [visibleNewsCount, setVisibleNewsCount] = useState(10) // Initial number of news to show

  // Filter news by active category
  const filteredNews = news?.filter(
    (item) => activeCategory === 'Tümü' || item.category === activeCategory
  )

  // Extract the first news item as featured
  const featuredNews = filteredNews?.[0]
  const remainingNews = filteredNews?.slice(1, visibleNewsCount)

  // Categories for filtering
  const categories = [
    { name: 'Tümü', icon: <NewspaperIcon className='h-4 w-4' /> },
    { name: 'Güncel', icon: <ClockIcon className='h-4 w-4' /> },
    { name: 'Petrol', icon: <FireIcon className='h-4 w-4' /> },
    { name: 'Elektrik', icon: <BoltIcon className='h-4 w-4' /> },
    { name: 'Yenilenebilir', icon: <SunIcon className='h-4 w-4' /> },
  ]

  // Load more news function
  

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Page Header */}
        <div className='mb-8 border-b border-gray-200 pb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>Enerji Haberleri</h1>
          <p className='mt-2 text-gray-600'>
            Türkiye ve dünyadan enerji sektöründeki son gelişmeler
          </p>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
            <div className='flex'>
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
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className='mb-8 overflow-x-auto'>
          <div className='flex space-x-4 pb-2'>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name)
                  setVisibleNewsCount(9) // Reset visible count when changing category
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
                  activeCategory === category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && filteredNews && (
          <div className='space-y-10'>
            {/* Featured News (First Article) */}
            {featuredNews && (
              <div className='bg-white rounded-xl shadow-md overflow-hidden'>
                <div className='md:flex'>
                  <div className='md:flex-shrink-0 md:w-1/2 bg-gray-200 flex items-center justify-center'>
                    {featuredNews.imageUrl ? (
                      <img
                        className='h-64 w-full object-cover md:h-full'
                        src={featuredNews.imageUrl}
                        alt={featuredNews.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-news.jpg'
                          target.className = 'h-full w-full object-contain p-4'
                        }}
                      />
                    ) : (
                      <div className='text-gray-400 p-8 text-center'>
                        <NewspaperIcon className='h-16 w-16 mx-auto' />
                        <p>Resim Yok</p>
                      </div>
                    )}
                  </div>
                  <div className='p-8'>
                    <div className='uppercase tracking-wide text-sm text-blue-600 font-semibold'>
                      {featuredNews.category} • Öne Çıkan
                    </div>
                    <a
                      href={featuredNews.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block mt-2 text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors'
                    >
                      {featuredNews.title}
                    </a>
                    <p className='mt-3 text-gray-500'>{featuredNews.date}</p>
                    <div
                      className='mt-4 text-gray-600 prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{ __html: featuredNews.excerpt }}
                    />
                    <div className='mt-6'>
                      <a
                        href={featuredNews.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                      >
                        Haberin Devamı
                        <svg
                          className='ml-2 -mr-1 w-4 h-4'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* News Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {remainingNews?.map((item, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
                >
                  <div className='h-48 w-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                    {item.imageUrl ? (
                      <img
                        className='h-full w-full object-cover'
                        src={item.imageUrl}
                        alt={item.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-news.jpg'
                          target.className = 'h-full w-full object-contain p-4'
                        }}
                      />
                    ) : (
                      <div className='text-gray-400 p-4 text-center'>
                        <NewspaperIcon className='h-12 w-12 mx-auto' />
                        <p className='text-xs mt-2'>Resim Yok</p>
                      </div>
                    )}
                  </div>
                  <div className='p-6'>
                    <div className='flex items-center text-xs text-gray-500 mb-2'>
                      <span className='font-medium text-blue-600'>
                        {item.category}
                      </span>
                      <span className='mx-2'>•</span>
                      <span>{item.date}</span>
                    </div>
                    <a
                      href={item.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2'
                    >
                      {item.title}
                    </a>
                    <div
                      className='text-gray-600 text-sm line-clamp-3 mb-4 prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{ __html: item.excerpt }}
                    />
                    <a
                      href={item.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors'
                    >
                      Devamını oku →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            
          </div>
        )}
      </div>
    </div>
  )
}
