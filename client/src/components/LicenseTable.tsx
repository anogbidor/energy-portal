import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LicenseItem, Market } from '../hooks/useLicenses'
import { STATUS_LABELS, STATUS_BADGE_CLASS } from '../lib/licenseStatus'
import { prefetchLicenseDetail } from '../hooks/useLicenseDetail'
import { isTransferViewed, markTransferViewed } from '../lib/viewedTransfers'

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
  // When provided, rows link through to the license detail view (who's
  // under this distributor / this dealer's distributor history).
  market?: Market
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
  market,
}: LicenseTableProps) {
  const navigate = useNavigate()
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // localStorage doesn't trigger a re-render on its own -- this just
  // forces one immediately after a click marks a license viewed, so its
  // glow disappears right away instead of only on the next page load.
  const [, forceRerender] = useState(0)
  const markViewed = (lisansNo: string) => {
    markTransferViewed(lisansNo)
    forceRerender((n) => n + 1)
  }

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

  // Only worth flagging on an active license -- one that's since been
  // cancelled/terminated already shows a status distinct from
  // "Yürürlükte", so there's nothing to disambiguate there.
  function showsTransferMark(status: string, hasTransferred?: boolean) {
    return status.toUpperCase().replace(/\s+/g, '_') === 'ONAYLANDI' && hasTransferred
  }

  function badgeClass(status: string) {
    const normalized = status.toUpperCase().replace(/\s+/g, '_')
    return STATUS_BADGE_CLASS[normalized] || 'bg-gray-100 text-gray-600'
  }

  const MARKET_LABELS: Record<string, string> = {
    petrol: 'Petrol',
    lpg: 'LPG',
    dogalgaz: 'Doğalgaz',
    elektrik: 'Elektrik',
  }

  // Keyed by tableHeaders[].key so callers can pick any subset/order of
  // columns -- previously the body always rendered a fixed 11 columns
  // regardless of what tableHeaders declared, silently mismatching any
  // caller that passed a shorter header list.
  function renderCell(item: LicenseItem & { market?: string }, key: string) {
    switch (key) {
      case 'lisansDurumu':
        return (
          <div className='flex flex-col items-center gap-0.5'>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badgeClass(
                item.lisansDurumu
              )}`}
            >
              {displayStatus(item.lisansDurumu)}
            </span>
            {showsTransferMark(item.lisansDurumu, item.hasTransferred) && (
              <span
                className={`text-[10px] font-medium text-brand-purple rounded-full ${
                  isTransferViewed(item.lisansNo) ? '' : 'glow-pulse'
                }`}
              >
                Transfer Edildi
              </span>
            )}
          </div>
        )
      case 'lisansSahibiUnvani':
        return item.lisansSahibiUnvani
      case 'lisansNo':
        return item.lisansNo
      case 'vergiNo':
        return item.vergiNo
      case 'baslangicTarihi':
        return new Date(item.baslangicTarihi).toLocaleDateString('tr-TR')
      case 'bitisTarihi':
        return new Date(item.bitisTarihi).toLocaleDateString('tr-TR')
      case 'il':
        return item.il || '-'
      case 'ilce':
        return item.ilce || '-'
      case 'adres':
        return item.adres || '-'
      case 'market':
        return MARKET_LABELS[item.market ?? ''] ?? item.market ?? '-'
      case 'iptalTarihi':
        return item.iptalSonaErdirmeTarihi ? (
          new Date(item.iptalSonaErdirmeTarihi).toLocaleDateString('tr-TR')
        ) : (
          <span className='text-gray-300'>-</span>
        )
      case 'iptalAciklama':
        return (
          item.iptalSonaErdimeAciklama || <span className='text-gray-300'>-</span>
        )
      default:
        return '-'
    }
  }

  const WRAPPING_KEYS = new Set(['lisansSahibiUnvani', 'adres', 'iptalAciklama'])
  const NOWRAP_KEYS = new Set([
    'lisansDurumu',
    'lisansNo',
    'vergiNo',
    'baslangicTarihi',
    'bitisTarihi',
    'il',
    'ilce',
    'market',
    'iptalTarihi',
  ])

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
                data.map((item, i) => (
                  <tr
                    key={`${item.lisansNo}-${i}`}
                    onClick={
                      market
                        ? () => {
                            markViewed(item.lisansNo)
                            navigate(
                              `/license/detail?market=${
                                (item as { market?: string }).market ?? market
                              }&lisansNo=${encodeURIComponent(item.lisansNo)}`
                            )
                          }
                        : undefined
                    }
                    onMouseEnter={
                      market
                        ? () =>
                            prefetchLicenseDetail(
                              ((item as { market?: string }).market ??
                                market) as Market,
                              item.lisansNo
                            )
                        : undefined
                    }
                    className={`hover:bg-gray-50 transition-colors ${
                      market ? 'cursor-pointer' : ''
                    } ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    {tableHeaders.map((header) => (
                      <td
                        key={header.key}
                        className={`px-2 py-2 text-xs ${
                          header.key === 'lisansSahibiUnvani'
                            ? 'font-medium text-gray-900'
                            : 'text-gray-500'
                        } ${NOWRAP_KEYS.has(header.key) ? 'whitespace-nowrap' : ''} ${
                          WRAPPING_KEYS.has(header.key) ? 'max-w-[160px] break-words' : ''
                        }`}
                      >
                        {renderCell(item, header.key)}
                      </td>
                    ))}
                  </tr>
                ))
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
