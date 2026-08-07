import { Link } from 'react-router-dom'

const siteLinks = [
  { path: '/', name: 'Anasayfa' },
  { path: '/news', name: 'Haberler' },
  { path: '/prices', name: 'Fiyatlar' },
  { path: '/stations', name: 'İstasyonlar' },
  { path: '/license', name: 'Lisanslar' },
]

const marketLinks = [
  { market: 'petrol', name: 'Petrol' },
  { market: 'lpg', name: 'LPG' },
  { market: 'dogalgaz', name: 'Doğalgaz' },
  { market: 'elektrik', name: 'Elektrik' },
]

export default function Footer() {
  return (
    <footer className='bg-gray-950 text-gray-400 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
        <div className='flex flex-col md:flex-row md:justify-between gap-8'>
          <div className='max-w-xs'>
            <img
              src='/enerjipost-light.svg'
              alt='Enerjipost'
              className='h-6 w-auto object-contain opacity-90'
            />
            <p className='mt-3 text-sm text-gray-500'>
              EPDK lisans hareketleri, akaryakıt fiyatları ve döviz kurları için
              gerçek zamanlı takip.
            </p>
          </div>

          <div className='flex flex-wrap gap-x-12 gap-y-6'>
            <div>
              <h3 className='text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3'>
                Piyasalar
              </h3>
              <nav className='flex flex-col gap-2 text-sm'>
                {marketLinks.map((link) => (
                  <Link
                    key={link.market}
                    to={`/license?market=${link.market}`}
                    className='hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className='text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3'>
                Site
              </h3>
              <nav className='flex flex-col gap-2 text-sm'>
                {siteLinks.map((link) => (
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
          </div>
        </div>
        <div className='mt-8 pt-6 border-t border-white/10 text-xs text-gray-500'>
          © {new Date().getFullYear()} Enerjipost — EPDK lisans ve piyasa verileri.
        </div>
      </div>
    </footer>
  )
}
