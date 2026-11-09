function AuthHeader({ icon: Icon, title, subtitle, tone = 'accent' }) {
  const toneClass = {
    accent: 'bg-accent-soft text-accent border-accent/30',
    warning: 'bg-warning-soft text-warning border-warning/30',
    danger: 'bg-danger-soft text-danger border-danger/30',
  }[tone]

  return (
    <div className="mb-6">
      {Icon && (
        <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${toneClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
    </div>
  )
}

export default AuthHeader
