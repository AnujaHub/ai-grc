import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getRisques, createRisque, updateStatutRisque } from '../services/riskService'
import { getEvaluations } from '../services/evaluationService'
import { getSystemesIA } from '../services/aiSystemService'
import { getOrganisations } from '../services/organizationService'
import { peutEditer } from '../utils/permissions'
import { displayLabel } from '../utils/displayLabels'

const COULEUR_NIVEAU = {
  'Élevé': 'bg-danger-soft text-danger',
  'Moyen': 'bg-warning-soft text-warning',
  'Faible': 'bg-accent-soft text-accent',
  High: 'bg-danger-soft text-danger',
  Medium: 'bg-warning-soft text-warning',
  Low: 'bg-accent-soft text-accent',
}

function Risks() {
  const [risques, setRisques] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [systemes, setSystemes] = useState([])
  const [organizations, setOrganizations] = useState([])

  const [evaluationId, setEvaluationId] = useState('')
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [impact, setImpact] = useState('Moyen')
  const [probabilite, setProbabilite] = useState('Moyen')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const authorized = peutEditer()

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    try {
      const [risquesData, evalsData, systemesData, orgsData] = await Promise.all([
        getRisques(), getEvaluations(), getSystemesIA(), getOrganisations(),
      ])
      setRisques(risquesData)
      setEvaluations(evalsData)
      setSystemes(systemesData)
      setOrganizations(orgsData)
    } catch (err) {
      setError('Unable to load data')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createRisque({ evaluation_id: evaluationId, titre, description, categorie, impact, probabilite })
      setTitre(''); setDescription(''); setCategorie(''); setImpact('Moyen'); setProbabilite('Moyen'); setEvaluationId('')
      chargerDonnees()
    } catch (err) {
      setError('Risk creation failed')
    }
  }

  const handleChangeStatut = async (risqueId, nouveauStatut) => {
    try {
      await updateStatutRisque(risqueId, nouveauStatut)
      chargerDonnees()
    } catch (err) {
      alert('Status update failed')
    }
  }

  const getEvaluationParId = (id) => evaluations.find((ev) => ev.id === id)
  const getSystemeParId = (id) => systemes.find((s) => s.id === id)
  const getOrganisationParId = (id) => organizations.find((o) => o.id === id)

  const getNomSystemePourRisque = (risque) => {
    const evaluation = getEvaluationParId(risque.evaluation_id)
    if (!evaluation) return 'Unknown'
    if (evaluation.evaluation_type === 'Organisation') {
      const org = getOrganisationParId(evaluation.organisation_id)
      return org ? `${org.nom} (governance)` : 'Unknown organization'
    }
    const systeme = getSystemeParId(evaluation.systeme_ia_id)
    return systeme ? systeme.nom : 'Unknown system'
  }

  const getNomOrganisationPourRisque = (risque) => {
    const evaluation = getEvaluationParId(risque.evaluation_id)
    if (!evaluation) return 'Unknown'
    if (evaluation.evaluation_type === 'Organisation') {
      return getOrganisationParId(evaluation.organisation_id)?.nom || 'Unknown'
    }
    const systeme = getSystemeParId(evaluation.systeme_ia_id)
    return systeme ? getOrganisationParId(systeme.organisation_id)?.nom || 'Unknown' : 'Unknown'
  }

  const risquesParSysteme = {}
  risques.forEach((r) => {
    const cle = getNomSystemePourRisque(r)
    if (!risquesParSysteme[cle]) risquesParSysteme[cle] = []
    risquesParSysteme[cle].push(r)
  })

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Risk management</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-2">Risk register</h1>
        <p className="text-ink-soft text-sm mb-6">Prioritize exposure, assign ownership, and track remediation.</p>

        {authorized && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">Identify a new risk</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select value={evaluationId} onChange={(e) => setEvaluationId(e.target.value)} required
              className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm w-full sm:w-auto">
              <option value="">— Link to an assessment —</option>
              {evaluations.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.evaluation_type === 'Organisation'
                    ? `${getOrganisationParId(ev.organisation_id)?.nom || '?'} (gouvernance)`
                    : (getSystemeParId(ev.systeme_ia_id)?.nom || '?')} — {displayLabel(ev.statut)}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Risk title" value={titre} onChange={(e) => setTitre(e.target.value)} required
                className="flex-1 min-w-[220px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm" />
              <input type="text" placeholder="Category" value={categorie} onChange={(e) => setCategorie(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm" />
            </div>

            <textarea placeholder="Risk description" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm min-h-[70px]" />

            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm text-ink-soft">Impact
                <select value={impact} onChange={(e) => setImpact(e.target.value)}
                  className="ml-2 px-3 py-1.5 border border-line focus:border-accent outline-none bg-paper text-sm">
                  <option value="Faible">Low</option><option value="Moyen">Medium</option><option value="Élevé">High</option>
                </select>
              </label>
              <label className="text-sm text-ink-soft">Probability
                <select value={probabilite} onChange={(e) => setProbabilite(e.target.value)}
                  className="ml-2 px-3 py-1.5 border border-line focus:border-accent outline-none bg-paper text-sm">
                  <option value="Faible">Low</option><option value="Moyen">Medium</option><option value="Élevée">High</option>
                </select>
              </label>
              <button type="submit" className="btn-primary px-5 py-2 text-sm cursor-pointer">
                Add risk
              </button>
            </div>
          </form>
          {error && <p className="text-danger text-sm mt-3">{error}</p>}
        </motion.div>
        )}

        {Object.keys(risquesParSysteme).length === 0 && (
          <p className="text-ink-soft text-sm">No risks identified yet.</p>
        )}

        {Object.entries(risquesParSysteme).map(([nomSysteme, risquesDuGroupe], idx) => (
          <motion.div
            key={nomSysteme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="mb-6"
          >
            <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-line">
              <h3 className="font-display text-lg text-ink">{nomSysteme}</h3>
              <span className="text-xs text-ink-soft font-mono">{getNomOrganisationPourRisque(risquesDuGroupe[0])}</span>
            </div>

            <div className="bg-white border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Title</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Category</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Niveau</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Status</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {risquesDuGroupe.map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="px-4 py-2.5 text-ink">{r.titre}</td>
                      <td className="px-4 py-2.5 text-ink-soft">{r.categorie || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 text-xs font-mono font-medium ${COULEUR_NIVEAU[r.niveau_risque] || ''}`}>
                          {displayLabel(r.risk_level)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={r.statut}
                          onChange={(e) => handleChangeStatut(r.id, e.target.value)}
                          className="px-2 py-1 border border-line text-xs bg-paper focus:border-accent outline-none"
                        >
                          <option value="Ouvert">Ouvert</option>
                          <option value="En cours">En cours</option>
                          <option value="Clos">Clos</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => navigate(`/risks/${r.id}`)} className="text-xs font-medium text-accent hover:underline cursor-pointer">
                          Actions →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Risks