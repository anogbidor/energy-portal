// 🔹 src/pages/Careers.tsx
import CareerList from '../components/CareerList'
import { useCareerListings } from '../hooks/useCareerListings'

export default function CareersPage() {
  const { jobs, loading, error } = useCareerListings()

  return (
    <div className='bg-gray-50'>
      {/* Hero section */}
      <div className='bg-[#1fa637] py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl'>
            Build Your Career With Us
          </h1>
          <p className='mt-6 text-xl text-white max-w-3xl mx-auto'>
            We're not just offering jobs, we're offering opportunities to grow,
            innovate, and make an impact.
          </p>
          <div className='mt-10 flex justify-center'>
            <div className='inline-flex rounded-md shadow'>
              <a
                href='#open-positions'
                className='inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-900 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-all duration-200'
              >
                View Open Positions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* Benefits section */}
        <div className='mb-16 text-center'>
          <h2 className='text-3xl font-extrabold text-green-900 sm:text-4xl'>
            Why Join Our Team?
          </h2>
          <div className='mt-12 grid gap-8 md:grid-cols-3'>
            {[
              {
                name: 'Growth Opportunities',
                description:
                  'Continuous learning with mentorship programs and professional development budgets.',
                icon: '📈',
              },
              {
                name: 'Flexible Work',
                description:
                  'Remote-friendly options and flexible hours to support work-life balance.',
                icon: '🏡',
              },
              {
                name: 'Impactful Work',
                description:
                  'Your contributions will directly shape products used by millions worldwide.',
                icon: '🌎',
              },
            ].map((benefit) => (
              <div key={benefit.name} className='pt-6'>
                <div className='flow-root bg-white rounded-lg px-6 pb-8 h-full shadow-md hover:shadow-lg transition-shadow duration-300'>
                  <div className='-mt-6'>
                    <div className='flex items-center justify-center h-12 w-12 rounded-md bg-gray-200 text-white text-xl mx-auto'>
                      {benefit.icon}
                    </div>
                    <h3 className='mt-4 text-lg font-medium text-green-900'>
                      {benefit.name}
                    </h3>
                    <p className='mt-2 text-base text-gray-500'>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job listings section */}
        <section id='open-positions' className='mb-16'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl font-bold text-green-900 mb-2'>
              Career Opportunities
            </h2>
            <p className='text-lg text-gray-600 mb-8'>
              Browse our current openings and find your perfect fit
            </p>

            {loading && (
              <div className='flex justify-center items-center py-20'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600'></div>
                <span className='ml-4 text-green-900'>
                  Loading opportunities...
                </span>
              </div>
            )}

            {error && (
              <div className='rounded-md bg-red-50 p-4 mb-8'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-red-800'>
                      Error loading job listings
                    </h3>
                    <div className='mt-2 text-sm text-red-700'>
                      <p>{error}</p>
                    </div>
                    <div className='mt-4'>
                      <button
                        type='button'
                        onClick={() => window.location.reload()}
                        className='text-sm font-medium text-red-800 hover:text-red-700 focus:outline-none focus:underline transition duration-150 ease-in-out'
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && <CareerList jobs={jobs} />}
          </div>
        </section>

        {/* Culture CTA */}
        <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
          <div className='grid grid-cols-1 md:grid-cols-2'>
            <div className='p-8 sm:p-12'>
              <h2 className='text-3xl font-extrabold text-green-900 sm:text-4xl'>
                Our Culture
              </h2>
              <p className='mt-4 text-lg text-gray-500'>
                We believe in fostering an inclusive environment where
                creativity and innovation thrive. Our team values collaboration,
                transparency, and continuous improvement.
              </p>
              <div className='mt-8'>
                <a
                  href='/about'
                  className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#1fa637] hover:bg-green-700 transition-colors duration-200'
                >
                  Learn about our culture
                  <svg
                    className='ml-3 -mr-1 h-5 w-5'
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
            <div className='bg-gray-100 p-8 sm:p-12 flex items-center justify-center'>
              <div className='aspect-w-16 aspect-h-9 w-full'>
                <img
                  className='object-cover rounded-lg shadow-md'
                  src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
                  alt='Team working together'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
