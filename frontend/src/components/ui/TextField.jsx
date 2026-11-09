import { useId } from 'react'

function TextField({ label, error, hint, icon: Icon, rightSlot, className = '', id, ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  const messageId = `${inputId}-message`

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={[
            'w-full border py-2.5 text-sm text-ink outline-none',
            Icon ? 'pl-9' : 'pl-3',
            rightSlot ? 'pr-10' : 'pr-3',
            error ? 'border-danger focus:border-danger' : 'border-line focus:border-accent',
          ].join(' ')}
          {...props}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>

      {error ? (
        <p id={messageId} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default TextField
