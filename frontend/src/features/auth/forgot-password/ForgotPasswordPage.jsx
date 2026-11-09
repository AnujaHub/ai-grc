import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Mail, MailCheck, ArrowLeft } from 'lucide-react'
import { Button, TextField } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import { isValidEmail } from '../utils/validation'
import { requestPasswordReset } from '../services/authMockService'

const BackToLogin = () => (
  <Link to="/" className="inline-flex items-center gap-1.5 text-accent hover:underline">
    <ArrowLeft className="h-4 w-4" /> Back to sign in
  </Link>
)

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) return setError('Enter a valid email address.')
    setError('')
    setLoading(true)
    await requestPasswordReset(email)
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout>
        <AuthCard footer={<BackToLogin />}>
          <AuthHeader
            icon={MailCheck}
            title="Check your email"
            subtitle={
              <>
                If an account exists for <span className="font-semibold text-ink">{email}</span>, you&apos;ll
                receive a link to reset your password. The link expires in 30 minutes.
              </>
            }
          />
          <div className="space-y-3">
            <Button variant="secondary" fullWidth onClick={() => setSent(false)}>
              Use a different email
            </Button>
            <Link to="/reset-password?token=demo" className="block text-center font-mono text-[11px] text-ink-soft/70 hover:text-accent">
              Demo: open reset link →
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard footer={<BackToLogin />}>
        <AuthHeader
          icon={KeyRound}
          title="Forgot your password?"
          subtitle="Enter your work email and we'll send you a reset link."
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextField label="Email address" type="email" icon={Mail} autoComplete="email" placeholder="you@company.com"
            value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} error={error} />
          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Sending link…' : 'Send reset link'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
