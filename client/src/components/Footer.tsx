import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className='bg-blue-800 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* About */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Enerji Portal</h3>
            <p className='text-blue-100'>
              Enerji sektörü için güncel bilgiler ve analizler.
            </p>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Hızlı Linkler</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  to='/about'
                  className='text-blue-100 hover:text-white transition'
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  to='/services'
                  className='text-blue-100 hover:text-white transition'
                >
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link
                  to='/blog'
                  className='text-blue-100 hover:text-white transition'
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='text-blue-100 hover:text-white transition'
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>İletişim</h3>
            <address className='not-italic text-blue-100'>
              <p>1234 Enerji Caddesi</p>
              <p>Ankara, Türkiye</p>
              <p>Email: info@enerjiportal.com</p>
              <p>Tel: +90 312 123 4567</p>
            </address>
          </div>

          {/* Social Media */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Sosyal Medya</h3>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='text-white hover:text-white transition'
                aria-label='LinkedIn'
              >
                <svg
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  className='h-6 w-6'
                  aria-hidden='true'
                >
                  <path d='M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 7.5h4V24h-4V7.5zM9 7.5h3.5v2.4h.1c.49-.92 1.68-1.9 3.45-1.9 3.69 0 4.37 2.42 4.37 5.56V24h-4V14.1c0-2.34-.04-5.36-3.28-5.36-3.29 0-3.8 2.57-3.8 5.2V24H9V7.5z' />
                </svg>
              </a>
              <a
                href='#'
                className='text-white hover:text-white transition'
                aria-label='Instagram'
              >
                <svg
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  className='h-6 w-6'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zM12 7a5 5 0 100 10 5 5 0 000-10zM5.5 7.25a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-blue-700 mt-8 pt-6 text-center text-blue-100'>
          <p>
            © {new Date().getFullYear()} Enerji Portal. Tüm hakları saklıdır.
          </p>
          <div className='mt-2 text-xs'>
            <Link to='/privacy' className='hover:text-white transition'>
              Gizlilik Politikası
            </Link>
            <span className='mx-2'>•</span>
            <Link to='/terms' className='hover:text-white transition'>
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
