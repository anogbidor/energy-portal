import { FiMapPin } from 'react-icons/fi'
import type { Station } from '../hooks/useStations'

interface StationTableProps {
  stations: Station[]
  selectedStationId?: string | undefined
  onRowClick?: (station: Station) => void
  onRowHover?: (stationId: string | null) => void
}

export default function StationTable({
  stations,
  selectedStationId,
  onRowClick,
  onRowHover,
}: StationTableProps) {
  return (
    <div className='overflow-x-auto rounded-lg border border-gray-200 shadow-sm'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-green-900 uppercase tracking-wider'
            >
              İstasyon
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-green-900 uppercase tracking-wider'
            >
              Konum
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-green-900 uppercase tracking-wider'
            >
              Telefon
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-green-900 uppercase tracking-wider'
            >
              Çalışma Saatleri
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-green-900 uppercase tracking-wider'
            >
              Yakıt Türleri
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-green-900 uppercase tracking-wider'
            >
              Hizmetler
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {stations.map((station) => (
            <tr
              key={station.id}
              onClick={() => onRowClick?.(station)}
              onMouseEnter={() => onRowHover?.(station.id)}
              onMouseLeave={() => onRowHover?.(null)}
              className={`cursor-pointer transition-colors ${
                selectedStationId === station.id
                  ? 'bg-green-80'
                  : 'hover:bg-green-50'
              }`}
            >
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-50 text-green-900'>
                    {station.brand.charAt(0)}
                  </div>
                  <div className='ml-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {station.name}
                    </div>
                    <div className='text-sm text-gray-500'>{station.brand}</div>
                  </div>
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center'>
                  <FiMapPin className='flex-shrink-0 mr-1.5 text-green-900' />
                  <div className='text-sm text-gray-900'>
                    {station.district}, {station.city}
                  </div>
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  {station.location}
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <a
                  href={`tel:${station.phone}`}
                  className='text-sm text-green-900 hover:underline'
                  onClick={(e) => e.stopPropagation()}
                >
                  {station.phone}
                </a>
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {station.openHours}
              </td>
              <td className='px-6 py-4'>
                <div className='flex flex-wrap gap-1'>
                  {station.fuelTypes.slice(0, 3).map((fuel) => (
                    <span
                      key={fuel}
                      className='px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full'
                    >
                      {fuel}
                    </span>
                  ))}
                  {station.fuelTypes.length > 3 && (
                    <span className='px-2 py-0.5 bg-gray-50 text-green-900 text-xs rounded-full'>
                      +{station.fuelTypes.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex flex-wrap gap-1'>
                  {station.services.slice(0, 2).map((service) => (
                    <span
                      key={service}
                      className='px-2 py-0.5 bg-green-50 text-green-900 text-xs rounded-full'
                    >
                      {service}
                    </span>
                  ))}
                  {station.services.length > 2 && (
                    <span className='px-2 py-0.5 bg-gray-50 text-green-900 text-xs rounded-full'>
                      +{station.services.length - 2}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
