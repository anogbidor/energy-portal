interface CareerCardProps {
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  applyLink: string
}

export default function CareerCard({
  title,
  department,
  location,
  type,
  description,
  requirements,
  applyLink,
}: CareerCardProps) {
  return (
    <div className='border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 bg-white hover:bg-gray-50 group'>
      <div className='flex flex-col h-full'>
        {/* Header with title and badge */}
        <div className='flex justify-between items-start mb-4'>
          <h3 className='text-2xl font-bold text-green-900 group-hover:text-green-600 transition-colors'>
            {title}
          </h3>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            {type}
          </span>
        </div>

        {/* Meta information */}
        <div className='flex flex-wrap gap-4 mb-4'>
          <div className='flex items-center text-sm text-gray-600'>
            <svg
              className='w-4 h-4 mr-1.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
              />
            </svg>
            {department}
          </div>
          <div className='flex items-center text-sm text-gray-600'>
            <svg
              className='w-4 h-4 mr-1.5'
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
            {location}
          </div>
        </div>

        {/* Description */}
        <p className='text-gray-700 mb-5 flex-grow'>{description}</p>

        {/* Requirements */}
        <div className='mb-6'>
          <h4 className='text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2'>
            Requirements
          </h4>
          <ul className='space-y-2'>
            {requirements.map((req, i) => (
              <li key={i} className='flex items-start'>
                <svg
                  className='h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                <span className='text-gray-700'>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Apply button */}
        <div className='mt-auto'>
          <a
            href={applyLink}
            className='inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-800 hover:to-green-900 shadow-sm transition-all hover:shadow-md'
            target='_blank'
            rel='noopener noreferrer'
          >
            Apply Now
            <svg
              className='w-4 h-4 ml-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M14 5l7 7m0 0l-7 7m7-7H3'
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
