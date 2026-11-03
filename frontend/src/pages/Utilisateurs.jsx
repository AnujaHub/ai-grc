import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getUtilisateurs, creerUtilisateur, modifierUtilisateur } from '../services/utilisateurService'
import { getOrganisations } from '../services/organisationService'

const ROLES = [
  { valeur: 'administrateur', label: 'Administrator' },
  { valeur: 'responsable_conformite', label: 'Compliance officer' },
  { valeur: 'auditeur', label: 'Auditor' },
  { valeur: 'manager', label: 'Manager' },
]

function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [organisations, setOrganisations] = useState([])
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [role, setRole] = useState('responsable_conformite')
  const [organisationId, setOrganisationId] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    try {
      const [utilisateursData, orgsData] = await Promise.all([getUtilisateurs(), getOrganisations()])
      setUtilisateurs(utilisateursData)
      setOrganisations(orgsData)
    } catch (err) {
      setErreur('Access denied — this page is restricted to administrators.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await creerUtilisateur({
        nom, prenom, email, mot_de_passe: motDePasse, role,
        organisation_id: organisationId || null,
      })
      setNom(''); setPrenom(''); setEmail(''); setMotDePasse('')
      setRole('responsable_conformite'); setOrganisationId('')
      chargerDonnees()
    } catch (err) {
      setErreur('Creation failed (the email may already be in use).')
    }
  }

  const handleChangeRole = async (utilisateurId, nouveauRole) => {
    try {
      await modifierUtilisateur(utilisateurId, { role: nouveauRole })
      chargerDonnees()
    } catch (err) {
      alert('Role update failed')
    }
  }

  const handleChangeStatut = async (utilisateurId, nouveauStatut) => {
    try {
      await modifierUtilisateur(utilisateurId, { statut: nouveauStatut })
      chargerDonnees()
    } catch (err) {
      alert('Status update failed')
    }
  }

  const getNomOrganisation = (id) => organisations.find((o) => o.id === id)?.nom || '—'

  if (erreur && utilisateurs.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-danger text-sm bg-danger-soft border border-danger/20 px-4 py-3">{erreur}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl text-ink mb-6">User management</h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">Create a user account</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="First name" value={prenom} onChange={(e) => setPrenom(e.target.value)} required
                className="flex-1 min-w-[140px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm" />
              <input type="text" placeholder="Last name" value={nom} onChange={(e) => setNom(e.target.value)} required
                className="flex-1 min-w-[140px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="flex-1 min-w-[200px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm" />
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="password" placeholder="Temporary password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required
                className="flex-1 min-w-[180px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm" />
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm">
                {ROLES.map((r) => <option key={r.valeur} value={r.valeur}>{r.label}</option>)}
              </select>
              <select value={organisationId} onChange={(e) => setOrganisationId(e.target.value)}
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm">
                <option value="">— Organization (optional) —</option>
                {organisations.map((org) => <option key={org.id} value={org.id}>{org.nom}</option>)}
              </select>
              <button type="submit" className="px-5 py-2 bg-ink text-white text-sm font-medium cursor-pointer hover:bg-[#0d1729]">
                Create account
              </button>
            </div>
          </form>
          {erreur && <p className="text-danger text-sm mt-3">{erreur}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Organization</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Role</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Status</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 text-ink font-medium">{u.prenom} {u.nom}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{getNomOrganisation(u.organisation_id)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="px-2 py-1 border border-line text-xs bg-paper focus:border-accent outline-none"
                    >
                      {ROLES.map((r) => <option key={r.valeur} value={r.valeur}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.statut}
                      onChange={(e) => handleChangeStatut(u.id, e.target.value)}
                      className="px-2 py-1 border border-line text-xs bg-paper focus:border-accent outline-none"
                    >
                      <option value="actif">Active</option>
                      <option value="inactif">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}

export default Utilisateurs