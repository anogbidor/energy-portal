// src/pages/Prices.tsx
import FuelPrice from '../components/FuelPrice'
import FuelPriceTrends from '../components/FuelPriceTrends'
import ExchangeRates from '../components/ExchangeRates'
import {
  CurrencyDollarIcon,
  BoltIcon,
  FireIcon,
} from '@heroicons/react/24/outline'

export default function Prices() {
  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Enerji Fiyatları
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Güncel piyasa verileri ve analizler
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Primary Prices */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Fuel Prices Section */}
            <div className='bg-white rounded-xl border border-gray-200'>
              <div className='flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-200'>
                <div className='flex items-center gap-2'>
                  <FireIcon className='h-5 w-5 text-gray-400' />
                  <h2 className='text-sm font-semibold text-gray-900'>
                    Akaryakıt ve LPG Fiyatları
                  </h2>
                </div>
                <span className='inline-flex items-center gap-1.5 text-xs font-medium text-gray-500'>
                  <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                  CANLI
                </span>
              </div>
              <div className='p-5'>
                <FuelPrice />
              </div>
            </div>

            {/* Price Trend Section */}
            <div className='bg-white rounded-xl border border-gray-200'>
              <div className='px-5 py-4 border-b border-gray-200'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  Fiyat Trendi
                </h2>
              </div>
              <div className='p-5'>
                <FuelPriceTrends />
              </div>
            </div>

            {/* Energy Prices Section */}
            <div className='bg-white rounded-xl border border-gray-200'>
              <div className='flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-200'>
                <div className='flex items-center gap-2'>
                  <BoltIcon className='h-5 w-5 text-gray-400' />
                  <h2 className='text-sm font-semibold text-gray-900'>
                    Elektrik ve Doğalgaz Fiyatları
                  </h2>
                </div>
                <span className='text-xs font-medium text-gray-400'>
                  Yakında
                </span>
              </div>
              <div className='p-5 grid grid-cols-2 gap-3'>
                <div className='p-4 rounded-lg border border-gray-200 text-center'>
                  <h3 className='text-sm font-medium text-gray-700'>
                    Elektrik
                  </h3>
                  <p className='text-xs text-gray-400 mt-1'>
                    Yakında eklenecek
                  </p>
                </div>
                <div className='p-4 rounded-lg border border-gray-200 text-center'>
                  <h3 className='text-sm font-medium text-gray-700'>
                    Doğalgaz
                  </h3>
                  <p className='text-xs text-gray-400 mt-1'>
                    Yakında eklenecek
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Exchange Rates */}
          <div>
            <div className='bg-white rounded-xl border border-gray-200'>
              <div className='flex items-center gap-2 px-5 py-4 border-b border-gray-200'>
                <CurrencyDollarIcon className='h-5 w-5 text-gray-400' />
                <h2 className='text-sm font-semibold text-gray-900'>
                  Döviz Kurları
                </h2>
              </div>
              <div className='p-5'>
                <ExchangeRates />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
