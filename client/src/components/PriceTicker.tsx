import { useLiveData } from '../hooks/useLiveData'

// A continuous scrolling strip of the same live figures already shown
// elsewhere on the site (Hero, FuelPrice, ExchangeRates all read from
// useLiveData too) -- no separate fetch, just a different presentation
// for the landing page's footer band. Doğalgaz has no price feed here
// (EPDK's bulletin services only cover petrol/LPG bayi satış fiyatı),
// so it's left out rather than shown with a fabricated number.
export default function PriceTicker() {
  const { data, loading, error } = useLiveData()

  if (loading || error || !data) return null

  const fuelItems = [...(data.fuelPrices ?? []), ...(data.lpgPrices ?? [])].map(
    (item) => ({
      label: item.yakit,
      value: `${item.fiyat.toFixed(2)} ₺/${item.olcuBirimi}`,
    })
  )

  const marketItems = [
    data.brent !== null && { label: 'Brent Petrol', value: `$${data.brent.toFixed(2)}` },
    data.usdTry !== null && { label: 'USD/TRY', value: `₺${data.usdTry.toFixed(2)}` },
    data.eurTry !== null && { label: 'EUR/TRY', value: `₺${data.eurTry.toFixed(2)}` },
    data.gbpTry !== null && { label: 'GBP/TRY', value: `₺${data.gbpTry.toFixed(2)}` },
  ].filter((x): x is { label: string; value: string } => Boolean(x))

  const items = [...fuelItems, ...marketItems]
  if (items.length === 0) return null

  // Duplicated once so the CSS animation can scroll exactly one copy's
  // width and loop seamlessly instead of jumping at the end.
  const track = [...items, ...items]

  return (
    <div className='bg-gray-950 border-t border-white/10 overflow-hidden'>
      <div className='ticker-track flex items-center gap-8 py-3 whitespace-nowrap w-max motion-reduce:animate-none'>
        {track.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className='flex items-center gap-2 text-sm shrink-0'
          >
            <span className='text-gray-400 font-medium'>{item.label}</span>
            <span className='text-white font-semibold tabular-nums'>
              {item.value}
            </span>
            <span className='text-brand-gold ml-6'>•</span>
          </div>
        ))}
      </div>
      <style>{`
        .ticker-track {
          animation: ticker-scroll 45s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
