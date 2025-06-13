// 🔹 src/components/ExchangeRates.tsx
export default function ExchangeRates() {
  const rates = [
    { name: 'USD/TRY', value: 31.42, change: 0.3 },
    { name: 'EUR/TRY', value: 33.87, change: 0.5 },
    { name: 'GBP/TRY', value: 39.65, change: -0.2 },
    { name: 'BTC/USD', value: 67245, change: 1.8 },
  ]
  return (
    <div>
      <h3 className='text-lg font-semibold mt-6'>Döviz Kurları</h3>
      <ul className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-2'>
        {rates.map((r) => (
          <li
            key={r.name}
            className='bg-white p-4 border rounded shadow flex justify-between'
          >
            <span>{r.name}</span>
            <span className={r.change >= 0 ? 'text-green-600' : 'text-red-600'}>
              {r.value} ({r.change >= 0 ? '+' : ''}
              {r.change}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
 