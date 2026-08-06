import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useLicenseDetail } from '../hooks/useLicenseDetail'
import type { Market } from '../hooks/useLicenses'
import LoadingSpinner from '../components/LoadingSpinner'
import LicenseTable from '../components/LicenseTable'
import { STATUS_LABELS, STATUS_BADGE_CLASS } from '../lib/licenseStatus'

const NETWORK_HEADERS = [
  { key: 'lisansDurumu', label: 'Durum' },
  { key: 'lisansSahibiUnvani', label: 'Şirketi' },
  { key: 'lisansNo', label: 'Lisans No' },
  { key: 'il', label: 'İl' },
  { key: 'ilce', label: 'İlçe' },
]

const ITEMS_PER_PAGE = 40

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('tr-TR')
}

export default function LicenseDetail() {
  const [searchParams] = useSearchParams()
  const market = searchParams.get('market') as Market | null
  const lisansNo = searchParams.get('lisansNo')
  const [networkPage, setNetworkPage] = useState(1)
  const { data, loading, error } = useLicenseDetail(
    market ?? undefined,
    lisansNo ?? undefined,
    networkPage
  )

  if (!market || !lisansNo) {
    return (
      <main className='bg-gray-50 min-h-screen py-16 text-center text-gray-500'>
        Geçersiz bağlantı.
      </main>
    )
  }

  return (
    <main className='bg-gray-50 min-h-screen'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-10'>
        <Link
          to={`/license?market=${market}`}
          className='text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-6'
        >
          ← Lisans listesine dön
        </Link>

        {loading ? (
          <div className='flex justify-center py-16'>
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700'>
            {error}
          </div>
        ) : data ? (
          <>
            <div className='bg-white border border-gray-200 rounded-xl p-6 mb-6'>
              <div className='flex items-start justify-between gap-4 flex-wrap'>
                <div>
                  <h1 className='text-xl font-semibold text-gray-900'>
                    {data.license.lisansSahibiUnvani}
                  </h1>
                  <p className='text-sm text-gray-500 mt-1'>
                    {data.license.lisansNo} ·{' '}
                    {data.license.licenseType === 'dagitici'
                      ? 'Dağıtıcı'
                      : 'Bayi'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    STATUS_BADGE_CLASS[data.license.lisansDurumu] ??
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {STATUS_LABELS[data.license.lisansDurumu] ??
                    data.license.lisansDurumu}
                </span>
              </div>

              <dl className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm'>
                <div>
                  <dt className='text-gray-500 text-xs'>Vergi No</dt>
                  <dd className='text-gray-900 mt-0.5'>{data.license.vergiNo}</dd>
                </div>
                <div>
                  <dt className='text-gray-500 text-xs'>Başlangıç Tarihi</dt>
                  <dd className='text-gray-900 mt-0.5'>
                    {formatDate(data.license.baslangicTarihi)}
                  </dd>
                </div>
                <div>
                  <dt className='text-gray-500 text-xs'>Bitiş Tarihi</dt>
                  <dd className='text-gray-900 mt-0.5'>
                    {formatDate(data.license.bitisTarihi)}
                  </dd>
                </div>
                <div>
                  <dt className='text-gray-500 text-xs'>İl / İlçe</dt>
                  <dd className='text-gray-900 mt-0.5'>
                    {data.license.il ?? '—'} / {data.license.ilce ?? '—'}
                  </dd>
                </div>
                {data.license.adres && (
                  <div className='col-span-2 sm:col-span-4'>
                    <dt className='text-gray-500 text-xs'>Adres</dt>
                    <dd className='text-gray-900 mt-0.5'>{data.license.adres}</dd>
                  </div>
                )}
                {data.license.dagitimSirketi && (
                  <div>
                    <dt className='text-gray-500 text-xs'>Mevcut Dağıtıcı</dt>
                    <dd className='text-gray-900 mt-0.5'>
                      {data.license.dagitimSirketi}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {data.network !== null && (
              <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h2 className='text-sm font-semibold text-gray-900'>
                    Bağlı Bayiler ({data.networkCount})
                  </h2>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Bu dağıtıcı adına kayıtlı bayilik lisansları
                  </p>
                </div>
                {(data.networkCount ?? 0) === 0 ? (
                  <p className='p-6 text-sm text-gray-500'>
                    Bu dağıtıcıya bağlı bayi bulunamadı.
                  </p>
                ) : (
                  <div className='p-4'>
                    <LicenseTable
                      data={data.network}
                      tableHeaders={NETWORK_HEADERS}
                      sortConfig={null}
                      onRequestSort={() => {}}
                      currentPage={networkPage}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={data.networkCount ?? 0}
                      onPageChange={setNetworkPage}
                      market={market}
                    />
                  </div>
                )}
              </div>
            )}

            {data.history !== null && (
              <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h2 className='text-sm font-semibold text-gray-900'>
                    Dağıtıcı Geçmişi
                  </h2>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Bu bayinin bağlı olduğu dağıtıcı değişiklikleri, en eskiden
                    yeniye
                  </p>
                </div>
                {data.history.length === 0 ? (
                  <p className='p-6 text-sm text-gray-500'>
                    Henüz kayıtlı bir dağıtıcı değişikliği yok
                    {data.license.dagitimSirketi
                      ? ` — şu an ${data.license.dagitimSirketi} altında.`
                      : '.'}
                  </p>
                ) : (
                  <ol className='p-6 space-y-4'>
                    {data.history.map((event, i) => (
                      <li key={i} className='flex items-start gap-3 text-sm'>
                        <span className='w-2 h-2 mt-1.5 rounded-full bg-indigo-600 flex-shrink-0' />
                        <div>
                          <p className='text-gray-900'>
                            {event.fromDistributor ?? 'Bilinmiyor'}
                            {' → '}
                            <span className='font-medium'>
                              {event.toDistributor ?? 'Bilinmiyor'}
                            </span>
                          </p>
                          <p className='text-xs text-gray-500 mt-0.5'>
                            {formatDate(event.effectiveAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  )
}
