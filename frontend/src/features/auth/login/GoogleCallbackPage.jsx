import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../../../components/ui'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import AuthHeader from '../components/AuthHeader'
import { getMonProfil } from '../../../services/authService'

function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const authenticate = async () => {
      const params = new URLSearchParams(window.location.hash.slice(1))
      const token = params.get('access_token')

      if (!token) {
        setError('Google sign-in did not return an access token.')
        return
      }

      try {
        localStorage.setItem('token', token)
        const user = await getMonProfil()
        localStorage.setItem('utilisateur', JSON.stringify(user))
        window.history.replaceState(null, '', window.location.pathname)
        navigate('/dashboard', { replace: true })
      } catch {
        localStorage.removeItem('token')
        setError('Google sign-in could not be completed. Please try again.')
      }
    }

    void authenticate()
  }, [navigate])

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title="Signing you in" subtitle="Completing Google authentication…" />
        {error && <Alert variant="error">{error}</Alert>}
      </AuthCard>
    </AuthLayout>
  )
}

export default GoogleCallbackPage
