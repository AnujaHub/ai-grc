import { initials } from '../utils/format'

function TeamWorkload({ members }) {
  const max = Math.max(...members.map((m) => m.assignedControls), 1)

  return (
    <ul className="space-y-4">
      {members.map((member) => (
        <li key={member.id} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-xs text-accent">
            {initials(member.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm text-ink">{member.name}</p>
              <p className="shrink-0 text-xs text-ink-soft">
                <span className="font-mono text-ink">{member.assignedControls}</span> controls ·{' '}
                <span className="font-mono text-ink">{member.openTasks}</span> tasks
                {member.overdue > 0 && <span className="text-danger"> · {member.overdue} overdue</span>}
              </p>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-sky-400" style={{ width: `${(member.assignedControls / max) * 100}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">{member.role}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default TeamWorkload
