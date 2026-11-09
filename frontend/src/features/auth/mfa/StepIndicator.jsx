import { Check } from 'lucide-react'

function StepIndicator({ steps, current }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={[
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                done ? 'border-accent bg-accent text-[#07111f]' : '',
                active ? 'border-accent text-accent' : '',
                !done && !active ? 'border-line text-ink-soft' : '',
              ].join(' ')}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`hidden text-xs sm:inline ${active ? 'text-ink' : 'text-ink-soft'}`}>{label}</span>
            {i < steps.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-accent' : 'bg-line'}`} />}
          </li>
        )
      })}
    </ol>
  )
}

export default StepIndicator
