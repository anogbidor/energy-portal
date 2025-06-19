import CareerCard from './CareerCard'

interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  applyLink: string
}

interface Props {
  jobs: Job[]
}

export default function CareerList({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <div className='text-center py-12'>
        <svg
          className='mx-auto h-12 w-12 text-gray-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          />
        </svg>
        <h3 className='mt-2 text-lg font-medium text-gray-900'>
          No current openings
        </h3>
        <p className='mt-1 text-gray-500'>
          We don't have any positions available right now, but check back later!
        </p>
        <div className='mt-6'>
          <button
            type='button'
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            <svg
              className='-ml-1 mr-2 h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            Get notified when we're hiring
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div className='text-center'>
        <h2 className='text-3xl font-extrabold text-green-900 sm:text-4xl'>
          Join Our Team
        </h2>
        <p className='mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4'>
          We're building the future. Come be part of something great.
        </p>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-center'>
        <div className='w-full sm:w-auto'>
          <label htmlFor='department' className='sr-only'>
            Department
          </label>
          <select
            id='department'
            className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
          >
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Operations</option>
          </select>
        </div>
        <div className='w-full sm:w-auto'>
          <label htmlFor='location' className='sr-only'>
            Location
          </label>
          <select
            id='location'
            className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
          >
            <option>All Locations</option>
            <option>Remote</option>
            <option>San Francisco</option>
            <option>New York</option>
            <option>London</option>
          </select>
        </div>
        <div className='w-full sm:w-auto'>
          <label htmlFor='job-type' className='sr-only'>
            Job Type
          </label>
          <select
            id='job-type'
            className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
          >
            <option>All Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
      </div>

      {/* Job cards grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {jobs.map((job) => (
          <CareerCard key={job.id} {...job} />
        ))}
      </div>

      {/* Pagination would go here */}
      <nav className='flex items-center justify-between border-t border-gray-200 px-4 sm:px-0'>
        <div className='-mt-px flex w-0 flex-1'>
          <button type='button' className='inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'>
            <svg
              className='mr-3 h-5 w-5 text-gray-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z'
                clipRule='evenodd'
              />
            </svg>
            Previous
          </button>
        </div>
        <div className='hidden md:-mt-px md:flex'>
          <button type='button' className='inline-flex items-center border-t-2 border-green-500 px-4 pt-4 text-sm font-medium text-green-600'>
            1
          </button>
          <button type='button' className='inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'>
            2
          </button>
          <button type='button' className='inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'>
            3
          </button>
        </div>
        <div className='-mt-px flex w-0 flex-1 justify-end'>
          <button className='inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'>
            Next
            <svg
              className='ml-3 h-5 w-5 text-gray-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  )
}
