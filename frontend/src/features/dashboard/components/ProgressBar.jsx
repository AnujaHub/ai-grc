const BAR_TONES = { accent: 'bg-accent', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-sky-400' }

function ProgressBar({ value, tone = 'accent', className = '' }) {
  const width = Math.max(0, Math.min(100, value))
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-line ${className}`}
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${BAR_TONES[tone]}`} style={{ width: `${width}%` }} />
    </div>
  )
}

export default ProgressBar
