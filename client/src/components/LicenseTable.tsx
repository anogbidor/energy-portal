// import React from 'react'
import type { LicenseItem } from '../hooks/useLicenses'
import { STATUS_LABELS, STATUS_BADGE_CLASS } from '../lib/licenseStatus'

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null

interface LicenseTableProps {
  data: LicenseItem[]
  tableHeaders: { key: string; label: string }[]
  sortConfig: SortConfig
  onRequestSort: (key: string) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
}

export default function LicenseTable({
  data,
  tableHeaders,
  sortConfig,
  onRequestSort,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}: LicenseTableProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const goToPage = (page: number) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)))
  }

  function displayStatus(status: string) {
    const normalized = status.toUpperCase().replace(/\s+/g, '_')
    return STATUS_LABELS[normalized] || status
  }

  function badgeClass(status: string) {
    const normalized = status.toUpperCase().replace(/\s+/g, '_')
    return STATUS_BADGE_CLASS[normalized] || 'bg-gray-100 text-gray-600'
  }

  return (
    <>
      {/* Table container */}
      <div className='overflow-hidden border border-gray-200 rounded-lg'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-300'>
            <thead className='bg-gray-50'>
              <tr>
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    scope='col'
                    className='px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100'
                    onClick={() => onRequestSort(header.key)}
                  >
                    <div className='flex items-center'>
                      {header.label}
                      <span className='ml-1 text-xs'>
                        {getSortIndicator(header.key)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 bg-white'>
              {data.length > 0 ? (
                data.map((item, i) => {
                  const statusLabel = displayStatus(item.lisansDurumu)
                  const badgeColorClass = badgeClass(item.lisansDurumu)

                  return (
                    <tr
                      key={`${item.lisansNo}-${i}`}
                      className={`hover:bg-gray-50 transition-colors ${
                        i % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className='whitespace-nowrap px-2 py-2 text-xs'>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badgeColorClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className='px-2 py-2 text-xs font-medium text-gray-900 max-w-[160px] break-words'>
                        {item.lisansSahibiUnvani}
                      </td>
                      <td className='whitespace-nowrap px-2 py-2 text-xs text-gray-500'>
                        {item.lisansNo}
                      </td>
                      <td className='whitespace-nowrap px-2 py-2 text-xs text-gray-500'>
                        {item.vergiNo}
                      </td>
                      <td className='whitespace-nowrap px-2 py-2 text-xs text-gray-500'>
                        {new Date(item.baslangicTarihi).toLocaleDateString(
                          'tr-TR'
                        )}
                      </td>
                      <td className='whitespace-nowrap px-2 py-2 text-xs text-gray-500'>
                        {new Date(item.bitisTarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className='whitespace-nowrap px-2 py-2 text-xs text-gray-500'>
                        {item.il || '-'}
                      </td>
                      <td className='whitespace-nowrap px-2 py-2 text-xs text-gray-500'>
                        {item.ilce || '-'}
                      </td>
                      <td className='px-2 py-2 text-xs text-gray-500 max-w-[160px] break-words'>
                        {item.adres || '-'}
                      </td>
                      <td className='whitespace-nowrap px-2 py-2 text-xs text-gray-500'>
                        {item.iptalSonaErdirmeTarihi ? (
                          new Date(item.iptalSonaErdirmeTarihi).toLocaleDateString('tr-TR')
                        ) : (
                          <span className='text-gray-300'>-</span>
                        )}
                      </td>
                      <td className='px-2 py-2 text-xs text-gray-500 max-w-[160px] break-words'>
                        {item.iptalSonaErdimeAciklama || (
                          <span className='text-gray-300'>-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className='px-3 py-2 text-center text-xs text-gray-500'
                  >
                    Veri bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg'>
          <div className='flex-1 flex items-center justify-between'>
            <div>
              <p className='text-xs text-gray-700'>
                <span className='font-medium'>
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                -{' '}
                <span className='font-medium'>
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                / <span className='font-medium'>{totalItems}</span> kayıt
              </p>
            </div>
            <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium ${
                  currentPage === 1
                    ? 'text-gray-300'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Önceki
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                 <button
                    type='button'
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-brand-purple border-brand-purple text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium ${
                  currentPage === totalPages
                    ? 'text-gray-300'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Sonraki
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
