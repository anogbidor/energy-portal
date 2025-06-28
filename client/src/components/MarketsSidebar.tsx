// src/components/MarketsSidebar.tsx
import { Link } from 'react-router-dom'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import {
  CurrencyDollarIcon,
  CurrencyEuroIcon,
  CurrencyPoundIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  FireIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'
import { useLiveData } from '../hooks/useLiveData'

export default function MarketsSidebar(){
  const { data, loading, error } = useLiveData()

  if (loading)
    return (
      <aside className='w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 h-fit'>
        <div className='flex items-center mb-4'>
          <ChartBarIcon className='h-5 w-5 text-green-600 mr-2' />
          <h3 className='text-xl font-bold text-green-900'>Piyasalar</h3>
        </div>
        <div className='animate-pulse space-y-4'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='h-10 bg-gray-200 rounded'></div>
          ))}
        </div>
      </aside>
    )

  if (error)
    return (
      <aside className='w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 h-fit'>
        <div className='flex items-center mb-4'>
          <ChartBarIcon className='h-5 w-5 text-green-600 mr-2' />
          <h3 className='text-xl font-bold text-green-900'>Piyasalar</h3>
        </div>
        <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700'>
          Veri yüklenirken hata oluştu
        </div>
      </aside>
    )

  // Default change values
  const defaultChangeValues = {
    usdTryChange: 0.3,
    eurTryChange: 0.5,
    gbpTryChange: -0.2,
    goldPriceChange: 1.8,
    dowChange: 0.4,
    bistChange: -0.7,
    daxChange: 0.2,
    shanghaiChange: -0.3,
  }

  const markets = [
    {
      name: 'USD/TRY',
      value: data?.usdTry || 32.45,
      change: defaultChangeValues.usdTryChange,
      symbol: '$',
      targetSymbol: '₺',
      link: '/prices',
      icon: <CurrencyDollarIcon className='h-5 w-5 text-green-600' />,
    },
    {
      name: 'EUR/TRY',
      value: data?.eurTry || 35.12,
      change: defaultChangeValues.eurTryChange,
      symbol: '€',
      targetSymbol: '₺',
      link: '/prices',
      icon: <CurrencyEuroIcon className='h-5 w-5 text-blue-600' />,
    },
    {
      name: 'GBP/TRY',
      value: data?.gbpTry || 41.28,
      change: defaultChangeValues.gbpTryChange,
      symbol: '£',
      targetSymbol: '₺',
      link: '/prices',
      icon: <CurrencyPoundIcon className='h-5 w-5 text-purple-600' />,
    },
    {
      name: 'DOW',
      value: 34256,
      change: defaultChangeValues.dowChange,
      symbol: '',
      targetSymbol: '',
      link: '/prices',
      icon: <ChartBarIcon className='h-5 w-5 text-indigo-600' />,
    },
    {
      name: 'BIST',
      value: 7854,
      change: defaultChangeValues.bistChange,
      symbol: '',
      targetSymbol: '',
      link: '/prices',
      icon: <BuildingLibraryIcon className='h-5 w-5 text-red-600' />,
    },
    {
      name: 'DAX',
      value: 15678,
      change: defaultChangeValues.daxChange,
      symbol: '',
      targetSymbol: '',
      link: '/prices',
      icon: <BuildingOffice2Icon className='h-5 w-5 text-yellow-600' />,
    },
    {
      name: 'SHANGHAI',
      value: 3256,
      change: defaultChangeValues.shanghaiChange,
      symbol: '',
      targetSymbol: '',
      link: '/prices',
      icon: <BuildingStorefrontIcon className='h-5 w-5 text-orange-600' />,
    },
    {
      name: 'BRENT',
      value: data?.brent || 85.42,
      change: 0.8,
      symbol: '',
      targetSymbol: '$',
      link: '/prices',
      icon: <FireIcon className='h-5 w-5 text-amber-600' />,
    },
    {
      name: 'ALTIN',
      value: 1954,
      change: defaultChangeValues.goldPriceChange,
      symbol: '',
      targetSymbol: '$',
      link: '/prices',
      icon: <BanknotesIcon className='h-5 w-5 text-amber-400' />,
    },
  ]

  return (
    <aside className='w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 h-fit'>
      <div className='flex items-center mb-4'>
        <ChartBarIcon className='h-5 w-5 text-green-600 mr-2' />
        <h3 className='text-xl font-bold text-green-900'>Piyasalar</h3>
      </div>

      <ul className='space-y-2'>
        {markets.map((market) => (
          <li key={market.name}>
            <Link
              to={market.link}
              className='group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200'
            >
              <div className='flex items-center'>
                <div className='mr-3 p-1 bg-gray-50 rounded-full'>
                  {market.icon}
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-800 group-hover:text-green-600'>
                    {market.name}
                  </h4>
                  <p className='text-xs text-gray-500 mt-1'>
                    {market.symbol}
                    {market.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {market.targetSymbol}
                  </p>
                </div>
              </div>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  market.change >= 0
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {market.change >= 0 ? (
                  <ArrowUpIcon className='mr-1 h-3 w-3 text-green-700' />
                ) : (
                  <ArrowDownIcon className='mr-1 h-3 w-3 text-red-700' />
                )}
                {Math.abs(market.change)}%
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to='/prices'
        className='flex items-center justify-center mt-4 text-green-600 hover:text-green-700 font-medium text-sm py-2 px-4 rounded-lg border border-green-100 hover:border-green-200 transition-colors duration-200'
      >
        <ChartBarIcon className='h-4 w-4 mr-2' />
        Tüm Piyasa Verileri
      </Link>
    </aside>
  )
}
