import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLicenseSummary } from '../hooks/useLicenseSummary'

const MARKET_COLUMNS: { key: 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'; label: string }[] = [
  { key: 'petrol', label: 'Petrol' },
  { key: 'lpg', label: 'LPG' },
  { key: 'dogalgaz', label: 'Doğalgaz' },
  { key: 'elektrik', label: 'Elektrik' },
]

const INITIAL_DAYS = 14
const DAYS_STEP = 14
const MAX_DAYS = 60

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  })
}

export default function LicenseSummaryTable() {
  const [days, setDays] = useState(INITIAL_DAYS)
  const { data, loading, error } = useLicenseSummary(days)

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='px-5 py-4 border-b border-gray-200'>
        <h2 className='text-sm font-semibold text-gray-900'>Lisans Takvimi</h2>
        <p className='text-xs text-gray-500 mt-0.5'>
          Son {days} günde piyasa bazlı verilen ve iptal edilen lisans
          sayıları — bir tarihe tıklayarak detayları görüntüleyin
        </p>
        <div className='flex items-center gap-3 mt-2 text-[11px] text-gray-500'>
          <span className='inline-flex items-center gap-1'>
            <span className='w-2 h-2 rounded-full bg-green-500' /> Verilen
          </span>
          <span className='inline-flex items-center gap-1'>
            <span className='w-2 h-2 rounded-full bg-red-500' /> İptal Edilen
          </span>
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
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>
                  Tarih
                </th>
                {MARKET_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className='px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wide'
                  >
                    {col.label}
                  </th>
                ))}
                <th className='px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wide'>
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
                const totalCancelled = MARKET_COLUMNS.reduce(
                  (sum, col) => sum + (day.counts[col.key]?.cancelled ?? 0),
                  0
                )
                return (
                  <tr key={day.date} className='hover:bg-gray-50'>
                    <td className='px-4 py-2.5 whitespace-nowrap text-sm text-gray-700 capitalize'>
                      {formatDate(day.date)}
                    </td>
                    {MARKET_COLUMNS.map((col) => {
                      const { issued, cancelled } = day.counts[col.key] ?? {
                        issued: 0,
                        cancelled: 0,
                      }
                      if (issued === 0 && cancelled === 0) {
                        return (
                          <td key={col.key} className='px-4 py-2.5 text-center'>
                            <span className='text-gray-300 text-xs'>—</span>
                          </td>
                        )
                      }
                      return (
                        <td key={col.key} className='px-4 py-2.5'>
                          <div className='flex items-center justify-center gap-1'>
                            {issued > 0 && (
                              <Link
                                to={`/license?market=${col.key}&date=${day.date}`}
                                className='inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors'
                                title='Verilen lisanslar'
                              >
                                +{issued}
                              </Link>
                            )}
                            {cancelled > 0 && (
                              <Link
                                to={`/license?market=${col.key}&date=${day.date}`}
                                className='inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors'
                                title='İptal edilen lisanslar'
                              >
                                -{cancelled}
                              </Link>
                            )}
                          </div>
                        </td>
                      )
                    })}
                    <td className='px-4 py-2.5 text-center text-sm font-medium text-gray-900 whitespace-nowrap'>
                      {totalIssued > 0 && (
                        <span className='text-green-700'>+{totalIssued}</span>
                      )}
                      {totalIssued > 0 && totalCancelled > 0 && ' / '}
                      {totalCancelled > 0 && (
                        <span className='text-red-700'>-{totalCancelled}</span>
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
