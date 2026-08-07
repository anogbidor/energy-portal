import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLicenseDetail, type HistoryEvent } from '../hooks/useLicenseDetail'
import { useNetworkHistory } from '../hooks/useNetworkHistory'
import type { Market } from '../hooks/useLicenses'
import LicenseTable from '../components/LicenseTable'
import Sparkline from '../components/Sparkline'
import { STATUS_LABELS, STATUS_BADGE_CLASS } from '../lib/licenseStatus'

const NETWORK_HEADERS = [
  { key: 'lisansDurumu', label: 'Durum' },
  { key: 'lisansSahibiUnvani', label: 'Unvan' },
  { key: 'lisansNo', label: 'Lisans No' },
  { key: 'il', label: 'İl' },
  { key: 'ilce', label: 'İlçe' },
]

const RELATED_HEADERS = [
  { key: 'lisansDurumu', label: 'Durum' },
  { key: 'market', label: 'Piyasa' },
  { key: 'dagitimSirketi', label: 'Şirket' },
  { key: 'lisansSahibiUnvani', label: 'Unvan' },
  { key: 'lisansNo', label: 'Lisans No' },
  { key: 'il', label: 'İl' },
]

const ITEMS_PER_PAGE = 40

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('tr-TR')
}

function statusLabel(value: unknown): string {
  if (typeof value !== 'string') return 'Bilinmiyor'
  return STATUS_LABELS[value] ?? value
}

type EventDescription = {
  heading: string
  dotClass: string
  change?: { from: string; to: string }
}

function describeEvent(event: HistoryEvent): EventDescription {
  switch (event.eventType) {
    case 'issued':
      return { heading: 'Lisans verildi', dotClass: 'bg-green-600' }
    case 'status_changed':
      return {
        heading: 'Durum değişti',
        dotClass: 'bg-amber-500',
        change: {
          from: statusLabel(event.oldValue?.lisans_durumu),
          to: statusLabel(event.newValue?.lisans_durumu),
        },
      }
    case 'unvan_changed':
      return {
        heading: 'Unvan değişti',
        dotClass: 'bg-sky-500',
        change: {
          from: String(event.oldValue?.lisans_sahibi_unvani ?? 'Bilinmiyor'),
          to: String(event.newValue?.lisans_sahibi_unvani ?? 'Bilinmiyor'),
        },
      }
    case 'distributor_changed':
      return {
        heading: 'Dağıtıcı değişti (Transfer)',
        dotClass: 'bg-indigo-600',
        change: {
          from: String(event.oldValue?.dagitim_sirketi ?? 'Bilinmiyor'),
          to: String(event.newValue?.dagitim_sirketi ?? 'Bilinmiyor'),
        },
      }
    default:
      return { heading: 'Diğer güncelleme', dotClass: 'bg-gray-400' }
  }
}

// Old/new values are rendered as labeled rows instead of a single
// "A → B" string -- company names in particular can run 80+ characters
// (Turkish AŞ/Ltd. naming conventions), where a flat inline arrow
// string reads as one confusing run-on rather than two clearly
// separated values.
function EventChange({ from, to }: { from: string; to: string }) {
  return (
    <div className='mt-2 space-y-1 text-xs'>
      <div className='flex gap-2'>
        <span className='w-14 flex-shrink-0 text-[10px] font-medium text-gray-400 uppercase tracking-wide pt-0.5'>
          Önceki
        </span>
        <span className='text-gray-500 line-through decoration-gray-300'>
          {from}
        </span>
      </div>
      <div className='flex gap-2'>
        <span className='w-14 flex-shrink-0 text-[10px] font-medium text-gray-400 uppercase tracking-wide pt-0.5'>
          Yeni
        </span>
        <span className='text-gray-900 font-medium'>{to}</span>
      </div>
    </div>
  )
}

