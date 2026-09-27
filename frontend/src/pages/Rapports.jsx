import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getRapports, telechargerRapport, visualiserRapport } from '../services/rapportService'
import { getEvaluations } from '../services/evaluationService'
import { getSystemesIA } from '../services/systemeIaService'
import { getOrganisations } from '../services/organisationService'

function Rapports() {
  const [rapports, setRapports] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [systemes, setSystemes] = useState([])
  const [organisations, setOrganisations] = useState([])
  const [erreur, setErreur] = useState('')
  const [telechargementEnCours, setTelechargementEnCours] = useState(null)

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    try {
      const [rapportsData, evalsData, systemesData, orgsData] = await Promise.all([
        getRapports(), getEvaluations(), getSystemesIA(), getOrganisations(),
      ])
      setRapports(rapportsData)
      setEvaluations(evalsData)
      setSystemes(systemesData)
      setOrganisations(orgsData)
    } catch (err) {
      setErreur('Impossible de charger les rapports')
    }
  }

  const handleTelecharger = async (rapportId) => {
    setTelechargementEnCours(rapportId)
    try {
      await telechargerRapport(rapportId)
    } catch (err) {
      alert('Erreur lors du téléchargement')
    } finally {
      setTelechargementEnCours(null)
    }
  }

  const handleVisualiser = async (rapportId) => {
    try {
      await visualiserRapport(rapportId)
    } catch (err) {
      alert('Erreur lors de l\'ouverture du rapport')
    }
  }

  const getInfosEvaluation = (evaluationId) => {
    const evaluation = evaluations.find((e) => e.id === evaluationId)
    if (!evaluation) return { cible: 'Inconnue', organisation: 'Inconnue' }
    if (evaluation.type_evaluation === 'Organisation') {
      const org = organisations.find((o) => o.id === evaluation.organisation_id)
      return { cible: 'Gouvernance globale', organisation: org ? org.nom : 'Inconnue' }
    }
    const systeme = systemes.find((s) => s.id === evaluation.systeme_ia_id)
    const org = systeme ? organisations.find((o) => o.id === systeme.organisation_id) : null
    return { cible: systeme ? systeme.nom : 'Inconnu', organisation: org ? org.nom : 'Inconnue' }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl text-ink mb-6">Rapports générés</h1>

        {erreur && <p className="text-danger text-sm mb-4">{erreur}</p>}

        {rapports.length === 0 ? (
          <p className="text-ink-soft text-sm">
            Aucun rapport généré pour le moment. Ouvre une évaluation terminée et clique sur « Générer le rapport PDF ».
          </p>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Organisation</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Cible évaluée</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Score</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft font-mono">Généré le</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((rapport) => {
                  const infos = getInfosEvaluation(rapport.evaluation_id)
                  return (
                    <tr key={rapport.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="px-4 py-3 text-ink">{infos.organisation}</td>
                      <td className="px-4 py-3 text-ink-soft">{infos.cible}</td>
                      <td className="px-4 py-3 font-mono text-ink">{rapport.score_global !== null ? `${rapport.score_global}%` : '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft">{new Date(rapport.date_generation).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={() => handleVisualiser(rapport.id)}
                          className="text-xs font-medium text-ink-soft hover:text-ink hover:underline cursor-pointer"
                        >
                          Visualiser
                        </button>
                        <button
                          onClick={() => handleTelecharger(rapport.id)}
                          disabled={telechargementEnCours === rapport.id}
                          className="text-xs font-medium text-accent hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {telechargementEnCours === rapport.id ? 'Téléchargement...' : 'Télécharger ↓'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Rapports