import { useState } from 'react'
import { FileCheck2, ScrollText, UserPlus, ShieldAlert, Lock } from 'lucide-react'
import { StatusBadge } from '../../../components/ui'
import { timeAgo } from '../utils/format'

const TYPE_ICONS = {
  Evidence: FileCheck2,
  Policy: ScrollText,
  Registration: UserPlus,
  'Risk acceptance': ShieldAlert,
}

function ApprovalQueue({ items, currentUserName }) {
  const [decisions, setDecisions] = useState({})
  const decide = (id, status) => setDecisions((current) => ({ ...current, [id]: status }))

  if (!items.length) return <p className="py-6 text-center text-sm text-ink-soft">Nothing waiting for approval.</p>

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] || FileCheck2
        const decision = decisions[item.id]
        const ownRequest = Boolean(currentUserName) && item.requestedBy === currentUserName
        return (
          <li key={item.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-ink-soft">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{item.title}</p>
                <p className="text-xs text-ink-soft">
                  {item.type} · {item.requestedBy} · {timeAgo(item.submittedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-11 sm:pl-0">
              {decision ? (
                <StatusBadge status={decision} />
              ) : ownRequest ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft"
                  title="Segregation of duties: you cannot approve your own request"
                >
                  <Lock className="h-3.5 w-3.5" /> Your request · needs another approver
                </span>
              ) : (
                <>
                  <StatusBadge status={item.priority} />
                  <button type="button" onClick={() => decide(item.id, 'rejected')}
                    className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-soft hover:border-danger/50 hover:text-danger cursor-pointer">
                    Reject
                  </button>
                  <button type="button" onClick={() => decide(item.id, 'approved')}
                    className="rounded-lg border border-accent/40 bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-[#07111f] cursor-pointer">
                    Approve
                  </button>
                </>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default ApprovalQueue
