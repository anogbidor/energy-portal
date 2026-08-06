// 🔹 src/components/Navbar.tsx
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const navItems = [
  { path: '/', name: 'Anasayfa', icon: HomeIcon },
  { path: '/news', name: 'Haberler', icon: NewspaperIcon },
  { path: '/prices', name: 'Fiyatlar', icon: CurrencyDollarIcon },
  { path: '/stations', name: 'İstasyonlar', icon: MapPinIcon },
  { path: '/license', name: 'Lisanslar', icon: DocumentChartBarIcon },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className='bg-gray-950 text-gray-100 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        <div className='flex justify-between items-center h-16'>
          <Link to='/' className='flex items-center'>
            <img
              src='/enerjipost-light.svg'
              alt='Enerjipost'
              className='h-7 w-auto object-contain'
            />
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-1'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-brand-purple/25 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type='button'
            title='Menu'
            className='md:hidden p-2 -mr-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors'
            aria-label='Navigation menu'
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className='h-6 w-6' />
            ) : (
              <Bars3Icon className='h-6 w-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='md:hidden pb-4 space-y-0.5'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className='h-5 w-5' />
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
