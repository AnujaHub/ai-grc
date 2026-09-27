import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getSystemesIA, createSystemeIA } from '../services/systemeIaService'
import { getOrganisations } from '../services/organisationService'
import { peutEditer } from '../utils/permissions'

const BADGE_CRITICITE = {
  Faible: 'bg-accent-soft text-accent',
  Moyen: 'bg-warning-soft text-warning',
  Élevé: 'bg-danger-soft text-danger',
}

function SystemesIA() {
  const [systemes, setSystemes] = useState([])
  const [organisations, setOrganisations] = useState([])
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [proprietaire, setProprietaire] = useState('')
  const [domaineUtilisation, setDomaineUtilisation] = useState('')
  const [niveauCriticite, setNiveauCriticite] = useState('Moyen')
  const [organisationId, setOrganisationId] = useState('')
  const [erreur, setErreur] = useState('')
  const autorise = peutEditer()

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    try {
      const [systemesData, orgsData] = await Promise.all([getSystemesIA(), getOrganisations()])
      setSystemes(systemesData)
      setOrganisations(orgsData)
    } catch (err) {
      setErreur('Impossible de charger les données')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createSystemeIA({
        nom, description, proprietaire,
        domaine_utilisation: domaineUtilisation,
        niveau_criticite: niveauCriticite,
        organisation_id: organisationId,
      })
      setNom(''); setDescription(''); setProprietaire('')
      setDomaineUtilisation(''); setNiveauCriticite('Moyen'); setOrganisationId('')
      chargerDonnees()
    } catch (err) {
      setErreur('Erreur lors de la création du système IA')
    }
  }

  const getNomOrganisation = (orgId) => organisations.find((o) => o.id === orgId)?.nom || 'Inconnue'

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl text-ink mb-6">Inventaire des systèmes d'IA</h1>

        {autorise && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">Enregistrer un système IA</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <select
                value={organisationId} onChange={(e) => setOrganisationId(e.target.value)} required
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              >
                <option value="">— Organisation —</option>
                {organisations.map((org) => <option key={org.id} value={org.id}>{org.nom}</option>)}
              </select>
              <input
                type="text" placeholder="Nom du système" value={nom} onChange={(e) => setNom(e.target.value)} required
                className="flex-1 min-w-[180px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <select
                value={niveauCriticite} onChange={(e) => setNiveauCriticite(e.target.value)}
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              >
                <option value="Faible">Criticité faible</option>
                <option value="Moyen">Criticité moyenne</option>
                <option value="Élevé">Criticité élevée</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <input
                type="text" placeholder="Propriétaire" value={proprietaire} onChange={(e) => setProprietaire(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <input
                type="text" placeholder="Domaine d'utilisation" value={domaineUtilisation} onChange={(e) => setDomaineUtilisation(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm"
              />
              <button type="submit" className="px-5 py-2 bg-ink text-white text-sm font-medium cursor-pointer hover:bg-[#0d1729]">
                Ajouter
              </button>
            </div>
          </form>
          {erreur && <p className="text-danger text-sm mt-3">{erreur}</p>}
        </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Nom</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Domaine</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Criticité</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Organisation</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Statut</th>
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
                      {sys.niveau_criticite}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{getNomOrganisation(sys.organisation_id)}</td>
                  <td className="px-4 py-3 text-ink-soft font-mono text-xs">{sys.statut}</td>
                </tr>
              ))}
              {systemes.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-ink-soft text-sm">
                    Aucun système IA enregistré pour le moment.
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

export default SystemesIA