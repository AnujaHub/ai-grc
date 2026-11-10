import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getOrganisations, createOrganisation } from '../services/organizationService'
import { estAdministrateur } from '../utils/permissions'

function Organizations() {
  const [organizations, setOrganizations] = useState([])
  const [nom, setNom] = useState('')
  const [secteur, setSecteur] = useState('')
  const [pays, setPays] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const peutCreer = estAdministrateur()

  useEffect(() => { loadOrganizations() }, [])

  const loadOrganizations = async () => {
    try {
      const data = await getOrganisations()
      setOrganizations(data)
    } catch (err) {
      setError('Unable to load organizations')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createOrganisation(nom, secteur, pays)
      setNom(''); setSecteur(''); setPays('')
      loadOrganizations()
    } catch (err) {
      setError('Creation failed')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Governance</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-2">Organizations</h1>
        <p className="text-ink-soft text-sm mb-6">Manage the entities and AI governance scopes in your workspace.</p>

        {peutCreer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-line p-6 mb-6"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">
            Register an organization
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
            <input
              type="text" placeholder="Name" value={nom} onChange={(e) => setNom(e.target.value)} required
              className="flex-1 min-w-[180px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
            />
            <input
              type="text" placeholder="Sector" value={secteur} onChange={(e) => setSecteur(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
            />
            <input
              type="text" placeholder="Country" value={pays} onChange={(e) => setPays(e.target.value)}
              className="flex-1 min-w-[130px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
            />
            <button type="submit" className="btn-primary px-5 py-2 text-sm cursor-pointer">
              Register organization
            </button>
          </form>
          {error && <p className="text-danger text-sm mt-3">{error}</p>}
        </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-line"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Sector</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Country</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft font-mono">Created on</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 font-medium text-ink">{org.nom}</td>
                  <td className="px-4 py-3 text-ink-soft">{org.secteur || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">{org.pays || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {new Date(org.creation_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/risk-configuration/${org.id}`)}
                      className="text-xs font-medium text-accent hover:underline cursor-pointer"
                    >
                      Risk matrix
                    </button>
                  </td>
                </tr>
              ))}
              {organizations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-ink-soft text-sm">
                    No organizations registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}

export default Organizations