import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

function Sidebar() {
  const licenseMovements = [
    { id: 1, title: 'Lisans Başvuru Süreçleri', date: '25.08.2025' },
    { id: 2, title: 'Lisans Yenileme Duyurusu', date: '20.08.2025' },
    { id: 3, title: 'Yeni Lisans Rehberi', date: '15.08.2025' },
    { id: 4, title: 'Lisans İptal İşlemleri', date: '10.08.2025' },
    { id: 5, title: 'Lisans Ücret Güncellemesi', date: '05.08.2025' },
  ]

  return (
    <aside className='w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 h-fit'>
      {/* Header with icon */}
      <div className='flex items-center mb-6'>
        <div className='bg-green-100 p-2 rounded-lg mr-3'>
          <DocumentTextIcon className='h-5 w-5 text-green-600' />
        </div>
        <h3 className='text-xl font-bold text-gray-800'>Lisans Hareketler</h3>
      </div>

      {/* List with hover effects and dates */}
      <ul className='space-y-3'>
        {licenseMovements.map((item) => (
          <li key={item.id}>
            <Link
              to={`/lisans-hareketler/${item.id}`}
              className='group flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200'
            >
              <div className='flex-1'>
                <h4 className='text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors'>
                  {item.title}
                </h4>
                <p className='text-xs text-gray-500 mt-1'>{item.date}</p>
              </div>
              <ChevronRightIcon className='h-4 w-4 text-gray-400 group-hover:text-green-600 mt-1 transition-colors' />
            </Link>
          </li>
        ))}
      </ul>

      {/* View all link with icon */}
      <Link
        to='/lisans-hareketler'
        className='mt-6 flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200'
      >
        <span className='text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors'>
          Tüm Lisans Hareketler
        </span>
        <ArrowRightIcon className='h-4 w-4 text-green-600 group-hover:text-green-700 group-hover:translate-x-1 transition-all' />
      </Link>

      {/* Additional useful links section */}
      <div className='mt-8 pt-6 border-t border-gray-200'>
        <h4 className='text-sm font-semibold text-gray-600 mb-3'>
          Hızlı Erişim
        </h4>
        <ul className='space-y-2'>
          <li>
            <Link
              to='/mevzuat'
              className='text-sm text-gray-600 hover:text-green-600 flex items-center py-1.5'
            >
              <ChevronRightIcon className='h-3 w-3 mr-2 text-gray-400' />
              Mevzuat ve Yönetmelikler
            </Link>
          </li>
          <li>
            <Link
              to='/sikca-sorulanlar'
              className='text-sm text-gray-600 hover:text-green-600 flex items-center py-1.5'
            >
              <ChevronRightIcon className='h-3 w-3 mr-2 text-gray-400' />
              Sıkça Sorulan Sorular
            </Link>
          </li>
          <li>
            <Link
              to='/iletisim'
              className='text-sm text-gray-600 hover:text-green-600 flex items-center py-1.5'
            >
              <ChevronRightIcon className='h-3 w-3 mr-2 text-gray-400' />
              İletişim ve Destek
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
