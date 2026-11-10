import { ChevronLeft, ChevronRight } from 'lucide-react'

const pagesToShow = (page, count) => {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const pages = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count))
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]))
}

function Pagination({ page, pageCount, onChange, from, to, total }) {
  if (total === 0) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-ink-soft sm:flex-row">
      <span>
        Showing <span className="font-mono text-ink">{from}–{to}</span> of <span className="font-mono text-ink">{total}</span>
      </span>
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page"
            className="rounded-md border border-line p-1.5 hover:border-accent/50 hover:text-ink disabled:opacity-40 disabled:hover:border-line cursor-pointer disabled:cursor-not-allowed">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {pagesToShow(page, pageCount).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1">…</span>
            ) : (
              <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
                className={`min-w-7 rounded-md border px-2 py-1 font-mono cursor-pointer ${p === page ? 'border-accent bg-accent-soft text-accent' : 'border-line hover:border-accent/50 hover:text-ink'}`}>
                {p}
              </button>
            ),
          )}
          <button type="button" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Next page"
            className="rounded-md border border-line p-1.5 hover:border-accent/50 hover:text-ink disabled:opacity-40 disabled:hover:border-line cursor-pointer disabled:cursor-not-allowed">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}
    </div>
  )
}

export default Pagination
