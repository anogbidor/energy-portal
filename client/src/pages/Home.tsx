import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowRightIcon, NewspaperIcon } from '@heroicons/react/24/outline'
import Hero from '../components/Hero'
import { useNewsFeed } from '../hooks/useNewsFeed'
import ErrorMessage from '../components/ErrorMessage'
import MarketsSideBar from '../components/MarketsSideBar'
import LicenseSummaryTable from '../components/LicenseSummaryTable'
import PriceTicker from '../components/PriceTicker'

export default function Home() {
  const { news, loading, error } = useNewsFeed()
  // The prominent carousel prioritizes items that actually have an
  // image (currently Bloomberg HT / CNN Türk -- OilPrice's feed has no
  // per-article images at all) so the homepage's headline section
  // always looks visually rich, not a mix of photos and blank cards.
  // The list below still shows everything, image or not.
  const featuredNews = useMemo(() => {
    const withImages = (news ?? []).filter((item) => item.imageUrl)
    // Falls back to the plain top-3 only if literally nothing has an
    // image (e.g. both Turkish sources briefly down) -- otherwise a
    // real "no news" empty state would show even though news exists.
    return (withImages.length > 0 ? withImages : news ?? []).slice(0, 3)
  }, [news])
  const moreNews = useMemo(() => {
    const featuredLinks = new Set(featuredNews.map((item) => item.link))
    return (news ?? []).filter((item) => !featuredLinks.has(item.link)).slice(0, 6)
  }, [news, featuredNews])

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
                <div>
                  {/* Featured grid -- image-having items, most recent first */}
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    {featuredNews.map((item) => (
                      <a
                        key={`${item.title}-${item.date}`}
                        href={item.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors flex flex-col'
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className='h-40 w-full object-cover'
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        )}
                        <div className='p-4 flex flex-col flex-1'>
                          <div className='flex items-center justify-between gap-2 mb-2'>
                            <span className='text-xs font-semibold text-gray-500'>
                              {item.source}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {item.date}
                            </span>
                          </div>
                          <h3 className='text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors'>
                            {item.title}
                          </h3>
                          <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
                            {item.excerpt}
                          </p>
                          <span className='text-gray-900 group-hover:text-brand-purple text-sm font-medium flex items-center mt-auto transition-colors'>
                            Haberin Devamı
                            <ArrowRightIcon className='h-4 w-4 ml-1' />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* More headlines below the grid */}
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
