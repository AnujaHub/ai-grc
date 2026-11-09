import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Smartphone, QrCode, Copy, Check, ShieldCheck } from 'lucide-react'
import { Alert, Button } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import StepIndicator from './StepIndicator'
import OtpInput from '../components/OtpInput'
import { DEMO_CODE, getMfaSetup, verifyMfaCode } from '../services/authMockService'

const STEPS = ['Install app', 'Scan code', 'Verify']

function QrPlaceholder() {
  return (
    <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-paper text-ink-soft">
      <QrCode className="h-14 w-14" />
      <span className="text-xs">QR code</span>
    </div>
  )
}

function MfaSetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [setup, setSetup] = useState(null)
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    getMfaSetup().then(setSetup)
  }, [])

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(setup.secret.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.length < 6) return setError('Enter the 6-digit code from your app.')
    setError('')
    setLoading(true)
    try {
      await verifyMfaCode(code)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <AuthCard>
          <AuthHeader icon={ShieldCheck} title="Two-factor authentication enabled"
            subtitle="From now on you'll enter a code from your authenticator app each time you sign in." />
          <Button fullWidth onClick={() => navigate('/dashboard')}>Continue to dashboard</Button>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard footer={<Link to="/dashboard" className="text-ink-soft hover:text-accent">Set up later</Link>}>
        <AuthHeader title="Set up two-factor authentication" subtitle="Add an extra layer of security to your account." />
        <StepIndicator steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-lg border border-line bg-paper p-4">
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div className="text-sm">
                <p className="font-semibold text-ink">Install an authenticator app</p>
                <p className="mt-1 text-ink-soft">
                  Use Google Authenticator, Microsoft Authenticator, Authy or any TOTP-compatible app on your phone.
                </p>
              </div>
            </div>
            <Button fullWidth onClick={() => setStep(1)}>I have an app installed</Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <p className="text-sm text-ink-soft">Open your app and scan this QR code.</p>
            <QrPlaceholder />
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Can&apos;t scan? Enter this key</p>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-paper px-3 py-2.5">
                <code className="font-mono text-sm tracking-wider text-ink">{setup ? setup.secret : 'Loading…'}</code>
                <button type="button" onClick={copySecret} disabled={!setup}
                  className="rounded p-1 text-ink-soft hover:text-accent cursor-pointer" aria-label="Copy key">
                  {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1" onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-5">
            <p className="text-sm text-ink-soft">Enter the 6-digit code shown in your authenticator app.</p>
            {error && <Alert variant="error">{error}</Alert>}
            <OtpInput value={code} onChange={(v) => { setCode(v); setError('') }} error={Boolean(error)} disabled={loading} />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" className="flex-1" loading={loading}>{loading ? 'Verifying…' : 'Verify & enable'}</Button>
            </div>
            <p className="text-center font-mono text-[11px] text-ink-soft/70">Demo code: {DEMO_CODE}</p>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  )
}

export default MfaSetupPage
