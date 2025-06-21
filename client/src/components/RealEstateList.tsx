import RealEstateCard from './RealEstateCard'
import { useState } from 'react'

interface RealEstate {
  id: string
  title: string
  location: string
  area: string
  price: string
  description: string
  contact: string
  image?: string
  bedrooms?: number
  bathrooms?: number
  featured?: boolean
  status?: 'For Sale' | 'For Rent' | 'Sold'
}

interface Props {
  listings: RealEstate[]
}

type SortOption = 'price' | 'date' | 'featured'

export default function RealEstateList({ listings }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  if (listings.length === 0) {
    return (
      <div className='text-center py-12'>
        <svg
          className='mx-auto h-12 w-12 text-gray-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1}
            d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <h3 className='mt-2 text-lg font-medium text-gray-900'>
          No listings found
        </h3>
        <p className='mt-1 text-gray-500'>
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    )
  }

  // Sort listings based on selected option
  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''))
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''))
      return priceA - priceB
    } else if (sortBy === 'date') {
      // Assuming newer listings have higher IDs (for demo purposes)
      return parseInt(b.id) - parseInt(a.id)
    } else {
      // Featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    }
  })

  return (
    <div className='space-y-6'>
      {/* List controls */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='text-sm text-green-900'>
          Showing{' '}
          <span className='font-medium text-green-900'>{listings.length}</span>{' '}
          properties
        </div>

        <div className='flex items-center gap-4'>
          {/* Sort dropdown */}
          <div className='relative'>
            <select
              title='Sort'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className='appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='featured'>Featured first</option>
              <option value='price'>Price: Low to High</option>
              <option value='date'>Newest first</option>
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
          </div>

          {/* View mode toggle */}
          <div className='flex bg-gray-100 rounded-md p-1'>
       <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
              aria-label='Grid view'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
              aria-label='List view'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
        }
      >
        {sortedListings.map((listing) => (
          <RealEstateCard
            key={listing.id}
            {...listing}
            className={viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}
          />
        ))}
      </div>
    </div>
  )
}
