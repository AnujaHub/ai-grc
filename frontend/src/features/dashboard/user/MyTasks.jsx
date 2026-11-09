import { useState } from 'react'
import { Check } from 'lucide-react'
import { StatusBadge } from '../../../components/ui'
import { dueLabel, dueTone } from '../utils/format'

const FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Done' },
]

function MyTasks({ tasks, readOnly = false }) {
  const [items, setItems] = useState(tasks)
  const [filter, setFilter] = useState('open')

  const toggle = (id) =>
    setItems((current) =>
      current.map((task) =>
        task.id === id ? { ...task, status: task.status === 'completed' ? 'in_progress' : 'completed' } : task,
      ),
    )

  const visible = items.filter((task) =>
    filter === 'all' ? true : filter === 'completed' ? task.status === 'completed' : task.status !== 'completed',
  )

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-line bg-paper p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-md px-3 py-1 text-xs font-medium cursor-pointer ${filter === f.id ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:text-ink'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">
          {filter === 'completed' ? 'No completed tasks yet.' : 'All caught up — no open tasks.'}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((task) => {
            const done = task.status === 'completed'
            return (
              <li key={task.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggle(task.id)}
                  aria-label={done ? 'Mark as not done' : 'Mark as done'}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border cursor-pointer ${done ? 'border-accent bg-accent text-[#07111f]' : 'border-line hover:border-accent'} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line`}
                >
                  {done && <Check className="h-3.5 w-3.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${done ? 'text-ink-soft line-through' : 'text-ink'}`}>{task.title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Control <span className="font-mono">{task.control}</span> ·{' '}
                    <span className={done ? '' : dueTone(task.dueDate)}>{done ? 'Completed' : dueLabel(task.dueDate)}</span>
                  </p>
                </div>
                <div className="hidden shrink-0 gap-1.5 sm:flex">
                  <StatusBadge status={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default MyTasks
