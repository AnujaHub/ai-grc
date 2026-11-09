import { StatusBadge } from '../../../components/ui'

const SEGMENT_COLORS = {
  not_started: 'bg-ink-soft/40',
  in_progress: 'bg-sky-400',
  pending: 'bg-warning',
  overdue: 'bg-danger',
  completed: 'bg-accent',
}

function TaskOverview({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-2xl font-semibold text-ink">{total}</span>
        <span className="text-xs text-ink-soft">tasks in total</span>
      </div>
      <div className="mb-5 flex h-2.5 w-full overflow-hidden rounded-full bg-line">
        {data.map((item) => (
          <div key={item.status} className={SEGMENT_COLORS[item.status]} style={{ width: `${(item.count / total) * 100}%` }} />
        ))}
      </div>
      <ul className="space-y-2.5">
        {data.map((item) => (
          <li key={item.status} className="flex items-center justify-between">
            <StatusBadge status={item.status} />
            <span className="font-mono text-sm text-ink">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TaskOverview
