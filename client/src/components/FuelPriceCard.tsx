// 🔹 components/FuelPriceCard.tsx
import type { ComponentType, SVGProps } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'

type Props = {
  title: string
  price: number
  change?: number
  icon?: ComponentType<SVGProps<SVGSVGElement>> // Proper type for SVG components
  unit?: string
}

export default function FuelPriceCard({
  title,
  price,
  change,
  icon: IconComponent, // Destructured with alias
  unit,
}: Props) {
  const isPositive = change && change > 0

  return (
    <div className='group p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200 hover:border-blue-200'>
      <div className='flex items-start justify-between'>
        <div>
          <h4 className='text-sm font-medium text-gray-500'>{title}</h4>
          <div className='mt-1 flex items-baseline'>
            <p className='text-2xl font-bold text-gray-900'>
              ₺{price.toFixed(2)}
            </p>
            {unit && (
              <span className='ml-1.5 text-sm font-medium text-gray-400'>
                {unit}
              </span>
            )}
          </div>
        </div>

        {IconComponent && (
          <div className='p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors'>
            <IconComponent className='h-6 w-6' />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div
          className={`mt-3 inline-flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full ${
            isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {isPositive ? (
            <ArrowUpIcon className='mr-1 h-3.5 w-3.5 text-green-500' />
          ) : (
            <ArrowDownIcon className='mr-1 h-3.5 w-3.5 text-red-500' />
          )}
          <span className='font-semibold'>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  )
}
