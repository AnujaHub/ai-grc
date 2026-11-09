const TONES = {
  neutral: 'border-line bg-paper text-ink-soft',
  accent: 'border-accent/30 bg-accent-soft text-accent',
  warning: 'border-warning/30 bg-warning-soft text-warning',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  info: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
}

const STATUSES = {
  not_started: { label: 'Not started', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'info' },
  pending: { label: 'Pending', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'danger' },
  completed: { label: 'Completed', tone: 'accent' },
  implemented: { label: 'Implemented', tone: 'accent' },
  approved: { label: 'Approved', tone: 'accent' },
  rejected: { label: 'Rejected', tone: 'danger' },
  active: { label: 'Active', tone: 'accent' },
  trial: { label: 'Trial', tone: 'info' },
  suspended: { label: 'Suspended', tone: 'danger' },
  high: { label: 'High', tone: 'danger' },
  medium: { label: 'Medium', tone: 'warning' },
  low: { label: 'Low', tone: 'neutral' },
}

function StatusBadge({ status, label, tone }) {
  const config = STATUSES[status] || { label: status, tone: 'neutral' }
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone || config.tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label || config.label}
    </span>
  )
}

export default StatusBadge
