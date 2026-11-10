import { Link } from 'react-router-dom'
import { displayStatus } from './planData'

const BAR_COLORS = {
  completed: 'bg-accent',
  in_progress: 'bg-sky-400',
  in_review: 'bg-warning',
  blocked: 'bg-danger',
  overdue: 'bg-danger',
  not_started: 'bg-ink-soft/50',
}

function PlanTimeline({ plan, milestones, tasks }) {
  const start = new Date(plan.startDate).getTime()
  const end = new Date(plan.endDate).getTime()
  const span = end - start
  const pos = (iso) => Math.max(0, Math.min(100, ((new Date(iso).getTime() - start) / span) * 100))
  const today = pos(new Date().toISOString())

  const months = []
  const cursor = new Date(start)
  cursor.setDate(1)
  while (cursor.getTime() <= end) {
    months.push({ label: cursor.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), left: pos(cursor.toISOString()) })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
      <div className="min-w-[960px]">
        <div className="grid grid-cols-[16rem_1fr] border-b border-line">
          <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Milestone / task</div>
          <div className="relative h-10">
            {months.map((m) => (
              <span key={m.label} className="absolute top-0 flex h-full items-center border-l border-line pl-2 font-mono text-[11px] text-ink-soft" style={{ left: `${m.left}%` }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {milestones.map((m) => {
          const related = tasks.filter((t) => t.milestoneId === m.id)
          return (
            <div key={m.id} className="border-b border-line last:border-0">
              <div className="grid grid-cols-[16rem_1fr] bg-paper/40">
                <div className="truncate px-5 py-2.5 text-sm font-semibold text-ink">{m.title}</div>
                <div className="relative">
                  <span className="absolute inset-y-0 w-px bg-accent/60" style={{ left: `${today}%` }} />
                  <span
                    title={`${m.title} · ${new Date(m.dueDate).toLocaleDateString('en-GB')}`}
                    className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 ${m.status === 'completed' ? 'bg-accent' : m.status === 'overdue' ? 'bg-danger' : 'border-2 border-sky-300 bg-paper-dark'}`}
                    style={{ left: `${pos(m.dueDate)}%` }}
                  />
                </div>
              </div>
              {related.map((t) => {
                const status = displayStatus(t)
                const left = pos(t.startDate)
                const width = Math.max(1.2, pos(t.dueDate) - left)
                return (
                  <div key={t.id} className="grid grid-cols-[16rem_1fr] hover:bg-paper">
                    <Link to={`/grc-plan/tasks/${t.id}`} className="truncate py-2 pl-9 pr-3 text-xs text-ink-soft hover:text-accent">
                      <span className="font-mono">{t.id}</span> {t.title}
                    </Link>
                    <div className="relative">
                      <span className="absolute inset-y-0 w-px bg-accent/60" style={{ left: `${today}%` }} />
                      <Link
                        to={`/grc-plan/tasks/${t.id}`}
                        title={`${t.title} · ${t.progress}%`}
                        className="absolute top-1/2 h-4 -translate-y-1/2 overflow-hidden rounded border border-line bg-paper hover:border-accent/60"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <span className={`block h-full ${BAR_COLORS[status]}`} style={{ width: `${Math.max(t.progress, status === 'not_started' ? 100 : 8)}%`, opacity: status === 'not_started' ? 0.35 : 1 }} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3 text-xs text-ink-soft">
        {[['bg-accent', 'Completed'], ['bg-sky-400', 'In progress'], ['bg-warning', 'In review'], ['bg-danger', 'Overdue / blocked'], ['bg-ink-soft/50', 'Not started']].map(([c, l]) => (
          <span key={l} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-4 rounded-sm ${c}`} />{l}</span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-px bg-accent" />Today</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 border-2 border-sky-300" />Milestone</span>
      </div>
    </div>
  )
}

export default PlanTimeline
