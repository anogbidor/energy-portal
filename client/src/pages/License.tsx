// src/pages/LicensesPage.tsx
import React from 'react'
import { useLicenses } from '../hooks/useLicenses'
import LicenseTable from '../components/LicenseTable'
import LoadingSpinner from '../components/LoadingSpinner' // Import the LoadingSpinner component
import type { LicenseItem } from '../hooks/useLicenses'

type MarketType = 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'

const MARKET_TYPES: MarketType[] = ['petrol', 'lpg', 'dogalgaz', 'elektrik']
const TABLE_HEADERS = [
  { key: 'lisansDurumu', label: 'EPDK Lisans Durumu' },
  { key: 'lisansSahibiUnvani', label: 'Şirketi' },
  { key: 'lisansNo', label: 'Lisans No' },
  { key: 'unvan', label: 'Unvan' },
  { key: 'vergiNo', label: 'Vergi No' },
  { key: 'baslangicTarihi', label: 'Başlangıç Tarihi' },
  { key: 'bitisTarihi', label: 'Bitiş Tarihi' },
  { key: 'adres', label: 'Adres' },
  { key: 'il', label: 'İl' },
  { key: 'ilce', label: 'İlçe' },
  { key: 'iptalTarihi', label: 'İptal Tarihi' },
]

const ITEMS_PER_PAGE = 10

export default function LicensesPage() {
  const { data, error, loading, setMarket } = useLicenses('lpg')
  const [activeMarket, setActiveMarket] = React.useState<MarketType>('lpg')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortConfig, setSortConfig] = React.useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)

  const handleMarketChange = (market: MarketType) => {
    setMarket(market)
    setActiveMarket(market)
    setCurrentPage(1)
    setSearchTerm('')
    setSortConfig(null)
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

  const getSortableValue = (
    info: LicenseItem['lisansGenelBilgi'],
    key: string
  ) => {
    switch (key) {
      case 'lisansDurumu':
        return info.lisansDurumu
      case 'lisansSahibiUnvani':
      case 'unvan':
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
        return info.adres?.mahalleCaddeSokak || ''
      case 'il':
        return info.adres?.il || ''
      case 'ilce':
        return info.adres?.ilce || ''
      case 'iptalTarihi':
        return info.iptalTarihi ? new Date(info.iptalTarihi).getTime() : 0
      default:
        return ''
    }
  }

  const filteredData = React.useMemo(() => {
    if (!data?.return) return []
    const searchLower = searchTerm.toLowerCase()
    return data.return.filter((item) => {
      const info = item.lisansGenelBilgi
      return (
        info.lisansNo.toLowerCase().includes(searchLower) ||
        info.lisansSahibiUnvani.toLowerCase().includes(searchLower) ||
        info.vergiNo.toLowerCase().includes(searchLower) ||
        (info.adres?.il && info.adres.il.toLowerCase().includes(searchLower)) ||
        (info.adres?.ilce &&
          info.adres.ilce.toLowerCase().includes(searchLower)) ||
        info.lisansDurumu.toLowerCase().includes(searchLower)
      )
    })
  }, [data, searchTerm])

  const sortedData = React.useMemo(() => {
    if (!sortConfig || filteredData.length === 0) return filteredData
    return [...filteredData].sort((a, b) => {
      const aValue = getSortableValue(a.lisansGenelBilgi, sortConfig.key)
      const bValue = getSortableValue(b.lisansGenelBilgi, sortConfig.key)
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

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
    <main className='bg-white p-5 font-sans max-w-auto mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl text-center font-bold text-green-900'>Lisans Sorgulama</h1>
        <p className='text-green-900 mt-1 text-center'>
          Enerji Piyasası Düzenleme Kurumu lisans bilgileri
        </p>
      </header>

      <nav className='flex gap-2 mb-6 flex-wrap' role='tablist'>
        {MARKET_TYPES.map((market) => {
          const isSelected = activeMarket === market
          return (
            <div
              key={market}
              onClick={() => handleMarketChange(market)}
              className={`px-4 py-2 rounded-md border font-medium cursor-pointer transition-all ${
                isSelected
                  ? 'bg-green-900 text-white border-blue-600'
                  : 'border-gray-300 text-green-900 hover:bg-gray-100'
              }`}
              role='tab'
            >
              {market.toUpperCase()}
            </div>
          )
        })}
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
        ) : data ? (
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
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Arama...'
                  value={searchTerm}
                  onChange={handleSearchChange}
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
          <div className='text-center py-12 bg-gray-50 rounded-lg'>
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
    </main>
  )
}
