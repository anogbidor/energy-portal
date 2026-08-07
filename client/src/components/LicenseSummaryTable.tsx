import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLicenseSummary } from '../hooks/useLicenseSummary'
import { STATUS_LABELS, STATUS_PILL_CLASS } from '../lib/licenseStatus'

const MARKET_COLUMNS: { key: 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'; label: string }[] = [
  { key: 'petrol', label: 'Petrol' },
  { key: 'lpg', label: 'LPG' },
  { key: 'dogalgaz', label: 'Doğalgaz' },
  { key: 'elektrik', label: 'Elektrik' },
]

// Every non-active status the calendar can show, always listed in the
// legend regardless of whether the current window happens to contain
// one -- a fixed key is easier to learn than one that reshuffles week
// to week.
const ALL_STATUSES = [
  'IPTAL_EDILDI',
  'SONLANDIRILDI',
  'IADE_EDILDI',
  'FAALIYETI_GECICI_DURDURULDU',
  'UNVAN_DEGISIKLIGI',
  'TRANSFER_EDILDI',
] as const

const INITIAL_DAYS = 14
const DAYS_STEP = 14
const MAX_DAYS = 60
const ISSUED_PILL_CLASS = 'bg-green-600 text-white hover:bg-green-700'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  })
}

function statusPillClass(status: string) {
  return STATUS_PILL_CLASS[status] || 'bg-slate-500 text-white hover:bg-slate-600'
}

export default function LicenseSummaryTable() {
  const [days, setDays] = useState(INITIAL_DAYS)
  const { data, loading, error } = useLicenseSummary(days)

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='px-5 py-3 border-b border-gray-200'>
        <h2 className='text-sm font-semibold text-gray-900'>Lisans Takvimi</h2>
        <p className='text-xs text-gray-500 mt-0.5'>
          Son {days} günde piyasa bazlı lisans durum değişiklikleri — bir
          tarihe tıklayarak detayları görüntüleyin
        </p>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-gray-500'>
          <span className='inline-flex items-center gap-1'>
            <span className='w-1.5 h-1.5 rounded-full bg-green-600' /> Yürürlükte
          </span>
          {ALL_STATUSES.map((status) => (
            <span key={status} className='inline-flex items-center gap-1'>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  statusPillClass(status).split(' ')[0]
                }`}
              />
              {STATUS_LABELS[status] || status}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='p-5 space-y-2'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='h-9 bg-gray-100 rounded animate-pulse' />
          ))}
        </div>
      ) : error ? (
        <p className='p-5 text-sm text-gray-500'>Veri yüklenemedi</p>
      ) : !data || data.length === 0 ? (
        <div className='p-8 text-center'>
          <p className='text-sm text-gray-500'>
            Son 14 günde kayıtlı yeni lisans yok.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead>
              <tr>
                <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                  Tarih
                </th>
                {MARKET_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className='px-2 py-2 text-center text-xs font-medium text-gray-500'
                  >
                    {col.label}
                  </th>
                ))}
                <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                  Toplam
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {data.map((day) => {
                const totalIssued = MARKET_COLUMNS.reduce(
                  (sum, col) => sum + (day.counts[col.key]?.issued ?? 0),
                  0
                )
                const totalOther = MARKET_COLUMNS.reduce(
                  (sum, col) =>
                    sum +
                    Object.values(day.counts[col.key]?.statuses ?? {}).reduce(
                      (a, b) => a + b,
                      0
                    ),
                  0
                )
                return (
                  <tr key={day.date} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 whitespace-nowrap text-xs text-gray-700 capitalize'>
                      {formatDate(day.date)}
                    </td>
                    {MARKET_COLUMNS.map((col) => {
                      const activity = day.counts[col.key] ?? {
                        issued: 0,
                        statuses: {},
                      }
                      const statusEntries = Object.entries(activity.statuses)
                      if (activity.issued === 0 && statusEntries.length === 0) {
                        return (
                          <td key={col.key} className='px-2 py-1.5 text-center'>
                            <span className='text-gray-300 text-xs'>—</span>
                          </td>
                        )
                      }
                      return (
                        <td key={col.key} className='px-1.5 py-1.5'>
                          <div className='flex items-center justify-center gap-0.5 flex-wrap'>
                            {activity.issued > 0 && (
                              <Link
                                to={`/license?market=${col.key}&date=${day.date}`}
                                className={`inline-flex items-center justify-center min-w-[1.5rem] px-1 py-0.5 rounded-full text-[10px] font-medium transition-colors ${ISSUED_PILL_CLASS}`}
                                title='Yürürlükteki lisanslar'
                              >
                                +{activity.issued}
                              </Link>
                            )}
                            {statusEntries.map(([status, count]) => (
                              <Link
                                key={status}
                                to={`/license?market=${col.key}&date=${day.date}`}
                                className={`inline-flex items-center justify-center min-w-[1.5rem] px-1 py-0.5 rounded-full text-[10px] font-medium transition-colors ${statusPillClass(
                                  status
                                )}`}
                                title={STATUS_LABELS[status] || status}
                              >
                                -{count}
                              </Link>
                            ))}
                          </div>
                        </td>
                      )
                    })}
                    <td className='px-3 py-2 text-center text-xs font-medium text-gray-900 whitespace-nowrap'>
                      {totalIssued > 0 && (
                        <span className='text-green-700'>+{totalIssued}</span>
                      )}
                      {totalIssued > 0 && totalOther > 0 && ' / '}
                      {totalOther > 0 && (
                        <span className='text-gray-600'>-{totalOther}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {days < MAX_DAYS && (
            <div className='px-5 py-3 border-t border-gray-100 text-center'>
              <button
                type='button'
                onClick={() =>
                  setDays((d) => Math.min(d + DAYS_STEP, MAX_DAYS))
                }
                disabled={loading}
                className='text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors'
              >
                Daha fazla göster
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
