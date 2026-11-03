import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getOrganisations, createOrganisation } from '../services/organisationService'
import { estAdministrateur } from '../utils/permissions'

function Organisations() {
  const [organisations, setOrganisations] = useState([])
  const [nom, setNom] = useState('')
  const [secteur, setSecteur] = useState('')
  const [pays, setPays] = useState('')
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()
  const peutCreer = estAdministrateur()

  useEffect(() => { chargerOrganisations() }, [])

  const chargerOrganisations = async () => {
    try {
      const data = await getOrganisations()
      setOrganisations(data)
    } catch (err) {
      setErreur('Impossible de charger les organisations')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createOrganisation(nom, secteur, pays)
      setNom(''); setSecteur(''); setPays('')
      chargerOrganisations()
    } catch (err) {
      setErreur('Creation failed')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl text-ink mb-6">Organizations</h1>

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
            <button type="submit" className="px-5 py-2 bg-ink text-white text-sm font-medium cursor-pointer hover:bg-[#0d1729]">
              Add
            </button>
          </form>
          {erreur && <p className="text-danger text-sm mt-3">{erreur}</p>}
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
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Secteur</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Pays</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft font-mono">Created on</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {organisations.map((org) => (
                <tr key={org.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 font-medium text-ink">{org.nom}</td>
                  <td className="px-4 py-3 text-ink-soft">{org.secteur || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">{org.pays || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {new Date(org.date_creation).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/configuration-risque/${org.id}`)}
                      className="text-xs font-medium text-accent hover:underline cursor-pointer"
                    >
                      Matrice de risque
                    </button>
                  </td>
                </tr>
              ))}
              {organisations.length === 0 && (
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

export default Organisations