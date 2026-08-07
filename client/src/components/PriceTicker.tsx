import {
  CurrencyDollarIcon,
  CurrencyEuroIcon,
  CurrencyPoundIcon,
} from '@heroicons/react/24/outline'
import { useLiveData } from '../hooks/useLiveData'

// Heroicons has no literal gas-pump or oil-barrel glyph, so these two
// are hand-drawn in the same 24x24 outline style (stroke=currentColor,
// round joins) as the Heroicons set used everywhere else on the site,
// so they sit naturally next to CurrencyDollarIcon etc. below.
function FuelPumpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <rect x='4' y='7' width='9' height='14' rx='1' />
      <line x1='4' y1='11' x2='13' y2='11' />
      <path d='M13 9h2.5a2 2 0 0 1 2 2v6.5a1.5 1.5 0 0 0 3 0V9.8a1.5 1.5 0 0 0-.44-1.06L18 6.5' />
      <line x1='7' y1='3' x2='10' y2='3' />
    </svg>
  )
}

function OilBarrelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <rect x='6' y='4' width='12' height='16' rx='2' />
      <line x1='6' y1='9.5' x2='18' y2='9.5' />
      <line x1='6' y1='14.5' x2='18' y2='14.5' />
    </svg>
  )
}

type TickerKind = 'fuel' | 'brent' | 'usd' | 'eur' | 'gbp'

const ICONS: Record<TickerKind, (props: React.SVGProps<SVGSVGElement>) => JSX.Element> = {
  fuel: FuelPumpIcon,
  brent: OilBarrelIcon,
  usd: CurrencyDollarIcon,
  eur: CurrencyEuroIcon,
  gbp: CurrencyPoundIcon,
}

// A continuous scrolling strip of the same live figures already shown
// elsewhere on the site (Hero, FuelPrice, ExchangeRates all read from
// useLiveData too) -- no separate fetch, just a different presentation
// running along the bottom edge of the hero band. Doğalgaz has no price
// feed here (EPDK's bulletin services only cover petrol/LPG bayi satış
// fiyatı), so it's left out rather than shown with a fabricated number.
export default function PriceTicker() {
  const { data, loading, error } = useLiveData()

  if (loading || error || !data) return null

  const fuelItems = [...(data.fuelPrices ?? []), ...(data.lpgPrices ?? [])].map(
    (item) => ({
      kind: 'fuel' as TickerKind,
      label: item.yakit,
      value: `${item.fiyat.toFixed(2)} ₺/${item.olcuBirimi}`,
    })
  )

  const marketItems = [
    data.brent !== null && {
      kind: 'brent' as TickerKind,
      label: 'Brent Petrol',
      value: `$${data.brent.toFixed(2)}`,
    },
    data.usdTry !== null && {
      kind: 'usd' as TickerKind,
      label: 'USD/TRY',
      value: `₺${data.usdTry.toFixed(2)}`,
    },
    data.eurTry !== null && {
      kind: 'eur' as TickerKind,
      label: 'EUR/TRY',
      value: `₺${data.eurTry.toFixed(2)}`,
    },
    data.gbpTry !== null && {
      kind: 'gbp' as TickerKind,
      label: 'GBP/TRY',
      value: `₺${data.gbpTry.toFixed(2)}`,
    },
  ].filter(
    (x): x is { kind: TickerKind; label: string; value: string } => Boolean(x)
  )

  const items = [...fuelItems, ...marketItems]
  if (items.length === 0) return null

  // Duplicated once so the CSS animation can scroll exactly one copy's
  // width and loop seamlessly instead of jumping at the end.
  const track = [...items, ...items]

  return (
    <div className='bg-gray-950 overflow-hidden'>
      <div className='ticker-track flex items-center gap-8 py-3 whitespace-nowrap w-max motion-reduce:animate-none'>
        {track.map((item, i) => {
          const Icon = ICONS[item.kind]
          return (
            <div
              key={`${item.label}-${i}`}
              className='flex items-center gap-2 text-sm shrink-0'
            >
              <Icon className='h-4 w-4 text-brand-gold shrink-0' />
              <span className='text-gray-400 font-medium'>{item.label}</span>
              <span className='text-white font-semibold tabular-nums'>
                {item.value}
              </span>
              <span className='text-brand-gold ml-6'>•</span>
            </div>
          )
        })}
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
