import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MailCheck, Clock } from 'lucide-react'
import { Alert, Button } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import OtpInput from '../components/OtpInput'
import useCountdown, { formatSeconds } from './useCountdown'
import { resendVerificationEmail, verifyEmail } from '../../../services/authService'

const EXPIRY_SECONDS = 600
const RESEND_COOLDOWN = 60

function VerifyOtpPage() {
  const navigate = useNavigate()
  const email = useLocation().state?.email || 'you@company.com'

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const expiry = useCountdown(EXPIRY_SECONDS)
  const cooldown = useCountdown(RESEND_COOLDOWN)

  const handleVerify = async (e) => {
    e.preventDefault()
    setInfo('')
    if (code.length < 6) return setError('Enter the 6-digit code.')
    setError('')
    setLoading(true)
    try {
      await verifyEmail(email, code)
      navigate('/', {
        replace: true,
        state: { notice: 'Email verified. You can now sign in.' },
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    setInfo('')
    try {
      await resendVerificationEmail(email)
      setCode('')
      setInfo('If this address still needs verification, a new code will be sent.')
      expiry.restart()
      cooldown.restart()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not resend the code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        footer={
          <Link to="/register" className="text-accent hover:underline">
            Wrong email? Go back
          </Link>
        }
      >
        <AuthHeader
          icon={MailCheck}
          title="Verify your email"
          subtitle={
            <>
              We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.
            </>
          }
        />

        <form onSubmit={handleVerify} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}
          {info && <Alert variant="success">{info}</Alert>}
          {expiry.isDone && <Alert variant="warning">This code has expired. Request a new one.</Alert>}

          <OtpInput value={code} onChange={(v) => { setCode(v); setError('') }}
            error={Boolean(error)} disabled={expiry.isDone || loading} />

          <p className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Clock className="h-3.5 w-3.5" />
            {expiry.isDone ? 'Code expired' : <>Code expires in <span className="font-mono text-ink">{formatSeconds(expiry.remaining)}</span></>}
          </p>

          <Button type="submit" fullWidth loading={loading} disabled={expiry.isDone}>
            {loading ? 'Verifying…' : 'Verify email'}
          </Button>

          <div className="text-center text-sm text-ink-soft">
            Didn&apos;t get the code?{' '}
            {cooldown.isDone ? (
              <button type="button" onClick={handleResend} disabled={resending}
                className="font-semibold text-accent hover:underline cursor-pointer disabled:opacity-60">
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            ) : (
              <span>Resend in <span className="font-mono text-ink">{cooldown.remaining}s</span></span>
            )}
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default VerifyOtpPage
