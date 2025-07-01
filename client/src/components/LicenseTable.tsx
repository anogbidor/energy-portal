// import React from 'react'
import type { LicenseItem } from '../hooks/useLicenses'

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

  return (
    <>
      {/* Table container */}
      <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-300'>
            <thead className='bg-gray-50'>
              <tr>
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    scope='col'
                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                    onClick={() => onRequestSort(header.key)}
                  >
                    <div className='flex items-center'>
                      {header.label}
                      <span className='ml-1'>
                        {getSortIndicator(header.key)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {data.length > 0 ? (
                data.map((item, i) => {
                  const info = item.lisansGenelBilgi
                  return (
                    <tr
                      key={`${info.lisansNo}-${i}`}
                      className='hover:bg-gray-50'
                    >
                      <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            info.lisansDurumu === 'Aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {info.lisansDurumu}
                        </span>
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-500'>
                        {info.lisansSahibiUnvani}
                      </td>
                      <td className='whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900'>
                        {info.lisansNo}
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-500'>
                        {info.lisansSahibiUnvani}
                      </td>
                      <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                        {info.vergiNo}
                      </td>
                      <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                        {new Date(info.baslangicTarihi).toLocaleDateString(
                          'tr-TR'
                        )}
                      </td>
                      <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                        {new Date(info.bitisTarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-500'>
                        {info.adres?.mahalleCaddeSokak || '-'}
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-500'>
                        {info.adres?.il || '-'}
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-500'>
                        {info.adres?.ilce || '-'}
                      </td>
                      <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                        {info.iptalTarihi ? (
                          new Date(info.iptalTarihi).toLocaleDateString('tr-TR')
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className='px-4 py-4 text-center text-sm text-gray-500'
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
        <div className='flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg'>
          <div className='flex-1 flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
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
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
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
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
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
