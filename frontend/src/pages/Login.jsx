import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../services/authService'
import Logo from '../components/Logo'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setMotDePasse] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur))
      navigate('/dashboard')
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to the server. Make sure the backend is running on port 8000.')
      } else if (err.response.status === 401) {
        setError('Incorrect email or password')
      } else {
        setError(err.response.data?.detail || 'Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-10">
          <Logo taille="grand" />
        </div>

        <div className="bg-white border border-line p-8">
          <h1 className="font-display text-xl text-ink mb-1">Restricted access</h1>
          <p className="text-ink-soft text-sm mb-6">
            Sign in to access your compliance workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@entreprise.com"
                className="w-full px-3 py-2.5 border border-line focus:border-accent outline-none text-ink placeholder:text-gray-400 bg-paper"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-line focus:border-accent outline-none text-ink placeholder:text-gray-400 bg-paper"
              />
            </div>

            {error && (
              <p className="text-danger text-sm bg-danger-soft border border-danger/20 px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-soft mt-6 font-mono">
          ISO/IEC 42001 — AI governance
        </p>
      </motion.div>
    </div>
  )
}

export default Login