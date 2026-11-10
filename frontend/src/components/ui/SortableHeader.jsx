import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

function SortableHeader({ label, sortKey, sort, onSort, align = 'left', as: Tag = 'th', className = '' }) {
  const active = sort?.key === sortKey
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown

  return (
    <Tag
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      className={`font-semibold ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide cursor-pointer hover:text-ink ${active ? 'text-accent' : ''} ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        {label}
        <Icon className={`h-3 w-3 ${active ? '' : 'opacity-40'}`} />
      </button>
    </Tag>
  )
}

export default SortableHeader
