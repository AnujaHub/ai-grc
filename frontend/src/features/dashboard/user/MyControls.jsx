import { StatusBadge } from '../../../components/ui'
import ProgressBar from '../components/ProgressBar'

const toneFor = (status) => (status === 'implemented' ? 'accent' : status === 'overdue' ? 'danger' : 'info')

function MyControls({ controls }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {controls.map((control) => (
        <div key={control.id} className="rounded-lg border border-line bg-paper p-4 hover:border-accent/40">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-accent">Control {control.code}</span>
            <StatusBadge status={control.status} />
          </div>
          <p className="text-sm font-medium text-ink">{control.name}</p>
          <p className="mb-3 truncate text-xs text-ink-soft">{control.domain}</p>
          <div className="flex items-center gap-2">
            <ProgressBar value={control.progress} tone={toneFor(control.status)} />
            <span className="w-9 text-right font-mono text-xs text-ink">{control.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MyControls
