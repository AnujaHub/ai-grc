import { useMemo, useState } from 'react'

const compare = (a, b) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export default function useTable(rows, { pageSize = 10, initialSort = null, getValue = (row, key) => row[key] } = {}) {
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => compare(getValue(a, sort.key), getValue(b, sort.key)) * factor)
  }, [rows, sort, getValue])

  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize

  const onSort = (key) => {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
    setPage(1)
  }

  return {
    rows: sorted.slice(start, start + pageSize),
    sort,
    onSort,
    pagination: {
      page: current,
      pageCount,
      total,
      from: total ? start + 1 : 0,
      to: Math.min(start + pageSize, total),
      onChange: setPage,
    },
    resetPage: () => setPage(1),
  }
}
