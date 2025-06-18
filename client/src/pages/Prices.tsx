// src/pages/Prices.tsx
import FuelPrice from '../components/FuelPrice'
import ExchangeRates from '../components/ExchangeRates'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function Prices() {
  return (
    <div className='p-6 max-w-4xl mx-auto space-y-12'>
      {/* Fuel Prices Section */}
      <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-800 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-red-500 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
              />
            </svg>
            Anlık Akaryakıt Fiyatları
          </h2>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            CANLI
          </span>
        </div>
        <FuelPrice />
      </div>

      {/* Exchange Rates Section */}
      <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
        <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
          <CurrencyDollarIcon className='h-6 w-6 text-green-600 mr-2' />
          Döviz Kurları
        </h2>
        <ExchangeRates />
      </div>
    </div>
  )
}
