import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Alert, Button } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import OtpInput from '../components/OtpInput'
import { DEMO_CODE, verifyMfaCode } from '../services/authMockService'

function MfaVerifyPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [trustDevice, setTrustDevice] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length < 6) return setError('Enter the 6-digit code from your app.')
    setError('')
    setLoading(true)
    try {
      await verifyMfaCode(code)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        footer={
          <Link to="/" className="text-accent hover:underline">
            Sign in with a different account
          </Link>
        }
      >
        <AuthHeader
          icon={ShieldCheck}
          title="Two-factor authentication"
          subtitle="Open your authenticator app and enter the 6-digit code."
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}
          <OtpInput value={code} onChange={(v) => { setCode(v); setError('') }} error={Boolean(error)} disabled={loading} />

          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)}
              className="h-4 w-4 accent-[#38d9c2]" />
            Trust this device for 30 days
          </label>

          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Verifying…' : 'Verify'}
          </Button>

          <p className="text-center text-sm text-ink-soft">
            Lost access to your app?{' '}
            <a href="#" className="font-semibold text-accent hover:underline">Use a recovery code</a>
          </p>
          <p className="text-center font-mono text-[11px] text-ink-soft/70">Demo code: {DEMO_CODE}</p>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default MfaVerifyPage
