// src/pages/LicensesPage.tsx
import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLicenses, type Market } from '../hooks/useLicenses' // Import Market type
import LicenseTable from '../components/LicenseTable'
import LoadingSpinner from '../components/LoadingSpinner'
import type { LicenseItem } from '../hooks/useLicenses'
import { STATUS_LABELS } from '../lib/licenseStatus'
import { fetchNetworkCount } from '../hooks/useLicenseDetail'

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

// Separate labeled fields instead of one fuzzy search box, matching
// EPDK's own query-by-field convention -- most visitors won't discover
// that clicking a column header sorts/filters, but a labeled input is
// self-explanatory.
const FILTER_FIELDS: { key: FilterKey; label: string; placeholder: string }[] = [
  { key: 'lisansNo', label: 'Lisans No', placeholder: 'BAY/939-82/...' },
  { key: 'unvan', label: 'Şirket / Unvan', placeholder: 'Şirket adı' },
  { key: 'vergiNo', label: 'Vergi No', placeholder: 'Vergi no' },
  { key: 'il', label: 'İl', placeholder: 'İl' },
]

type FilterKey = 'lisansNo' | 'unvan' | 'vergiNo' | 'il'
type Filters = Record<FilterKey, string> & { durum: string }

const EMPTY_FILTERS: Filters = {
  lisansNo: '',
  unvan: '',
  vergiNo: '',
  il: '',
  durum: '',
}

function isMarket(value: string | null): value is Market {
  return !!value && (MARKET_TYPES as string[]).includes(value)
}

export default function LicensesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlMarket = searchParams.get('market')
  const urlDate = searchParams.get('date') || undefined
  const initialMarket = isMarket(urlMarket) ? urlMarket : 'petrol'

  const { data, error, loading, setMarket } = useLicenses(
    initialMarket,
    urlDate
  )
  const [activeMarket, setActiveMarket] =
    React.useState<Market>(initialMarket)
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS)
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
    setFilters(EMPTY_FILTERS)
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

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  // When the Lisans No filter exactly matches a distributor already
  // loaded in this market's dataset, show how many dealers are under
  // them as soon as the match happens -- without this, "type a
  // distributor's number" wouldn't surface their dealer network at all,
  // since the page only loads dagitici (distributor) records by default
  // and dealer data lives in a separate, much larger table.
  const matchedDistributor = React.useMemo(() => {
    const query = filters.lisansNo.trim()
    if (!query || !data) return null
    return data.find((item) => item.lisansNo === query) ?? null
  }, [filters.lisansNo, data])

  const [networkCount, setNetworkCount] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!matchedDistributor) {
      setNetworkCount(null)
      return
    }
    let cancelled = false
    fetchNetworkCount(activeMarket, matchedDistributor.lisansNo).then((count) => {
      if (!cancelled) setNetworkCount(count)
    })
    return () => {
      cancelled = true
    }
  }, [matchedDistributor, activeMarket])

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

  // Filter data -- each filled-in field narrows independently (AND),
  // unlike the old single fuzzy search box that OR'd everything together.
  const filteredData = React.useMemo(() => {
    if (!data) return []
    const lisansNo = filters.lisansNo.trim().toLowerCase()
    const unvan = filters.unvan.trim().toLowerCase()
    const vergiNo = filters.vergiNo.trim().toLowerCase()
    const il = filters.il.trim().toLowerCase()
    const durum = filters.durum

    return data.filter((item) => {
      if (lisansNo && !item.lisansNo.toLowerCase().includes(lisansNo))
        return false
      if (unvan && !item.lisansSahibiUnvani.toLowerCase().includes(unvan))
        return false
      if (vergiNo && !item.vergiNo.toLowerCase().includes(vergiNo))
        return false
      if (il && !(item.il ?? '').toLowerCase().includes(il)) return false
      if (durum && item.lisansDurumu !== durum) return false
      return true
    })
  }, [data, filters])

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
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 py-10'>
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
          <span className='inline-flex items-center gap-2 bg-brand-purple text-white px-4 py-1.5 rounded-full'>
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
                ? 'bg-brand-purple text-white'
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
            <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
                {FILTER_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={`filter-${field.key}`}
                      className='block text-xs font-medium text-gray-500 mb-1'
                    >
                      {field.label}
                    </label>
                    <input
                      id={`filter-${field.key}`}
                      type='text'
                      className='block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                      placeholder={field.placeholder}
                      value={filters[field.key]}
                      onChange={(e) =>
                        handleFilterChange(field.key, e.target.value)
                      }
                    />
                  </div>
                ))}
                <div>
                  <label
                    htmlFor='filter-durum'
                    className='block text-xs font-medium text-gray-500 mb-1'
                  >
                    Durum
                  </label>
                  <select
                    id='filter-durum'
                    className='block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                    value={filters.durum}
                    onChange={(e) =>
                      handleFilterChange('durum', e.target.value)
                    }
                  >
                    <option value=''>Tümü</option>
                    {Object.entries(STATUS_LABELS)
                      .filter(([key]) => key !== 'UNVAN_DEGISIKLIGI' && key !== 'TRANSFER_EDILDI')
                      .map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-100'>
                <span className='text-sm text-gray-500'>
                  Toplam {filteredData.length} kayıt
                </span>
                {hasActiveFilters && (
                  <button
                    type='button'
                    onClick={clearFilters}
                    className='text-sm font-medium text-brand-purple hover:text-brand-purple-dark'
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </div>

            {matchedDistributor && (
              <div className='bg-brand-purple/5 border border-brand-purple/20 rounded-lg p-4 mb-4 flex items-center justify-between flex-wrap gap-3'>
                <div className='text-sm'>
                  <span className='font-medium text-gray-900'>
                    {matchedDistributor.lisansSahibiUnvani}
                  </span>{' '}
                  <span className='text-gray-500'>
                    {networkCount === null
                      ? '— bayi sayısı yükleniyor...'
                      : `— bu dağıtıcıya bağlı ${networkCount} bayi bulundu`}
                  </span>
                </div>
                <Link
                  to={`/license/detail?market=${activeMarket}&lisansNo=${encodeURIComponent(
                    matchedDistributor.lisansNo
                  )}`}
                  className='text-sm font-medium text-brand-purple hover:text-brand-purple-dark whitespace-nowrap'
                >
                  Tüm bayileri görüntüle →
                </Link>
              </div>
            )}

            <LicenseTable
              data={paginatedData}
              tableHeaders={TABLE_HEADERS}
              sortConfig={sortConfig}
              onRequestSort={requestSort}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={sortedData.length}
              onPageChange={goToPage}
              market={activeMarket}
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
