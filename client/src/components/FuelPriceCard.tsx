// 🔹 components/FuelPriceCard.tsx
type Props = {
  title: string
  price: number
  unit?: string
}

export default function FuelPriceCard({ title, price, unit }: Props) {
  return (
    <div className='p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors'>
      <h4 className='text-xs font-medium text-gray-500 truncate'>{title}</h4>
      <div className='mt-1 flex items-baseline'>
        <p className='text-xl font-semibold text-gray-900'>
          ₺{price.toFixed(2)}
        </p>
        {unit && (
          <span className='ml-1 text-xs text-gray-400'>{unit}</span>
        )}
      </div>
    </div>
  )
}
