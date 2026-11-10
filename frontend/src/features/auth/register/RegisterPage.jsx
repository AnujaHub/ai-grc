import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User, Phone, Building2, Briefcase, UserPlus } from 'lucide-react'
import { Alert, Button, PasswordField, TextField } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import PasswordStrength from '../components/PasswordStrength'
import { validateRegister } from '../utils/validation'
import { registerUser } from '../services/authMockService'
import { JOB_TITLE_OPTIONS } from '../constants'
const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organisation: '',
  jobTitle: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
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
    const found = validateRegister(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setLoading(true)
    try {
      await registerUser(form)
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        footer={
          <>
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <AuthHeader
          title="Create your account"
          subtitle="An administrator will review your request before you can sign in."
        />

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="First name" icon={User} autoComplete="given-name" placeholder="Priya"
              value={form.firstName} onChange={update('firstName')} error={errors.firstName} />
            <TextField label="Last name" icon={User} autoComplete="family-name" placeholder="Sharma"
              value={form.lastName} onChange={update('lastName')} error={errors.lastName} />
          </div>

          <TextField label="Work email" type="email" icon={Mail} autoComplete="email" placeholder="you@company.com"
            value={form.email} onChange={update('email')} error={errors.email} />

          <TextField label="Phone (optional)" type="tel" icon={Phone} autoComplete="tel" placeholder="+91 98765 43210"
            value={form.phone} onChange={update('phone')} error={errors.phone} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Organisation" icon={Building2} autoComplete="organization" placeholder="Acme Corp"
              value={form.organisation} onChange={update('organisation')} error={errors.organisation} />
            <div>
              <label htmlFor="job-title"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Job title
              </label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                  aria-hidden="true" />
                <select
                  id="job-title"
                  value={form.jobTitle}
                  onChange={update('jobTitle')}
                  required
                  aria-invalid={Boolean(errors.jobTitle)}
                  className={[
                    'w-full appearance-none border py-2.5 pl-9 pr-3 text-sm text-ink outline-none',
                    errors.jobTitle ? 'border-danger focus:border-danger' : 'border-line focus:border-accent',
                  ].join(' ')}
                >
                  <option value="">Select your job title</option>
                  {JOB_TITLE_OPTIONS.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
              {errors.jobTitle && <p className="mt-1.5 text-xs text-danger">{errors.jobTitle}</p>}
            </div>
          </div>

          <div>
            <PasswordField label="Password" autoComplete="new-password" placeholder="Create a password"
              value={form.password} onChange={update('password')} error={errors.password} />
            <PasswordStrength password={form.password} />
          </div>

          <PasswordField label="Confirm password" autoComplete="new-password" placeholder="Repeat the password"
            value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />

          <div>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={form.acceptTerms} onChange={update('acceptTerms')}
                className="mt-1 h-4 w-4 accent-[#38d9c2]" />
              <span>
                I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {errors.acceptTerms && <p className="mt-1.5 text-xs text-danger">{errors.acceptTerms}</p>}
          </div>

          <Button type="submit" fullWidth loading={loading}>
            {!loading && <UserPlus className="h-4 w-4" />}
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default RegisterPage
