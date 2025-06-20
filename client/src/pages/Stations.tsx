// client/src/pages/Stations.tsx
import { useStations } from '../hooks/useStations'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useState } from 'react'
import StationCard from '../components/StationCard'

const containerStyle = {
  width: '100%',
  height: '400px',
}

const center = {
  lat: 39.92, // Default: Ankara
  lng: 32.854,
}

export default function StationsPage() {
  const { data: stations, loading } = useStations()
  const [search, setSearch] = useState('')

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string, // ✅ FIXED for Vite
  })

  const filteredStations = stations.filter(
    (s) =>
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='p-6 max-w-6xl mx-auto space-y-6'>
      <h1 className='text-3xl font-bold text-gray-800'>İstasyonlar</h1>

      {/* Search Bar */}
      <input
        type='text'
        placeholder='Şehir veya ilçe ara...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='w-full p-3 rounded border border-gray-300'
      />

      {/* Map */}
      {isLoaded && (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6}>
          {filteredStations.map((station) => (
            <Marker
              key={station.id}
              position={{
                lat: station.coordinates.lat,
                lng: station.coordinates.lng,
              }}
              title={station.name}
            />
          ))}
        </GoogleMap>
      )}

      {/* Station Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredStations.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>
    </div>
  )
}
