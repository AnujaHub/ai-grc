import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

const STYLES = {
  error: { box: 'bg-danger-soft border-danger/30 text-danger', Icon: AlertCircle },
  success: { box: 'bg-accent-soft border-accent/30 text-accent', Icon: CheckCircle2 },
  warning: { box: 'bg-warning-soft border-warning/30 text-warning', Icon: AlertTriangle },
  info: { box: 'bg-paper border-line text-ink-soft', Icon: Info },
}

function Alert({ variant = 'info', children, className = '' }) {
  const { box, Icon } = STYLES[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${box} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

export default Alert
