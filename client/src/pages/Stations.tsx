import { useState, useMemo, useRef, useCallback } from 'react'
import type { Station } from '../hooks/useStations'

import {
  GoogleMap,
  Marker,
  
  useJsApiLoader,
} from '@react-google-maps/api'
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
import { Combobox } from '@headlessui/react'
import StationTable from '../components/StationTable'
import { useStations } from '../hooks/useStations'
import LoadingSpinner from '../components/LoadingSpinner'

// Define your cities here:
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
  // const [activeStation, setActiveStation] = useState<Station | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const mapRef = useRef<google.maps.Map | null>(null)


  const libraries: ('places' | 'marker')[] = ['places', 'marker'] as const
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries // added 'marker' for Marker support
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

  // Reset district when city changes
  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city)
    setSelectedDistrict(null)
    setSelectedStation(null)
    // setActiveStation(null)
  }, [])

  const {
    data: stations = [],
    loading,
    error,
  } = useStations({
    city: selectedCity,
    district: selectedDistrict || undefined,
  })

  // Districts depend on selected city
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
    // setActiveStation(station)

    // Pan to the selected station
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
    // setActiveStation(null)
    setHoveredStation(null)
  }, [])

  if (error) {
    return (
      <div className='p-6 max-w-6xl mx-auto text-center'>
        <div className='bg-red-50 text-red-600 p-4 rounded-lg inline-block max-w-md'>
          <div className='flex items-center justify-center gap-2'>
            <FiAlertCircle className='text-xl' />
            <p className='font-medium'>İstasyonlar yüklenirken hata oluştu</p>
          </div>
          <p className='mt-1 text-sm'>
            {(error as unknown as Error) instanceof Error
              ? (error as unknown as Error).message
              : String(error) || 'Bilinmeyen hata'}
          </p>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='mt-3 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto'
          >
            <FiTarget className='mr-2' />
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white min-h-screen p-4 md:p-8 max-w-auto mx-auto space-y-6'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-green-900'>
            {selectedCity} Akaryakıt İstasyonları
          </h1>
          <div className='text-green-900 mt-1'>
            {loading ? (
              <span className='inline-flex items-center'>
                <LoadingSpinner />
                Yükleniyor...
              </span>
            ) : (
              `${filteredStations.length} istasyon bulundu`
            )}
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {/* View Mode Toggle */}
          <div className='flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50'>
            <button
              type='button'
              title='Listeleme Modu'
              aria-label='Listeleme Modu'
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiList className='h-5 w-5' />
            </button>
            <button
              type='button'
              title='Kart Modu'
              aria-label='Kart Modu'
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiGrid className='h-5 w-5' />
            </button>
          </div>

          {/* Search Bar */}
          <div className='relative w-full md:w-64'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiSearch className='text-green-900' />
            </div>
            <Combobox
              value={search}
              onChange={(value) => setSearch(value ?? '')}
            >
              <input
                type='text'
                placeholder='İstasyon, ilçe veya servis ara...'
                className='w-full pl-10 pr-4 py-2 rounded-lg border text-green-900 border-gray-200 focus:ring-2 focus:ring-green-900 focus:border-green-900 outline-none transition-all bg-gray-50'
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
                  <FiX className='h-5 w-5 text-green-900 hover:text-gray-600' />
                </button>
              )}
            </Combobox>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className='bg-white p-4 rounded-xl shadow-sm'>
        <div className='flex flex-wrap gap-4 items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <span className='text-sm font-medium text-green-900 flex items-center'>
              <FiFilter className='mr-2' /> Filtrele:
            </span>
            <div className='flex items-center space-x-2'>
              <select
                title='Seçilen Şehir'
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className='text-sm text-green-900 rounded-lg border border-gray-200 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors'
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
                className='text-sm text-green-900 rounded-lg border border-gray-200 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 min-w-[150px] hover:bg-gray-100 transition-colors'
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
                  className='text-sm text-green-900 hover:text-green-900 flex items-center px-3 py-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'
                >
                  <FiX className='mr-1' /> Temizle
                </button>
              )}
            </div>
          </div>

          {/* Current Location Button */}
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
            className='text-sm text-green-900 hover:text-green-800 flex items-center px-3 py-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors ml-auto'
          >
            <FiTarget className='mr-1' /> Konumumu Bul
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className='bg-white p-4 rounded-xl shadow-sm'>
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
                  onMouseOver={() => {
                    setHoveredStation(station.id)
                    // setActiveStation(station)
                  }}
                  onMouseOut={() => {
                    setHoveredStation(null)
                    // if (!selectedStation) setActiveStation(null)
                  }}
                  onClick={() => handleStationClick(station)}
                />
              ))}

              {/* Active Station Info Window
              {activeStation && (
                <InfoWindow
                  position={{
                    lat: activeStation.coordinates.lat,
                    lng: activeStation.coordinates.lng,
                  }}
                  onCloseClick={() => {
                    setActiveStation(null)
                    setSelectedStation(null)
                  }}
                >
                  <div className='p-2 max-w-xs'>
                    <h3 className='font-bold text-lg mb-1'>
                      {activeStation.name}
                    </h3>
                    <div className='flex items-center mb-1'>
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          activeStation.brand === 'BP'
                            ? 'bg-green-500'
                            : activeStation.brand === 'Shell'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                      ></span>
                      <span className='text-gray-700'>
                        {activeStation.brand}
                      </span>
                    </div>
                    <p className='text-gray-600 text-sm mb-2'>
                      {activeStation.address}
                    </p>
                    
                    {activeStation.services && (
                      <div className='border-t pt-2 mt-2'>
                        <p className='font-medium text-gray-800'>Servisler:</p>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {activeStation.services.map((service) => (
                            <span
                              key={service}
                              className='text-xs bg-gray-100 px-2 py-1 rounded'
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )} */}
            </GoogleMap>
          ) : (
            <div className='h-full bg-gray-100 rounded-xl flex flex-col items-center justify-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4'></div>
              <p className='text-gray-500 font-medium'>Harita yükleniyor...</p>
            </div>
          )}

          {/* Station Counter Badge */}
          <div className='absolute bottom-4 right-4 bg-white  text-green-900 rounded-lg shadow-md px-3 py-2 text-sm flex items-center border border-gray-200 z-10'>
            <FiMapPin className='text-red-500 mr-2' />
            <span className='font-medium'>
              {filteredStations.length}{' '}
              {filteredStations.length === 1 ? 'istasyon' : 'istasyon'}{' '}
              gösteriliyor
            </span>
          </div>

          {/* Map Controls */}
          <div className='absolute top-4 right-4 flex flex-col space-y-2 z-10'>
            <button
              type='button'
              onClick={() => mapRef.current?.panTo(cityCenters[selectedCity])}
              className='bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors'
              title='Merkeze dön'
            >
              <FiTarget className='text-green-900' />
            </button>
            <button
              type='button'
              
              onClick={() =>
                mapRef.current?.setZoom(
                  Math.min((mapRef.current.getZoom() || 12) + 1, 18)
                )
              }
              className='bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors'
              title='Yakınlaştır'
            >
              <FiPlus className='text-green-900' />
            </button>
            <button
              type='button'
              onClick={() =>
                mapRef.current?.setZoom(
                  Math.max((mapRef.current.getZoom() || 12) - 1, 8)
                )
              }
              className='bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors'
              title='Uzaklaştır'
            >
              <FiMinus className='text-gray-700' />
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className='flex justify-center py-12 bg-white rounded-xl shadow-sm'>
          <LoadingSpinner  />
        </div>
      ) : filteredStations.length > 0 ? (
        viewMode === 'table' ? (
          <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
            <StationTable
              stations={filteredStations}
              selectedStationId={selectedStation?.id}
              onRowClick={handleStationClick}
              onRowHover={(stationId) => setHoveredStation(stationId)}
            />
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {/* Your grid cards here */}
          </div>
        )
      ) : (
        <div className='text-center py-12 bg-white rounded-xl shadow-sm'>
          <div className='max-w-md mx-auto'>
            <FiAlertCircle className='mx-auto text-gray-400 text-4xl mb-4' />
            <h3 className='text-lg font-medium text-gray-700'>
              Sonuç bulunamadı
            </h3>
            <p className='text-gray-500 mt-2'>
              Arama kriterlerinize uygun istasyon bulunamadı
            </p>
            <button
              type='button'
              onClick={clearFilters}
              className='mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto'
            >
              <FiX className='mr-2' /> Filtreleri Temizle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
