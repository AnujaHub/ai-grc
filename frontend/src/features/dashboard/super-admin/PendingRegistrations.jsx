import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { StatusBadge } from '../../../components/ui'
import { initials, timeAgo } from '../utils/format'

function PendingRegistrations({ items }) {
  const [decisions, setDecisions] = useState({})

  const decide = (id, status) => setDecisions((current) => ({ ...current, [id]: status }))

  if (!items.length) return <p className="py-6 text-center text-sm text-ink-soft">No pending registrations.</p>

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => {
        const decision = decisions[item.id]
        return (
          <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-xs text-accent">
              {initials(item.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{item.name}</p>
              <p className="truncate text-xs text-ink-soft">
                {item.jobTitle} · {item.organisation} · {timeAgo(item.submittedAt)}
              </p>
            </div>
            {decision ? (
              <StatusBadge status={decision} />
            ) : (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => decide(item.id, 'approved')}
                  className="rounded-lg border border-accent/40 p-1.5 text-accent hover:bg-accent-soft cursor-pointer"
                  aria-label={`Approve ${item.name}`}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => decide(item.id, 'rejected')}
                  className="rounded-lg border border-danger/40 p-1.5 text-danger hover:bg-danger-soft cursor-pointer"
                  aria-label={`Reject ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default PendingRegistrations
