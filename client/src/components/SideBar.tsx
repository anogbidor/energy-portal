import { Link } from 'react-router-dom'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useLicenseEvents } from '../hooks/useLicenseEvents'

const EVENT_LABELS: Record<string, string> = {
  issued: 'Yeni Lisans',
  status_changed: 'Durum Değişikliği',
  distributor_changed: 'Dağıtıcı Değişikliği',
  updated: 'Güncelleme',
}

function formatDate(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('tr-TR')
}

export default function Sidebar() {
  const { data, loading, error } = useLicenseEvents(5)

  return (
    <aside className='w-72 bg-white p-5 rounded-xl border border-gray-200 sticky top-20 h-fit'>
      <div className='flex items-center gap-2 mb-4'>
        <ClockIcon className='h-5 w-5 text-gray-400' />
        <h3 className='text-sm font-semibold text-gray-900'>
          Son Lisans Hareketleri
        </h3>
      </div>

      {loading ? (
        <div className='animate-pulse space-y-2'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-14 bg-gray-100 rounded-lg' />
          ))}
        </div>
      ) : error ? (
        <p className='text-sm text-gray-500'>Veri yüklenemedi</p>
      ) : !data || data.length === 0 ? (
        <p className='text-sm text-gray-500'>
          Henüz kayıtlı bir lisans hareketi yok.
        </p>
      ) : (
        <ul className='space-y-1'>
          {data.map((event) => (
            <li key={event.id}>
              <div className='p-2.5 rounded-lg hover:bg-gray-50'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-medium text-gray-500'>
                    {EVENT_LABELS[event.event_type] ?? event.event_type}
                  </span>
                  <span className='text-xs text-gray-400'>
                    {formatDate(event.effective_at ?? event.detected_at)}
                  </span>
                </div>
                <p className='text-sm text-gray-800 mt-0.5 truncate'>
                  {event.licenses?.lisans_sahibi_unvani ?? event.lisans_no}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        to='/license'
        className='mt-3 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors'
      >
        Tüm Lisanslar
      </Link>
    </aside>
  )
}
