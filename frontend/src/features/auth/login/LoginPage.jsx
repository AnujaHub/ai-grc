import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, LogIn } from 'lucide-react'
import { getGoogleLoginUrl, login } from '../../../services/authService'
import { Alert, Button, PasswordField, TextField } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import { validateLogin } from '../utils/validation'
import { MFA_ENABLED_FOR_DEMO } from '../services/authMockService'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const notice = location.state?.notice

  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const found = validateLogin(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur))
      navigate(MFA_ENABLED_FOR_DEMO ? '/mfa-verify' : '/dashboard')
    } catch (err) {
      if (!err.response) {
        setServerError('Unable to reach the server. Make sure the backend is running on port 8000.')
      } else if (err.response.status === 401) {
        setServerError('Incorrect email or password.')
      } else if (err.response.status === 403) {
        setServerError('Your account is awaiting administrator approval.')
      } else {
        setServerError(err.response.data?.detail || 'Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        footer={
          <>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-accent hover:underline">
              Create one
            </Link>
          </>
        }
      >
        <AuthHeader title="Welcome back" subtitle="Sign in to your compliance workspace." />

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {notice && <Alert variant="success">{notice}</Alert>}
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <TextField
            label="Email address"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
          />

          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-ink-soft">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={update('remember')}
                className="h-4 w-4 accent-[#38d9c2]"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-medium text-accent hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            {!loading && <LogIn className="h-4 w-4" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-paper-dark px-3 text-xs text-ink-soft">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => { window.location.href = getGoogleLoginUrl() }}
          >
            Continue with Google
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default LoginPage
