import { Building2, FileCheck2, ShieldAlert, UserRound, Server, ListChecks, AlertTriangle, BadgeCheck } from 'lucide-react'
import { timeAgo } from '../utils/format'

const TYPE_ICONS = {
  organisation: Building2,
  user: UserRound,
  security: ShieldAlert,
  system: Server,
  evidence: FileCheck2,
  control: ListChecks,
  risk: AlertTriangle,
  approval: BadgeCheck,
}

function ActivityFeed({ items }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-soft">No recent activity.</p>

  return (
    <ol className="space-y-4">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] || ListChecks
        return (
          <li key={item.id} className="flex gap-3">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-paper ${item.type === 'security' ? 'text-danger' : 'text-ink-soft'}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="text-ink-soft">
                <span className="font-medium text-ink">{item.actor}</span> {item.action}{' '}
                <span className="text-ink">{item.target}</span>
              </p>
              <p className="text-xs text-ink-soft/70">{timeAgo(item.at)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default ActivityFeed
