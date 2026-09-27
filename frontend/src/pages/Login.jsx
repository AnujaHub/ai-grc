import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../services/authService'
import Logo from '../components/Logo'

function Login() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const data = await login(email, motDePasse)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur))
      navigate('/dashboard')
    } catch (err) {
      setErreur('Email ou mot de passe incorrect')
    } finally {
      setChargement(false)
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
          <h1 className="font-display text-xl text-ink mb-1">Accès au registre</h1>
          <p className="text-ink-soft text-sm mb-6">
            Identifiez-vous pour consulter votre dossier de conformité
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Adresse e-mail
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
                Mot de passe
              </label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-line focus:border-accent outline-none text-ink placeholder:text-gray-400 bg-paper"
              />
            </div>

            {erreur && (
              <p className="text-danger text-sm bg-danger-soft border border-danger/20 px-3 py-2">
                {erreur}
              </p>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-ink hover:bg-[#0d1729] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 cursor-pointer"
            >
              {chargement ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-soft mt-6 font-mono">
          ISO/IEC 42001 — Gouvernance des systèmes d'IA
        </p>
      </motion.div>
    </div>
  )
}

export default Login