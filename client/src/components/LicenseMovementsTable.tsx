import { useRecentLicenses } from '../hooks/useRecentLicenses'

const MARKET_LABELS: Record<string, string> = {
  petrol: 'Petrol',
  lpg: 'LPG',
  dogalgaz: 'Doğalgaz',
  elektrik: 'Elektrik',
}

const STATUS_LABELS: Record<string, string> = {
  ONAYLANDI: 'Yürürlükte',
  SONLANDIRILDI: 'Sonlandırıldı',
  IPTAL_EDILDI: 'İptal Edildi',
  IADE_EDILDI: 'İade Edildi',
  FAALIYETI_GECICI_DURDURULDU: 'Faaliyeti Geçici Durduruldu',
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  ONAYLANDI: 'bg-green-50 text-green-700',
  SONLANDIRILDI: 'bg-gray-100 text-gray-600',
  IPTAL_EDILDI: 'bg-red-50 text-red-700',
  IADE_EDILDI: 'bg-gray-100 text-gray-600',
  FAALIYETI_GECICI_DURDURULDU: 'bg-amber-50 text-amber-700',
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('tr-TR')
}

export default function LicenseMovementsTable() {
  const { data, loading, error } = useRecentLicenses(3, 30)

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='px-5 py-4 border-b border-gray-200'>
        <h2 className='text-sm font-semibold text-gray-900'>
          Son Verilen Lisanslar
        </h2>
        <p className='text-xs text-gray-500 mt-0.5'>
          Son 3 ayda başlangıç tarihi bulunan EPDK lisansları
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
            Son 3 ayda kayıtlı yeni lisans yok.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                {['Tarih', 'Şirket', 'Lisans No', 'Piyasa', 'İl', 'Durum'].map(
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
              {data.map((license) => (
                <tr key={`${license.market}-${license.lisansNo}`} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(license.baslangicTarihi)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {license.lisansSahibiUnvani ?? '—'}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {license.lisansNo}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {MARKET_LABELS[license.market] ?? license.market}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                    {license.il ?? '—'}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_BADGE_CLASS[license.lisansDurumu] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[license.lisansDurumu] ?? license.lisansDurumu}
                    </span>
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
