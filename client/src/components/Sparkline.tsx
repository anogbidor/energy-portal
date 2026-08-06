interface SparklinePoint {
  date: string
  value: number
}

interface SparklineProps {
  data: SparklinePoint[]
  color?: string
  height?: number
  formatValue?: (value: number) => string
}

const WIDTH = 280

export default function Sparkline({
  data,
  color = '#624b99',
  height = 56,
  formatValue = (v) => v.toString(),
}: SparklineProps) {
  // History only started accumulating recently -- rather than draw a
  // misleading flat/single-point line, say so plainly until there's
  // enough to actually show a trend.
  if (data.length < 2) {
    return (
      <div
        className='flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-md'
        style={{ height }}
      >
        Geçmiş birikiyor — henüz yeterli veri yok
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padY = 6

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * WIDTH
    const y = padY + (1 - (d.value - min) / range) * (height - padY * 2)
    return { x, y }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L ${WIDTH} ${height} L 0 ${height} Z`

  const last = points[points.length - 1]
  const first = data[0]
  const lastPoint = data[data.length - 1]
  const trendUp = lastPoint.value >= first.value

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        width='100%'
        height={height}
        preserveAspectRatio='none'
        role='img'
        aria-label={`${formatValue(first.value)} ile ${formatValue(
          lastPoint.value
        )} arasında değişim`}
      >
        {/* faint horizontal grid */}
        <line
          x1='0'
          y1={height / 2}
          x2={WIDTH}
          y2={height / 2}
          stroke='currentColor'
          className='text-gray-100'
          strokeWidth='1'
        />
        <path d={areaPath} fill={color} fillOpacity='0.08' stroke='none' />
        <path d={linePath} fill='none' stroke={color} strokeWidth='1.75' />
        <circle cx={last.x} cy={last.y} r='2.5' fill={color} />
      </svg>
      <div className='flex items-center justify-between mt-1 text-[11px]'>
        <span className='text-gray-400'>{formatValue(min)}</span>
        <span className={trendUp ? 'text-red-600' : 'text-green-600'}>
          {formatValue(lastPoint.value)}
        </span>
        <span className='text-gray-400'>{formatValue(max)}</span>
      </div>
    </div>
  )
}
