import { usePriceHistory, groupByYakit } from '../hooks/usePriceHistory'
import Sparkline from './Sparkline'

// Same fuel types Hero.tsx already highlights as the headline numbers --
// keeps the trend section focused instead of dumping every EPDK fuel
// category (there are a dozen+, most niche) into one wall of charts.
const TRACKED: {
  market: 'petrol' | 'lpg'
  match: (yakit: string) => boolean
  label: string
}[] = [
  { market: 'petrol', match: (y) => y.includes('Benzin'), label: 'Benzin (95 Oktan)' },
  { market: 'petrol', match: (y) => y === 'Motorin', label: 'Motorin' },
  { market: 'lpg', match: (y) => y === 'Otogaz', label: 'Otogaz (LPG)' },
]

export default function FuelPriceTrends() {
  const petrol = usePriceHistory('petrol', 30)
  const lpg = usePriceHistory('lpg', 30)

  if (petrol.loading || lpg.loading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse h-24 rounded-xl bg-gray-100' />
        ))}
      </div>
    )
  }

  const emptyGroups: ReturnType<typeof groupByYakit> = new Map()
  const petrolGroups = petrol.data ? groupByYakit(petrol.data) : emptyGroups
  const lpgGroups = lpg.data ? groupByYakit(lpg.data) : emptyGroups

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {TRACKED.map((t) => {
        const groups = t.market === 'petrol' ? petrolGroups : lpgGroups
        const yakitKey = [...groups.keys()].find(t.match)
        const points = yakitKey
          ? groups.get(yakitKey)!.map((p) => ({ date: p.tarih, value: p.fiyat }))
          : []

        return (
          <div key={t.label} className='p-4 rounded-xl border border-gray-200 bg-white'>
            <p className='text-xs text-gray-500 mb-2'>{t.label} — son 30 gün</p>
            <Sparkline data={points} formatValue={(v) => `₺${v.toFixed(2)}`} />
          </div>
        )
      })}
    </div>
  )
}
