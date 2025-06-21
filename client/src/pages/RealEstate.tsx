import { useRealEstateListings } from '../hooks/useRealEstateListings'
import RealEstateList from '../components/RealEstateList'
import { FiHome, FiSearch, FiFilter, FiMapPin } from 'react-icons/fi'
import { useState } from 'react'

export default function RealEstatePage() {
  const { listings, loading, error } = useRealEstateListings()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className=' bg-white max-w-auto mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Hero Section */}
      <div className='bg-gray-200 rounded-2xl p-8 mb-8 text-green-900'>
        <div className='max-w-2xl'>
          <h1 className='text-4xl font-bold mb-4'>Find Your Dream Property</h1>
          <p className='text-lg mb-6'>
            Discover the perfect home from our premium selection of properties
            across the country
          </p>

          {/* Search Bar */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiSearch className='h-5 w-5 text-green-900' />
            </div>
            <input
              type='text'
              placeholder='Search by location or property name...'
              className='block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg bg-white bg-opacity-20 placeholder-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type='submit' className='absolute right-2 top-2 bg-green-900 text-white px-4 py-2 rounded-md font-medium hover:bg-green-800 transition'>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div className='flex items-center gap-2'>
          <FiFilter className='text-green-900' />
          <span className='font-medium'>Filters:</span>
        </div>

        <div className='flex flex-wrap gap-3'>
          <button type='button' title='Houses' className='px-4 py-2 bg-gray-100 text-green-900 rounded-full text-sm font-medium hover:bg-gray-200 transition'>
            <FiHome className='inline mr-1' /> Houses
          </button>
          <button type='button' title='Location' className='px-4 py-2 bg-gray-100 text-green-900 rounded-full text-sm font-medium hover:bg-gray-200 transition'>
            <FiMapPin className='inline mr-1' /> Location
          </button>
          <button type='button' className='px-4 py-2 bg-gray-100 text-green-900 rounded-full text-sm font-medium hover:bg-gray-200 transition'>
            Price Range
          </button>
          <button type='button' className='px-4 py-2 bg-gray-100 text-green-900 rounded-full text-sm font-medium hover:bg-gray-200 transition'>
            Bedrooms
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4'></div>
          <p className='text-gray-600'>Loading properties...</p>
        </div>
      )}

      {error && (
        <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-8'>
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
              <h3 className='text-sm font-medium text-red-800'>
                Error loading properties
              </h3>
              <div className='mt-2 text-sm text-red-700'>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && (
        <div className='mb-6 flex justify-between items-center'>
          <h2 className='text-xl font-semibold text-green-900'>
            {filteredListings.length}{' '}
            {filteredListings.length === 1 ? 'Property' : 'Properties'} Found
          </h2>
          <div className='text-sm text-green-900'>
            Sorted by: <span className='font-medium'>Recommended</span>
          </div>
        </div>
      )}

      {/* Property List */}
      {!loading && !error && <RealEstateList listings={filteredListings} />}

      {/* Newsletter CTA */}
      {!loading && !error && (
        <div className='mt-16 bg-green-600 rounded-xl p-8 text-center'>
          <h3 className='text-2xl font-bold text-white mb-3'>
            Stay Updated
          </h3>
          <p className='text-lg text-white mb-6 max-w-2xl mx-auto'>
            Subscribe to our newsletter to get the latest property listings and
            market insights
          </p>
          <div className='max-w-md mx-auto flex'>
            <input
              type='email'
              placeholder='Your email address'
              className='flex-1 min-w-0 px-4 py-3  text-white  rounded-l-lg border border-white/50 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50'
            />
            <button type='button' className='bg-white hover:bg-white/50 text-green-900 px-6 py-3 rounded-r-lg font-medium transition'>
              Subscribe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
