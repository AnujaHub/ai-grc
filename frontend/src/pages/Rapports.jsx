import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getRapports, telechargerRapport, visualiserRapport } from '../services/rapportService'
import { getEvaluations } from '../services/evaluationService'
import { getSystemesIA } from '../services/systemeIaService'
import { getOrganisations } from '../services/organisationService'

function Reports() {
  const [rapports, setRapports] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [systemes, setSystemes] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [error, setError] = useState('')
  const [telechargementEnCours, setTelechargementEnCours] = useState(null)

  const chargerDonnees = useCallback(async () => {
    try {
      const [rapportsData, evalsData, systemesData, orgsData] = await Promise.all([
        getRapports(), getEvaluations(), getSystemesIA(), getOrganisations(),
      ])
      setRapports(rapportsData)
      setEvaluations(evalsData)
      setSystemes(systemesData)
      setOrganizations(orgsData)
    } catch {
      setError('Unable to load reports')
    }
  }, [])

  useEffect(() => { queueMicrotask(() => { void chargerDonnees() }) }, [chargerDonnees])

  const handleTelecharger = async (rapportId) => {
    setTelechargementEnCours(rapportId)
    try {
      await telechargerRapport(rapportId)
    } catch {
      alert('Download failed')
    } finally {
      setTelechargementEnCours(null)
    }
  }

  const handleVisualiser = async (rapportId) => {
    try {
      await visualiserRapport(rapportId)
    } catch {
      alert('Unable to open the report')
    }
  }

  const getInfosEvaluation = (evaluationId) => {
    const evaluation = evaluations.find((e) => e.id === evaluationId)
    if (!evaluation) return { cible: 'Unknown', organisation: 'Unknown' }
    if (evaluation.evaluation_type === 'Organisation') {
      const org = organizations.find((o) => o.id === evaluation.organisation_id)
      return { cible: 'Organization-wide governance', organisation: org ? org.nom : 'Unknown' }
    }
    const systeme = systemes.find((s) => s.id === evaluation.systeme_ia_id)
    const org = systeme ? organizations.find((o) => o.id === systeme.organisation_id) : null
    return { cible: systeme ? systeme.nom : 'Unknown', organisation: org ? org.nom : 'Unknown' }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Compliance</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-2">Generated reports</h1>
        <p className="text-ink-soft text-sm mb-6">Review and export assessment records for stakeholders and auditors.</p>

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        {rapports.length === 0 ? (
          <p className="text-ink-soft text-sm">
            No reports generated yet. Open a completed assessment and click “Generate PDF report”.
          </p>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Organization</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Assessed target</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Score</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft font-mono">Generated on</th>
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
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft">{new Date(rapport.generation_date).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={() => handleVisualiser(rapport.id)}
                          className="text-xs font-medium text-ink-soft hover:text-ink hover:underline cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleTelecharger(rapport.id)}
                          disabled={telechargementEnCours === rapport.id}
                          className="text-xs font-medium text-accent hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {telechargementEnCours === rapport.id ? 'Downloading...' : 'Download ↓'}
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

export default Reports