import { Link } from 'react-router-dom'

const links = [
  { path: '/news', name: 'Haberler' },
  { path: '/prices', name: 'Fiyatlar' },
  { path: '/stations', name: 'İstasyonlar' },
  { path: '/license', name: 'Lisanslar' },
  { path: '/careers', name: 'İlanlar' },
  { path: '/real-estate', name: 'Emlak' },
]

export default function Footer() {
  return (
    <footer className='bg-gray-950 text-gray-400 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          <img
            src='./enerjiportal.png'
            alt='Enerji Portal'
            className='h-5 w-auto object-contain opacity-90'
          />
          <nav className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className='hover:text-white transition-colors'
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className='mt-8 pt-6 border-t border-white/10 text-xs text-gray-500'>
          © {new Date().getFullYear()} Enerji Portal — EPDK lisans ve piyasa verileri.
        </div>
      </div>
    </footer>
  )
}
