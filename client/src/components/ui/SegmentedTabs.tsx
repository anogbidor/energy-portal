// Shared pill/segment control -- replaces several near-identical
// hand-rolled versions (License.tsx's market tabs, DistributorSummary's
// market tabs) that each used a saturated purple fill for the active
// state. This uses the more restrained "active segment floats on a
// neutral track" pattern instead -- a white pill with a soft shadow on
// a light gray track reads as calmer and more current than a solid
// brand-color fill for something as frequently-clicked as a tab.
interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export default function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={`inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type='button'
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 ${
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
