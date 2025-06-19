// 🔹 src/components/Navbar.tsx
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DocumentChartBarIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const location = useLocation()

  const navItems = [
    { path: '/', name: 'Anasayfa', icon: HomeIcon },
    { path: '/news', name: 'Haberler', icon: NewspaperIcon },
    { path: '/prices', name: 'Fiyatlar', icon: CurrencyDollarIcon },
    { path: '/stations', name: 'İstasyonlar', icon: MapPinIcon },
    { path: '/reports', name: 'Raporlar', icon: DocumentChartBarIcon },
    { path: '/careers', name: 'İlanları', icon: BriefcaseIcon },
    { path: '/real-estate', name: 'Emlak', icon: BuildingOfficeIcon },
  ]

  return (
    <nav className='bg-[#1fa637] text-white shadow-lg'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center py-3'>
          <div className='flex items-center space-x-2'>
            {/* Enhanced Logo Container */}
            <div className='flex items-center justify-center'>
              <img
                src='./enerjiportal.png'
                alt='Enerji Portal Logo'
                className='h-8 w-auto object-contain transition-all duration-300 hover:scale-105'
              />
            </div>
          </div>

          <div className='hidden md:flex items-center space-x-1'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white/15 text-yellow-200'
                    : 'hover:bg-white/10 hover:text-yellow-200'
                }`}
              >
                <item.icon className='h-5 w-5 mr-2' />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type='button'
            title='Menu'
            className='md:hidden p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none transition-colors duration-200'
            aria-label='Navigation menu'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
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
    </nav>
  )
}
