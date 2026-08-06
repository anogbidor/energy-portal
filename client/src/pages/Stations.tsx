import { useState, useMemo, useRef, useCallback } from 'react'
import type { Station } from '../hooks/useStations'

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import {
  FiSearch,
  FiFilter,
  FiX,
  FiList,
  FiGrid,
  FiTarget,
  FiPlus,
  FiMinus,
  FiMapPin,
  FiAlertCircle,
} from 'react-icons/fi'
import StationTable from '../components/StationTable'
import StationCard from '../components/StationCard'
import { useStations } from '../hooks/useStations'

const cities = ['İstanbul', 'Ankara', 'İzmir']

const cityCenters: Record<string, { lat: number; lng: number }> = {
  İstanbul: { lat: 41.0082, lng: 28.9784 },
  Ankara: { lat: 39.9334, lng: 32.8597 },
  İzmir: { lat: 38.4192, lng: 27.1287 },
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px',
}

export default function StationsPage() {
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul')
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [hoveredStation, setHoveredStation] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const mapRef = useRef<google.maps.Map | null>(null)

  const libraries: ('places' | 'marker')[] = ['places', 'marker'] as const
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })

  const getMarkerIcon = useCallback(
    (station: Station) => {
      if (hoveredStation === station.id || selectedStation?.id === station.id) {
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }

      const brandIcons = {
        BP: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        Shell: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        default: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      }

      return (
        brandIcons[station.brand as keyof typeof brandIcons] ||
        brandIcons.default
      )
    },
    [hoveredStation, selectedStation]
  )

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city)
    setSelectedDistrict(null)
    setSelectedStation(null)
  }, [])

  const {
    data: stations = [],
    loading,
    error,
  } = useStations({
    city: selectedCity,
    district: selectedDistrict || undefined,
  })

  const districts = useMemo(() => {
    const distSet = new Set<string>()
    stations.forEach((station) => distSet.add(station.district))
    return Array.from(distSet).sort()
  }, [stations])

  const filteredStations = useMemo(() => {
    if (!search) return stations

    const searchLower = search.toLowerCase()
    return stations.filter(
      (station) =>
        station.name.toLowerCase().includes(searchLower) ||
        station.district.toLowerCase().includes(searchLower) ||
        station.location.toLowerCase().includes(searchLower) ||
        (station.services &&
          station.services.some((s) =>
            s.toLowerCase().includes(searchLower)
          )) ||
        (station.fuelTypes &&
          station.fuelTypes.some((f) => f.toLowerCase().includes(searchLower)))
    )
  }, [stations, search])

  const handleStationClick = useCallback((station: Station) => {
    setSelectedStation(station)

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: station.coordinates.lat,
        lng: station.coordinates.lng,
      })
      mapRef.current.setZoom(16)
    }
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setSelectedDistrict(null)
    setSelectedStation(null)
    setHoveredStation(null)
  }, [])

  if (error) {
    return (
      <div className='p-6 max-w-6xl mx-auto text-center'>
        <div className='bg-white border border-gray-200 p-6 rounded-xl inline-block max-w-md'>
          <FiAlertCircle className='mx-auto text-2xl text-gray-400 mb-2' />
          <p className='font-medium text-gray-900'>
            İstasyonlar yüklenirken hata oluştu
          </p>
          <p className='mt-1 text-sm text-gray-500'>
            {(error as unknown as Error) instanceof Error
              ? (error as unknown as Error).message
              : String(error) || 'Bilinmeyen hata'}
          </p>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 text-sm text-white bg-brand-purple rounded-lg hover:bg-brand-purple-dark transition-colors'
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>
              {selectedCity} Akaryakıt İstasyonları
            </h1>
            <div className='text-sm text-gray-500 mt-1'>
              {loading ? (
                <span className='inline-block h-3.5 w-24 bg-gray-100 rounded animate-pulse' />
              ) : (
                `${filteredStations.length} istasyon bulundu`
              )}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {/* View Mode Toggle */}
            <div className='flex rounded-lg border border-gray-200 overflow-hidden'>
              <button
                type='button'
                title='Listeleme Modu'
                aria-label='Listeleme Modu'
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-brand-purple text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FiList className='h-4 w-4' />
              </button>
              <button
                type='button'
                title='Kart Modu'
                aria-label='Kart Modu'
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-purple text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FiGrid className='h-4 w-4' />
              </button>
            </div>

            {/* Search Bar */}
            <div className='relative w-full md:w-64'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiSearch className='text-gray-400' />
              </div>
              <input
                type='text'
                placeholder='İstasyon, ilçe veya servis ara...'
                className='w-full pl-10 pr-9 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all bg-white'
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                autoComplete='off'
              />
              {search && (
                <button
                  type='button'
                  aria-label='Aramayı Temizle'
                  title='Aramayı Temizle'
                  onClick={() => setSearch('')}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                >
                  <FiX className='h-4 w-4 text-gray-400 hover:text-gray-600' />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className='bg-white p-4 rounded-xl border border-gray-200'>
          <div className='flex flex-wrap gap-3 items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='text-sm text-gray-500 flex items-center'>
                <FiFilter className='mr-1.5' /> Filtrele:
              </span>
              <select
                title='Seçilen Şehir'
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className='text-sm text-gray-700 rounded-lg border border-gray-200 px-3 py-2 bg-white hover:bg-gray-50 transition-colors'
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                title='Seçilen İlçe'
                value={selectedDistrict || ''}
                onChange={(e) => setSelectedDistrict(e.target.value || null)}
                className='text-sm text-gray-700 rounded-lg border border-gray-200 px-3 py-2 bg-white min-w-[150px] hover:bg-gray-50 transition-colors'
                disabled={loading}
              >
                <option value=''>Tüm İlçeler</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>

              {(selectedDistrict || search) && (
                <button
                  type='button'
                  onClick={clearFilters}
                  className='text-sm text-gray-600 hover:text-gray-900 flex items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'
                >
                  <FiX className='mr-1' /> Temizle
                </button>
              )}
            </div>

            <button
              type='button'
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                      }
                      if (mapRef.current) {
                        mapRef.current.panTo(userLocation)
                        mapRef.current.setZoom(14)
                      }
                    },
                    (error) => {
                      alert(`Konum alınamadı: ${error.message}`)
                    }
                  )
                } else {
                  alert('Tarayıcınız konum bilgisini desteklemiyor')
                }
              }}
              className='text-sm text-gray-600 hover:text-gray-900 flex items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ml-auto'
            >
              <FiTarget className='mr-1.5' /> Konumumu Bul
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className='bg-white p-4 rounded-xl border border-gray-200'>
          <div className='relative rounded-xl overflow-hidden border border-gray-200 h-[500px]'>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={cityCenters[selectedCity]}
                zoom={selectedDistrict ? 14 : 12}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  clickableIcons: false,
                  styles: [
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }],
                    },
                    {
                      featureType: 'transit',
                      elementType: 'all',
                      stylers: [{ visibility: 'off' }],
                    },
                    {
                      featureType: 'road',
                      elementType: 'labels.icon',
                      stylers: [{ visibility: 'off' }],
                    },
                  ],
                }}
                onLoad={(map) => {
                  mapRef.current = map
                }}
              >
                {filteredStations.map((station) => (
                  <Marker
                    key={station.id}
                    position={{
                      lat: station.coordinates.lat,
                      lng: station.coordinates.lng,
                    }}
                    title={station.name}
                    icon={{
                      url: getMarkerIcon(station),
                      scaledSize: new window.google.maps.Size(32, 32),
                    }}
                    onMouseOver={() => setHoveredStation(station.id)}
                    onMouseOut={() => setHoveredStation(null)}
                    onClick={() => handleStationClick(station)}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div className='h-full bg-gray-50 rounded-xl flex flex-col items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mb-3'></div>
                <p className='text-gray-500 text-sm'>Harita yükleniyor...</p>
              </div>
            )}

            {/* Station Counter Badge */}
            <div className='absolute bottom-4 right-4 bg-white text-gray-700 rounded-lg px-3 py-2 text-sm flex items-center border border-gray-200 z-10'>
              <FiMapPin className='text-gray-400 mr-2' />
              <span className='font-medium'>
                {filteredStations.length} istasyon gösteriliyor
              </span>
            </div>

            {/* Map Controls */}
            <div className='absolute top-4 right-4 flex flex-col gap-2 z-10'>
              <button
                type='button'
                onClick={() => mapRef.current?.panTo(cityCenters[selectedCity])}
                className='bg-white p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'
                title='Merkeze dön'
              >
                <FiTarget className='text-gray-600' />
              </button>
              <button
                type='button'
                onClick={() =>
                  mapRef.current?.setZoom(
                    Math.min((mapRef.current.getZoom() || 12) + 1, 18)
                  )
                }
                className='bg-white p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'
                title='Yakınlaştır'
              >
                <FiPlus className='text-gray-600' />
              </button>
              <button
                type='button'
                onClick={() =>
                  mapRef.current?.setZoom(
                    Math.max((mapRef.current.getZoom() || 12) - 1, 8)
                  )
                }
                className='bg-white p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'
                title='Uzaklaştır'
              >
                <FiMinus className='text-gray-600' />
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className='bg-white rounded-xl border border-gray-200 p-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='h-32 rounded-lg border border-gray-100 bg-gray-50'
                />
              ))}
            </div>
          </div>
        ) : filteredStations.length > 0 ? (
          viewMode === 'table' ? (
            <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
              <StationTable
                stations={filteredStations}
                selectedStationId={selectedStation?.id}
                onRowClick={handleStationClick}
                onRowHover={(stationId) => setHoveredStation(stationId)}
              />
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  selected={selectedStation?.id === station.id}
                  onClick={handleStationClick}
                  onHover={setHoveredStation}
                />
              ))}
            </div>
          )
        ) : (
          <div className='text-center py-12 bg-white rounded-xl border border-gray-200'>
            <div className='max-w-md mx-auto'>
              <FiAlertCircle className='mx-auto text-gray-400 text-3xl mb-3' />
              <h3 className='text-sm font-medium text-gray-900'>
                Sonuç bulunamadı
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                Arama kriterlerinize uygun istasyon bulunamadı
              </p>
              <button
                type='button'
                onClick={clearFilters}
                className='mt-4 px-4 py-2 text-sm bg-brand-purple text-white rounded-lg hover:bg-brand-purple-dark transition-colors'
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