export default function LicenseDetail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const market = searchParams.get('market') as Market | null
  const lisansNo = searchParams.get('lisansNo')
  const [networkPage, setNetworkPage] = useState(1)
  const { data, loading, error } = useLicenseDetail(
    market ?? undefined,
    lisansNo ?? undefined,
    networkPage
  )
  // Harmless to call unconditionally even for a bayilik record (React's
  // rules of hooks require it) -- there just won't be any snapshot rows
  // for a lisansNo that was never a distributor.
  const { data: networkHistory } = useNetworkHistory(
    market ?? undefined,
    lisansNo ?? undefined
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
        <button
          type='button'
          onClick={() =>
            // Real back navigation -- preserves whatever filters/date
            // the user actually arrived with (e.g. a takvim link's
            // ?date=), instead of always landing on the plain
            // unfiltered list. Falls back to the list page only when
            // there's no history to go back to (a direct/shared URL).
            window.history.length > 1
              ? navigate(-1)
              : navigate(`/license?market=${market}`)
          }
          className='text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-6'
        >
          ← Lisans listesine dön
        </button>

        {loading ? (
          <div className='animate-pulse'>
            <div className='bg-white border border-gray-200 rounded-xl p-6 mb-6'>
              <div className='flex items-start justify-between gap-4'>
                <div className='space-y-2'>
                  <div className='h-5 w-64 bg-gray-200 rounded' />
                  <div className='h-3 w-40 bg-gray-100 rounded' />
                </div>
                <div className='h-6 w-24 bg-gray-200 rounded-full' />
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6'>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='space-y-1.5'>
                    <div className='h-2.5 w-16 bg-gray-100 rounded' />
                    <div className='h-3.5 w-24 bg-gray-200 rounded' />
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-white border border-gray-200 rounded-xl p-6 space-y-3'>
              <div className='h-4 w-40 bg-gray-200 rounded' />
              {[...Array(3)].map((_, i) => (
                <div key={i} className='h-3 w-full bg-gray-100 rounded' />
              ))}
            </div>
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
                {data.license.iptalSonaErdirmeTarihi && (
                  <div>
                    <dt className='text-gray-500 text-xs'>İptal/Sona Erme Tarihi</dt>
                    <dd className='text-gray-900 mt-0.5'>
                      {formatDate(data.license.iptalSonaErdirmeTarihi)}
                    </dd>
                  </div>
                )}
                {data.license.iptalSonaErdimeAciklama && (
                  <div className='col-span-2 sm:col-span-4'>
                    <dt className='text-gray-500 text-xs'>İptal Açıklaması</dt>
                    <dd className='text-gray-900 mt-0.5'>
                      {data.license.iptalSonaErdimeAciklama}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {data.network !== null && (
              <div className='bg-white border border-gray-200 rounded-xl p-6 mb-6'>
                <h2 className='text-sm font-semibold text-gray-900'>
                  Ağ Büyüklüğü
                </h2>
                <p className='text-xs text-gray-500 mt-0.5 mb-4'>
                  Aktif bayi sayısı, son 90 gün
                </p>
                <Sparkline
                  data={
                    networkHistory?.map((row) => ({
                      date: row.snapshot_date,
                      value: row.active_dealer_count,
                    })) ?? []
                  }
                  color='#624b99'
                  formatValue={(v) => Math.round(v).toLocaleString('tr-TR')}
                />
              </div>
            )}

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
              <div className='bg-white border border-gray-200 rounded-xl overflow-hidden mb-6'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h2 className='text-sm font-semibold text-gray-900'>
                    Değişiklik Geçmişi
                  </h2>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Bu lisansta tespit edilen tüm değişiklikler, en yeniden
                    eskiye
                  </p>
                </div>
                {data.history.length === 0 ? (
                  <p className='p-6 text-sm text-gray-500'>
                    Henüz kayıtlı bir değişiklik yok.
                  </p>
                ) : (
                  <ol className='p-6 space-y-4'>
                    {[...data.history]
                      .reverse()
                      .map((event, i) => {
                        const { heading, dotClass, change } = describeEvent(event)
                        return (
                          <li key={i} className='flex items-start gap-3 text-sm'>
                            <span
                              className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${dotClass}`}
                            />
                            <div className='flex-1 min-w-0'>
                              <p className='text-gray-900 font-medium'>{heading}</p>
                              {change && (
                                <EventChange from={change.from} to={change.to} />
                              )}
                              {event.note && (
                                <p className='text-xs text-gray-500 mt-1.5'>
                                  {event.note}
                                </p>
                              )}
                              <p className='text-xs text-gray-400 mt-1.5'>
                                {formatDate(event.effectiveAt)}
                              </p>
                            </div>
                          </li>
                        )
                      })}
                  </ol>
                )}
              </div>
            )}

            {data.relatedLicenses !== null && (
              <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h2 className='text-sm font-semibold text-gray-900'>
                    Aynı Vergi No'ya Kayıtlı Diğer Lisanslar (
                    {data.relatedLicensesCount})
                  </h2>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Bu vergi kimlik numarasına bağlı, tüm piyasalardaki diğer
                    lisanslar
                  </p>
                </div>
                {data.relatedLicenses.length === 0 ? (
                  <p className='p-6 text-sm text-gray-500'>
                    Bu vergi numarasına kayıtlı başka lisans bulunamadı.
                  </p>
                ) : (
                  <div className='p-4'>
                    <LicenseTable
                      data={data.relatedLicenses}
                      tableHeaders={RELATED_HEADERS}
                      sortConfig={null}
                      onRequestSort={() => {}}
                      currentPage={1}
                      itemsPerPage={data.relatedLicenses.length}
                      totalItems={data.relatedLicenses.length}
                      onPageChange={() => {}}
                      market={market}
                    />
                    {(data.relatedLicensesCount ?? 0) > data.relatedLicenses.length && (
                      <p className='text-xs text-gray-400 mt-2'>
                        İlk {data.relatedLicenses.length} kayıt gösteriliyor,
                        toplam {data.relatedLicensesCount}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  )
}
