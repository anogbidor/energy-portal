interface RealEstateCardProps {
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
  className?: string
}

export default function RealEstateCard({
  title,
  location,
  area,
  price,
  description,
  contact,
  image,
  bedrooms = 0,
  bathrooms = 0,
  featured = false,
  status = 'For Sale',
  className = '',
}: RealEstateCardProps) {

// console.log(image)

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group ${
        featured ? 'ring-2 ring-blue-500' : ''
      } ${
        className.includes('flex-row')
          ? 'flex flex-col md:flex-row h-auto md:h-64'
          : ''
      }`}
    >
      {/* Badges - position changes based on view mode */}
      <div
        className={`absolute z-10 flex gap-2 ${
          className.includes('flex-row') ? 'top-3 left-3' : 'top-3 left-3'
        }`}
      >
        {featured && (
          <span className='bg-[#1fa637] text-white text-xs font-bold px-2 py-1 rounded-full'>
            Featured
          </span>
        )}
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            status === 'Sold'
              ? 'bg-red-500 text-white'
              : status === 'For Rent'
              ? 'bg-green-500 text-white'
              : 'bg-yellow -500 text-gray-800'
          }`}
        >
          {status}
        </span>
      </div>

      {/* Image container - adjusts for list view */}
      <div
        className={`relative overflow-hidden ${
          className.includes('flex-row') ? 'md:w-1/3 h-48 md:h-full' : 'h-64'
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              className.includes('flex-row') ? 'md:rounded-l-xl' : ''
            }`}
            loading='lazy'
          />
        ) : (
          <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
            <svg
              className='w-12 h-12 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        )}
        <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300' />
      </div>

      {/* Content container - adjusts for list view */}
      <div
        className={`p-5 ${className.includes('flex-row') ? 'md:w-2/3' : ''}`}
      >
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors'>
              {title}
            </h3>
            <div className='flex items-center text-gray-600 mt-1'>
              <svg
                className='w-4 h-4 mr-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              <span className='text-sm'>{location}</span>
            </div>
          </div>
          <span className='text-xl font-bold text-green-600'>{price}</span>
        </div>

        {/* Property features - adjusts layout for list view */}
        <div
          className={`${
            className.includes('flex-row')
              ? 'grid grid-cols-3 gap-2'
              : 'flex gap-4'
          } mt-3 text-sm`}
        >
          <div className='flex items-center text-gray-700'>
            <svg
              className='w-4 h-4 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
              />
            </svg>
            {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
          </div>
          <div className='flex items-center text-gray-700'>
            <svg
              className='w-4 h-4 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
          </div>
          <div className='flex items-center text-gray-700'>
            <svg
              className='w-4 h-4 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4'
              />
            </svg>
            {area}
          </div>
        </div>

        <p
          className={`mt-3 text-gray-700 ${
            className.includes('flex-row') ? 'line-clamp-3' : 'line-clamp-2'
          }`}
        >
          {description}
        </p>

        <div className='mt-4 pt-4 border-t border-gray-100 flex justify-between items-center'>
          <a
            href={`mailto:${contact}`}
            className='text-green-600 hover:text-blue-800 font-medium text-sm flex items-center'
          >
            <svg
              className='w-4 h-4 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
            Contact Agent
          </a>
          <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
