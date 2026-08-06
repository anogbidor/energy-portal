import { useLicenseEvents } from '../hooks/useLicenseEvents'

const EVENT_LABELS: Record<string, string> = {
  issued: 'Yeni Lisans',
  status_changed: 'Durum Değişikliği',
  distributor_changed: 'Dağıtıcı Değişikliği',
  updated: 'Güncelleme',
}

const EVENT_BADGE_CLASS: Record<string, string> = {
  issued: 'bg-green-50 text-green-700',
  status_changed: 'bg-amber-50 text-amber-700',
  distributor_changed: 'bg-blue-50 text-blue-700',
  updated: 'bg-gray-100 text-gray-600',
}

const MARKET_LABELS: Record<string, string> = {
  petrol: 'Petrol',
  lpg: 'LPG',
  dogalgaz: 'Doğalgaz',
  elektrik: 'Elektrik',
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('tr-TR')
}

function renderChange(value: Record<string, unknown> | null) {
  if (!value) return null
  const entries = Object.entries(value).filter(([, v]) => v != null)
  if (entries.length === 0) return null
  return entries.map(([, v]) => String(v)).join(', ')
}

export default function LicenseMovementsTable() {
  const { data, loading, error } = useLicenseEvents(25)

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='px-5 py-4 border-b border-gray-200'>
        <h2 className='text-sm font-semibold text-gray-900'>
          Lisans Piyasası Hareketleri
        </h2>
        <p className='text-xs text-gray-500 mt-0.5'>
          EPDK lisans durum değişiklikleri ve dağıtıcı hareketleri
        </p>
      </div>

      {loading ? (
        <div className='p-5 space-y-2'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-10 bg-gray-100 rounded animate-pulse' />
          ))}
        </div>
      ) : error ? (
        <p className='p-5 text-sm text-gray-500'>Veri yüklenemedi</p>
      ) : !data || data.length === 0 ? (
        <div className='p-8 text-center'>
          <p className='text-sm text-gray-500'>
            Henüz kayıtlı bir lisans hareketi yok. Sistem her 6 saatte bir
            EPDK verilerini kontrol ediyor — değişiklikler burada birikmeye
            başlayacak.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                {['Tarih', 'Hareket', 'Şirket', 'Lisans No', 'Piyasa', 'İl', 'Değişiklik'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className='px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {data.map((event) => (
                <tr key={event.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(event.effective_at ?? event.detected_at)}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        EVENT_BADGE_CLASS[event.event_type] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {EVENT_LABELS[event.event_type] ?? event.event_type}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {event.licenses?.lisans_sahibi_unvani ?? '—'}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {event.lisans_no}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {MARKET_LABELS[event.market] ?? event.market}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {event.licenses?.il ?? '—'}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-500'>
                    {event.event_type === 'distributor_changed' ? (
                      <span>
                        <span className='line-through text-gray-400'>
                          {renderChange(event.old_value)}
                        </span>
                        {' → '}
                        <span className='text-gray-900'>
                          {renderChange(event.new_value)}
                        </span>
                      </span>
                    ) : (
                      renderChange(event.new_value) ?? event.note ?? '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
