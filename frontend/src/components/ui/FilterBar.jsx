import { Search, X } from 'lucide-react'

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border border-line py-2 pl-9 pr-8 text-sm text-ink outline-none focus:border-accent"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-soft hover:text-ink cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function SelectFilter({ label, value, onChange, options, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={`border border-line py-2 pl-3 pr-8 text-sm text-ink outline-none focus:border-accent cursor-pointer ${className}`}
    >
      <option value="">{label}: All</option>
      {options.map((option) => {
        const { value: v, label: l } = typeof option === 'string' ? { value: option, label: option } : option
        return (
          <option key={v} value={v}>
            {l}
          </option>
        )
      })}
    </select>
  )
}

function FilterBar({ children, resultCount, onReset, showReset }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper-dark p-3 lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        {resultCount !== undefined && <span>{resultCount} results</span>}
        {showReset && (
          <button type="button" onClick={onReset} className="font-medium text-accent hover:underline cursor-pointer">
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterBar
