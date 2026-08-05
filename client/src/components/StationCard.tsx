import { FiMapPin, FiPhone } from 'react-icons/fi'
import type { Station } from '../hooks/useStations'

interface StationCardProps {
  station: Station
  selected?: boolean
  onClick?: (station: Station) => void
  onHover?: (stationId: string | null) => void
}

export default function StationCard({
  station,
  selected,
  onClick,
  onHover,
}: StationCardProps) {
  return (
    <button
      type='button'
      onClick={() => onClick?.(station)}
      onMouseEnter={() => onHover?.(station.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`text-left p-4 rounded-xl border transition-colors ${
        selected ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className='flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-sm font-medium'>
          {station.brand.charAt(0)}
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-gray-900 truncate'>
            {station.name}
          </p>
          <p className='text-xs text-gray-500'>{station.brand}</p>
        </div>
      </div>

      <div className='mt-3 flex items-start gap-1.5 text-sm text-gray-600'>
        <FiMapPin className='flex-shrink-0 mt-0.5 text-gray-400' />
        <span>
          {station.location}, {station.district}
        </span>
      </div>

      <div className='mt-1.5 flex items-center gap-1.5 text-sm text-gray-600'>
        <FiPhone className='flex-shrink-0 text-gray-400' />
        {station.phone}
      </div>

      <div className='mt-3 flex flex-wrap gap-1'>
        {station.fuelTypes.slice(0, 3).map((fuel) => (
          <span
            key={fuel}
            className='px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'
          >
            {fuel}
          </span>
        ))}
      </div>
    </button>
  )
}
