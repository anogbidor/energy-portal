// client/src/components/StationCard.tsx
import type { Station } from '../hooks/useStations'

export default function StationCard({ station }: { station: Station }) {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition'>
      <h2 className='text-lg font-bold text-blue-800 mb-1'>{station.name}</h2>
      <p className='text-gray-600 text-sm'>{station.location}</p>
      <p className='text-sm text-gray-500 mt-2'>
        <span className='font-medium'>Telefon:</span> {station.phone}
      </p>
      <p className='text-sm text-gray-500'>
        <span className='font-medium'>Çalışma Saatleri:</span>{' '}
        {station.openHours}
      </p>
    </div>
  )
}
