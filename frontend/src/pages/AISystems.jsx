import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getSystemesIA, createSystemeIA } from '../services/aiSystemService'
import { getOrganisations } from '../services/organizationService'
import { peutEditer } from '../utils/permissions'
import { displayLabel } from '../utils/displayLabels'

const BADGE_CRITICITE = {
  Faible: 'bg-accent-soft text-accent',
  Moyen: 'bg-warning-soft text-warning',
  Élevé: 'bg-danger-soft text-danger',
}

function AISystems() {
  const [systemes, setSystemes] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [proprietaire, setProprietaire] = useState('')
  const [domaineUtilisation, setDomaineUtilisation] = useState('')
  const [niveauCriticite, setNiveauCriticite] = useState('Moyen')
  const [organisationId, setOrganisationId] = useState('')
  const [error, setError] = useState('')
  const authorized = peutEditer()

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    try {
      const [systemesData, orgsData] = await Promise.all([getSystemesIA(), getOrganisations()])
      setSystemes(systemesData)
      setOrganizations(orgsData)
    } catch (err) {
      setError('Unable to load data')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createSystemeIA({
        nom, description, proprietaire,
        domaine_utilisation: domaineUtilisation,
        criticality_level: niveauCriticite,
        organisation_id: organisationId,
      })
      setNom(''); setDescription(''); setProprietaire('')
      setDomaineUtilisation(''); setNiveauCriticite('Moyen'); setOrganisationId('')
      chargerDonnees()
    } catch (err) {
      setError('AI system creation failed')
    }
  }

  const getNomOrganisation = (orgId) => organizations.find((o) => o.id === orgId)?.nom || 'Unknown'

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Governance</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-2">AI system inventory</h1>
        <p className="text-ink-soft text-sm mb-6">Maintain a clear register of the AI systems your organization operates.</p>

        {authorized && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">Register an AI system</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <select
                value={organisationId} onChange={(e) => setOrganisationId(e.target.value)} required
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              >
                <option value="">— Organization —</option>
                {organizations.map((org) => <option key={org.id} value={org.id}>{org.nom}</option>)}
              </select>
              <input
                type="text" placeholder="System name" value={nom} onChange={(e) => setNom(e.target.value)} required
                className="flex-1 min-w-[180px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <select
                value={niveauCriticite} onChange={(e) => setNiveauCriticite(e.target.value)}
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              >
                <option value="Faible">Low criticality</option>
                <option value="Moyen">Medium criticality</option>
                <option value="Élevé">High criticality</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <input
                type="text" placeholder="Owner" value={proprietaire} onChange={(e) => setProprietaire(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <input
                type="text" placeholder="Use domain" value={domaineUtilisation} onChange={(e) => setDomaineUtilisation(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <button type="submit" className="btn-primary px-5 py-2 text-sm cursor-pointer">
                Register AI system
              </button>
            </div>
          </form>
          {error && <p className="text-danger text-sm mt-3">{error}</p>}
        </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Domain</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Criticality</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Organization</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Status</th>
              </tr>
            </thead>
            <tbody>
              {systemes.map((sys) => (
                <tr key={sys.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{sys.nom}</p>
                    {sys.description && <p className="text-ink-soft text-xs mt-0.5">{sys.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{sys.domaine_utilisation || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-mono font-medium ${BADGE_CRITICITE[sys.niveau_criticite] || ''}`}>
                      {displayLabel(sys.criticality_level)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{getNomOrganisation(sys.organisation_id)}</td>
                  <td className="px-4 py-3 text-ink-soft font-mono text-xs">{displayLabel(sys.statut)}</td>
                </tr>
              ))}
              {systemes.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-ink-soft text-sm">
                    No AI systems registered yet.
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

export default AISystems