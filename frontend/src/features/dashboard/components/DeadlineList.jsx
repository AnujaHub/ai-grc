import { StatusBadge } from '../../../components/ui'
import { dueLabel, dueTone, formatDate } from '../utils/format'

function DeadlineList({ items }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-soft">No upcoming deadlines.</p>

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-paper">
            <span className="font-mono text-sm font-semibold leading-none text-ink">{formatDate(item.dueDate).split(' ')[0]}</span>
            <span className="text-[10px] uppercase text-ink-soft">{formatDate(item.dueDate).split(' ')[1]}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{item.title}</p>
            <p className="text-xs text-ink-soft">
              {item.type && <span>{item.type} · </span>}
              {item.owner && <span>{item.owner} · </span>}
              <span className={dueTone(item.dueDate)}>{dueLabel(item.dueDate)}</span>
            </p>
          </div>
          {item.status && <StatusBadge status={item.status} />}
        </li>
      ))}
    </ul>
  )
}

export default DeadlineList
