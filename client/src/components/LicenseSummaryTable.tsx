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
          Son {days} günde piyasa bazlı verilen lisans sayıları — bir tarihe
          tıklayarak detayları görüntüleyin
        </p>
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
                const total = MARKET_COLUMNS.reduce(
                  (sum, col) => sum + (day.counts[col.key] ?? 0),
                  0
                )
                return (
                  <tr key={day.date} className='hover:bg-gray-50'>
                    <td className='px-4 py-2.5 whitespace-nowrap text-sm text-gray-700 capitalize'>
                      {formatDate(day.date)}
                    </td>
                    {MARKET_COLUMNS.map((col) => {
                      const count = day.counts[col.key] ?? 0
                      return (
                        <td key={col.key} className='px-4 py-2.5 text-center'>
                          {count > 0 ? (
                            <Link
                              to={`/license?market=${col.key}&date=${day.date}`}
                              className='inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors'
                            >
                              {count}
                            </Link>
                          ) : (
                            <span className='text-gray-300 text-xs'>—</span>
                          )}
                        </td>
                      )
                    })}
                    <td className='px-4 py-2.5 text-center text-sm font-medium text-gray-900'>
                      {total}
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
