// src/pages/LicensesPage.tsx
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLicenses, type Market } from '../hooks/useLicenses' // Import Market type
import LicenseTable from '../components/LicenseTable'
import LoadingSpinner from '../components/LoadingSpinner'
import type { LicenseItem } from '../hooks/useLicenses'

const MARKET_TYPES: Market[] = ['petrol', 'lpg', 'dogalgaz', 'elektrik']

const TABLE_HEADERS = [
  { key: 'lisansDurumu', label: 'EPDK Lisans Durumu' },
  { key: 'lisansSahibiUnvani', label: 'Şirketi' },
  { key: 'lisansNo', label: 'Lisans No' },
  { key: 'vergiNo', label: 'Vergi No' },
  { key: 'baslangicTarihi', label: 'Başlangıç Tarihi' },
  { key: 'bitisTarihi', label: 'Bitiş Tarihi' },
  { key: 'il', label: 'İl' },
  { key: 'ilce', label: 'İlçe' },
  { key: 'adres', label: 'Adres' },
  { key: 'iptalTarihi', label: 'İptal Tarihi' },
  { key: 'iptalAciklama', label: 'İptal Açıklaması' },
]

const ITEMS_PER_PAGE = 40

function isMarket(value: string | null): value is Market {
  return !!value && (MARKET_TYPES as string[]).includes(value)
}

export default function LicensesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlMarket = searchParams.get('market')
  const urlDate = searchParams.get('date') || undefined
  const initialMarket = isMarket(urlMarket) ? urlMarket : 'lpg'

  const { data, error, loading, setMarket } = useLicenses(
    initialMarket,
    urlDate
  )
  const [activeMarket, setActiveMarket] =
    React.useState<Market>(initialMarket)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortConfig, setSortConfig] = React.useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)

  // When market changes, reset filters and pagination. The date filter (if
  // any came in via URL, e.g. drilling down from the homepage summary
  // table) stays applied so switching markets shows that same date's
  // activity in the newly selected market.
  const handleMarketChange = (market: Market) => {
    setMarket(market)
    setActiveMarket(market)
    setCurrentPage(1)
    setSearchTerm('')
    setSortConfig(null)
    const next = new URLSearchParams(searchParams)
    next.set('market', market)
    setSearchParams(next, { replace: true })
  }

  const clearDateFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('date')
    setSearchParams(next, { replace: true })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Extract sortable value from a license item for sorting
  const getSortableValue = (info: LicenseItem, key: string) => {
    switch (key) {
      case 'lisansDurumu':
        return info.lisansDurumu
      case 'lisansSahibiUnvani':
        return info.lisansSahibiUnvani
      case 'lisansNo':
        return info.lisansNo
      case 'vergiNo':
        return info.vergiNo
      case 'baslangicTarihi':
        return new Date(info.baslangicTarihi).getTime()
      case 'bitisTarihi':
        return new Date(info.bitisTarihi).getTime()
      case 'adres':
        return info.adres || ''
      case 'il':
        return info.il || ''
      case 'ilce':
        return info.ilce || ''
      case 'iptalTarihi':
        return info.iptalSonaErdirmeTarihi
          ? new Date(info.iptalSonaErdirmeTarihi).getTime()
          : 0
      case 'iptalAciklama':
        return info.iptalSonaErdimeAciklama || ''
      default:
        return ''
    }
  }

  // Filter data by search term
  const filteredData = React.useMemo(() => {
    if (!data) return []
    const searchLower = searchTerm.toLowerCase()
    return data.filter((item) => {
      return (
        item.lisansNo.toLowerCase().includes(searchLower) ||
        item.lisansSahibiUnvani.toLowerCase().includes(searchLower) ||
        item.vergiNo.toLowerCase().includes(searchLower) ||
        (item.il && item.il.toLowerCase().includes(searchLower)) ||
        (item.ilce && item.ilce.toLowerCase().includes(searchLower)) ||
        item.lisansDurumu.toLowerCase().includes(searchLower)
      )
    })
  }, [data, searchTerm])

  // Sort filtered data with default descending baslangicTarihi
  const sortedData = React.useMemo(() => {
    if (filteredData.length === 0) return filteredData

    if (!sortConfig) {
      // Default: latest baslangicTarihi first
      return [...filteredData].sort(
        (a, b) =>
          new Date(b.baslangicTarihi).getTime() -
          new Date(a.baslangicTarihi).getTime()
      )
    }

    // User-defined sorting
    return [...filteredData].sort((a, b) => {
      const aValue = getSortableValue(a, sortConfig.key)
      const bValue = getSortableValue(b, sortConfig.key)

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate sorted data
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedData.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedData, currentPage])

  const goToPage = (page: number) => {
    setCurrentPage(
      Math.max(1, Math.min(page, Math.ceil(sortedData.length / ITEMS_PER_PAGE)))
    )
  }

  return (
    <main className='bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
      <header className='mb-8 text-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Lisans Sorgulama
        </h1>
        <p className='text-gray-500 mt-1 text-sm'>
          Enerji Piyasası Düzenleme Kurumu lisans bilgileri
        </p>
      </header>

      {urlDate && (
        <div className='mb-6 flex items-center justify-center gap-3 text-sm'>
          <span className='inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 rounded-full'>
            {new Date(urlDate).toLocaleDateString('tr-TR')} tarihli lisanslar
            <button
              type='button'
              onClick={clearDateFilter}
              className='text-gray-300 hover:text-white'
              aria-label='Tarih filtresini kaldır'
            >
              ✕
            </button>
          </span>
        </div>
      )}

      <nav className='mb-8'>
        <div className='flex justify-center gap-1 bg-white border border-gray-200 p-1 rounded-full max-w-md mx-auto'>
          {MARKET_TYPES.map((market) => {
            const isSelected = activeMarket === market
            return (
              <button
                key={market}
                onClick={() => handleMarketChange(market)}
                className={`
            px-6 py-2 rounded-full text-sm font-medium
            transition-all duration-200
            ${
              isSelected
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }
            whitespace-nowrap
          `}
              >
                {market === 'dogalgaz'
                  ? 'Doğalgaz '
                  : market === 'elektrik'
                  ? 'Elektrik'
                  : market.toUpperCase()}
              </button>
            )
          })}
        </div>
      </nav>

      <section>
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
            <p className='text-sm text-red-700'>{error}</p>
          </div>
        ) : data && data.length > 0 ? (
          <>
            <div className='flex flex-col sm:flex-row justify-between gap-4 mb-4'>
              <div className='relative flex-1 max-w-md'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <input
                  type='text'
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 sm:text-sm'
                  placeholder='Arama...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label='Lisans arama'
                />
              </div>
              <div className='flex items-center text-sm text-gray-500'>
                Toplam {filteredData.length} kayıt
              </div>
            </div>

            <LicenseTable
              data={paginatedData}
              tableHeaders={TABLE_HEADERS}
              sortConfig={sortConfig}
              onRequestSort={requestSort}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={sortedData.length}
              onPageChange={goToPage}
            />
          </>
        ) : (
          <div className='text-center py-12 bg-white border border-gray-200 rounded-lg'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              Veri bulunamadı
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Seçtiğiniz piyasaya ait lisans bilgisi bulunmamaktadır.
            </p>
          </div>
        )}
      </section>
      </div>
    </main>
  )
}
