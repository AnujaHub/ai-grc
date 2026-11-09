import { Link, useLocation } from 'react-router-dom'
import { Hourglass, Check, Clock } from 'lucide-react'
import { Button } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'

const STEPS = [
  { label: 'Registration submitted', state: 'done' },
  { label: 'Email verified', state: 'done' },
  { label: 'Administrator review', state: 'current' },
  { label: 'Account activated', state: 'todo' },
]

function ApprovalPendingPage() {
  const email = useLocation().state?.email

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          icon={Hourglass}
          tone="warning"
          title="Account awaiting approval"
          subtitle="Your registration was received. An administrator from your organisation will review it shortly."
        />

        <ol className="mb-6 space-y-0">
          {STEPS.map((step, i) => (
            <li key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-full border',
                    step.state === 'done' && 'border-accent bg-accent text-[#07111f]',
                    step.state === 'current' && 'border-warning bg-warning-soft text-warning',
                    step.state === 'todo' && 'border-line text-ink-soft',
                  ].filter(Boolean).join(' ')}
                >
                  {step.state === 'done' ? <Check className="h-3.5 w-3.5" /> : step.state === 'current' ? <Clock className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
                </span>
                {i < STEPS.length - 1 && <span className={`h-6 w-px ${step.state === 'done' ? 'bg-accent' : 'bg-line'}`} />}
              </div>
              <div className="pt-1">
                <p className={`text-sm ${step.state === 'todo' ? 'text-ink-soft' : 'text-ink'}`}>{step.label}</p>
                {step.state === 'current' && <p className="text-xs text-warning">In progress · usually within 1 business day</p>}
              </div>
            </li>
          ))}
        </ol>

        <p className="mb-6 rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink-soft">
          We&apos;ll email {email ? <span className="font-semibold text-ink">{email}</span> : 'you'} as soon as your account is approved.
        </p>

        <Link to="/">
          <Button variant="secondary" fullWidth>Back to sign in</Button>
        </Link>
      </AuthCard>
    </AuthLayout>
  )
}

export default ApprovalPendingPage
