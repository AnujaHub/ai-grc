import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LockKeyhole, LinkIcon } from 'lucide-react'
import { Alert, Button, PasswordField } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import PasswordStrength from '../components/PasswordStrength'
import { validateResetPassword } from '../utils/validation'
import { resetPassword } from '../services/authMockService'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [linkInvalid, setLinkInvalid] = useState(!token)

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validateResetPassword(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setLoading(true)
    setServerError('')
    try {
      await resetPassword(token, form.password)
      navigate('/', { state: { notice: 'Your password has been updated. Sign in with your new password.' } })
    } catch (err) {
      if (token === 'expired') setLinkInvalid(true)
      else setServerError(err.response?.data?.detail || 'Could not reset password.')
    } finally {
      setLoading(false)
    }
  }

  if (linkInvalid) {
    return (
      <AuthLayout>
        <AuthCard>
          <AuthHeader
            icon={LinkIcon}
            tone="danger"
            title="Link invalid or expired"
            subtitle="This password reset link is no longer valid. Request a new one to continue."
          />
          <Link to="/forgot-password">
            <Button fullWidth>Request a new link</Button>
          </Link>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard footer={<Link to="/" className="text-accent hover:underline">Back to sign in</Link>}>
        <AuthHeader icon={LockKeyhole} title="Set a new password" subtitle="Choose a strong password you haven't used before." />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <div>
            <PasswordField label="New password" autoComplete="new-password" placeholder="Create a password"
              value={form.password} onChange={update('password')} error={errors.password} />
            <PasswordStrength password={form.password} />
          </div>
          <PasswordField label="Confirm new password" autoComplete="new-password" placeholder="Repeat the password"
            value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />
          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default ResetPasswordPage
