import { Check, X } from 'lucide-react'
import { PASSWORD_RULES } from '../utils/validation'

const LEVELS = [
  { label: 'Too weak', color: 'bg-danger' },
  { label: 'Weak', color: 'bg-danger' },
  { label: 'Fair', color: 'bg-warning' },
  { label: 'Good', color: 'bg-warning' },
  { label: 'Strong', color: 'bg-accent' },
]

function PasswordStrength({ password }) {
  if (!password) return null

  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length
  const level = LEVELS[passed]

  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {PASSWORD_RULES.map((rule, i) => (
            <span
              key={rule.id}
              className={`h-1 flex-1 rounded-full ${i < passed ? level.color : 'bg-line'}`}
            />
          ))}
        </div>
        <span className="w-16 text-right text-xs text-ink-soft">{level.label}</span>
      </div>

      <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password)
          return (
            <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-accent' : 'text-ink-soft'}`}>
              {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PasswordStrength
