import { Upload, Eye } from 'lucide-react'
import { dueLabel, dueTone } from '../utils/format'

function EvidenceRequests({ items, onUpload, readOnly = false }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-soft">No evidence requested from you.</p>

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-line bg-paper p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-ink">
                <span className="mr-1.5 font-mono text-xs text-accent">{item.control}</span>
                {item.controlName}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">{item.note}</p>
            </div>
            {readOnly ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-soft">
                <Eye className="h-3.5 w-3.5" /> View only
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onUpload?.(item)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-soft px-2.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-[#07111f] cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" /> Upload
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Requested by {item.requestedBy} · <span className={dueTone(item.dueDate)}>{dueLabel(item.dueDate)}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}

export default EvidenceRequests
