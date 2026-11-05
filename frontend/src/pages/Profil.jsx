import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getMonProfil, changerMotDePasse } from '../services/authService'

const LIBELLE_ROLE = {
  super_admin: 'Super admin',
  administrateur: 'Administrateur',
  responsable_conformite: 'Compliance officer',
  auditeur: 'Auditeur',
  manager: 'Manager',
}

function Profil() {
  const [profil, setProfil] = useState(null)
  const [ancienMotDePasse, setAncienMotDePasse] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  useEffect(() => { chargerProfil() }, [])

  const chargerProfil = async () => {
    try {
      const data = await getMonProfil()
      setProfil(data)
    } catch (err) {
      setErreur('Impossible de charger le profil')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces(false)

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreur('Les deux mots de passe ne correspondent pas')
      return
    }

    try {
      await changerMotDePasse(ancienMotDePasse, nouveauMotDePasse)
      setAncienMotDePasse('')
      setNouveauMotDePasse('')
      setConfirmationMotDePasse('')
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    } catch (err) {
      setErreur(err.response?.data?.detail || 'Erreur lors du changement de mot de passe')
    }
  }

  if (!profil) return <div><Navbar /><div className="max-w-2xl mx-auto px-6 py-10 text-ink-soft font-mono text-sm">Chargement...</div></div>

  const initiales = `${profil.prenom?.[0] || ''}${profil.nom?.[0] || ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Account</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-6">My profile</h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-ink flex items-center justify-center font-mono text-lg text-ink shrink-0">
              {initiales}
            </div>
            <div>
              <p className="font-display text-lg text-ink">{profil.prenom} {profil.nom}</p>
              <p className="text-ink-soft text-sm">{profil.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-line">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Role</p>
              <p className="text-ink text-sm">{LIBELLE_ROLE[profil.role] || profil.role}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Status</p>
              <p className="text-ink text-sm capitalize">{profil.statut}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Member since</p>
              <p className="text-ink text-sm font-mono">{new Date(profil.date_creation).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-line p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">Modifier le mot de passe</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={ancienMotDePasse}
                onChange={(e) => setAncienMotDePasse(e.target.value)}
                required
                className="w-full px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmationMotDePasse}
                onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                required
                className="w-full px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
            </div>

            {erreur && <p className="text-danger text-sm bg-danger-soft border border-danger/20 px-3 py-2">{erreur}</p>}

            <div className="flex items-center gap-4">
              <button type="submit" className="btn-primary px-5 py-2 text-sm cursor-pointer">
                Modifier le mot de passe
              </button>
              {succes && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent text-sm font-medium">
                  ✓ Password changed
                </motion.span>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Profil