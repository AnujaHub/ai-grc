import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ComplianceBadge from '../components/CachetConformite'
import { getEvaluationDetail, repondreAClause, finaliserEvaluation } from '../services/evaluationService'
import { getChapitres } from '../services/referentielService'
import EvidenceManagement from '../components/GestionPreuves'
import { genererRisquesIA } from '../services/risqueService'
import { genererRapport } from '../services/rapportService'
import { peutEditer } from '../utils/permissions'
import ComplianceSimulator from '../components/SimulateurConformite'
import { displayLabel } from '../utils/displayLabels'

const OPTIONS_REPONSE = ['Conforme', 'Partiellement conforme', 'Non conforme', 'Non applicable']

const COULEUR_REPONSE = {
  'Conforme': 'text-accent',
  'Partiellement conforme': 'text-warning',
  'Non conforme': 'text-danger',
  'Non applicable': 'text-ink-soft',
}

function EvaluationDetail() {
  const { evaluationId } = useParams()
  const navigate = useNavigate()

  const [evaluation, setEvaluation] = useState(null)
  const [chapters, setChapitres] = useState([])
  const [responses, setReponses] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [genererationIA, setGenerationIA] = useState(false)
  const [genererationRapport, setGenerationRapport] = useState(false)
  const authorized = peutEditer()

  const chargerDonnees = useCallback(async () => {
    try {
      const evalData = await getEvaluationDetail(evaluationId)
      const chapitresData = await getChapitres(evalData.framework_id)
      setEvaluation(evalData)
      setChapitres(chapitresData)

      const reponsesInitiales = {}
      evalData.responses.forEach((r) => {
        reponsesInitiales[r.clause_id] = { response: r.response || '', comment: r.comment || '' }
      })
      setReponses(reponsesInitiales)
      setLoading(false)
    } catch {
      setError('Unable to load the assessment')
      setLoading(false)
    }
  }, [evaluationId])

  useEffect(() => { queueMicrotask(() => { void chargerDonnees() }) }, [chargerDonnees])

  const handleChangeReponse = (clauseId, champ, valeur) => {
    setReponses((prev) => ({ ...prev, [clauseId]: { ...prev[clauseId], [champ]: valeur } }))
  }

  const handleSave = async (clauseId) => {
    const donnee = responses[clauseId]
    if (!donnee || !donnee.response) { alert('Select a response before saving'); return }
    try {
      await repondreAClause(evaluationId, clauseId, donnee.response, donnee.comment || '')
      await chargerDonnees()
    } catch {
      alert('Save failed')
    }
  }

  const handleFinaliser = async () => {
    try {
      const evalFinalisee = await finaliserEvaluation(evaluationId)
      setEvaluation(evalFinalisee)
    } catch {
      alert('Completion failed')
    }
  }

  const handleGenererRisquesIA = async () => {
    setGenerationIA(true)
    try {
      const resultat = await genererRisquesIA(evaluationId)
      alert(resultat.message)
    } catch {
      alert('AI risk generation failed')
    } finally {
      setGenerationIA(false)
    }
  }

  const handleGenererRapport = async () => {
    setGenerationRapport(true)
    try {
      await genererRapport(evaluationId)
      alert('Report generated successfully. Open Reports to download it.')
    } catch (err) {
      const detail = err.response?.data?.detail
      alert(detail ? `Report generation failed: ${detail}` : 'Report generation failed')
    } finally {
      setGenerationRapport(false)
    }
  }

  const getReponseIdPourClause = (clauseId) => {
    const reponseExistante = evaluation.responses.find((r) => r.clause_id === clauseId)
    return reponseExistante ? reponseExistante.id : null
  }

  if (loading) return <div><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-ink-soft font-mono text-sm">Loading...</div></div>
  if (error) return <div><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-danger">{error}</div></div>

  const chapitresFiltres = chapters
    .filter((ch) => ch.clauses.some((c) => c.evaluation_type === evaluation.evaluation_type))
    .map((ch) => ({ ...ch, clauses: ch.clauses.filter((c) => c.evaluation_type === evaluation.evaluation_type) }))

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/evaluations')} className="text-sm text-ink-soft hover:text-ink mb-6 cursor-pointer">
          ← Back to assessments
        </button>

        <div className="bg-white border border-line p-6 mb-8 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-display text-xl text-ink mb-1">Assessment questionnaire</h1>
            <p className="text-sm text-ink-soft">
              Status: <span className="font-medium text-ink">{displayLabel(evaluation.status)}</span>
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              {authorized && evaluation.status !== 'Terminée' && (
                <button onClick={handleFinaliser}
                  className="px-4 py-2 bg-accent text-white text-sm font-medium cursor-pointer hover:opacity-90">
                  Complete and calculate score
                </button>
              )}
              {authorized && (
                <button onClick={handleGenererRisquesIA} disabled={genererationIA}
                  className="px-4 py-2 border border-ink text-ink text-sm font-medium cursor-pointer hover:bg-ink hover:text-white disabled:opacity-50">
                  {genererationIA ? 'Analyzing...' : 'Generate risks (AI)'}
                </button>
              )}
              {evaluation.status === 'Terminée' && (
                <button onClick={handleGenererRapport} disabled={genererationRapport}
                  className="px-4 py-2 border border-line text-ink-soft text-sm font-medium cursor-pointer hover:border-ink hover:text-ink disabled:opacity-50">
                  {genererationRapport ? 'Generating...' : 'Generate PDF report'}
                </button>
              )}
            </div>
          </div>

          {evaluation.score !== null && (
            <ComplianceBadge score={evaluation.score} size_bytes={90} />
          )}
        </div>

        <ComplianceSimulator responses={evaluation.responses} chapitresFiltres={chapitresFiltres} />
        {chapitresFiltres.map((chapitre, idxChap) => (
          <motion.div
            key={chapitre.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idxChap * 0.03, 0.3) }}
            className="mb-6"
          >
            <h2 className="font-display text-lg text-ink mb-3 pb-2 border-b border-line">
              {chapitre.number}. {chapitre.title}
            </h2>

            {chapitre.clauses.map((clause) => (
              <div key={clause.id} className="bg-white border border-line p-5 mb-3">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="font-medium text-ink text-sm">
                    <span className="font-mono text-ink-soft mr-2">{clause.number}</span>
                    {clause.title}
                  </p>
                  {clause.suggested_department && (
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-ink-soft border border-line px-2 py-0.5">
                      {clause.suggested_department}
                    </span>
                  )}
                </div>
                <p className="text-ink-soft text-xs mb-4">{clause.description}</p>

                <div className="flex flex-wrap gap-4 mb-3">
                  {OPTIONS_REPONSE.map((option) => (
                    <label key={option} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={`response-${clause.id}`}
                        value={option}
                        checked={responses[clause.id]?.response === option}
                        onChange={(e) => handleChangeReponse(clause.id, 'response', e.target.value)}
                        className="accent-accent"
                      />
                      <span className={responses[clause.id]?.response === option ? `font-medium ${COULEUR_REPONSE[option]}` : 'text-ink-soft'}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>

                {authorized ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Comment (optional)"
                      value={responses[clause.id]?.comment || ''}
                      onChange={(e) => handleChangeReponse(clause.id, 'comment', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-line focus:border-accent outline-none bg-paper text-sm"
                    />
                    <button
                      onClick={() => handleSave(clause.id)}
                      className="btn-primary px-4 py-1.5 text-xs cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  responses[clause.id]?.comment && (
                    <p className="text-ink-soft text-xs italic">« {responses[clause.id].comment} »</p>
                  )
                )}

                {getReponseIdPourClause(clause.id) && (
                  <EvidenceManagement responseId={getReponseIdPourClause(clause.id)} />
                )}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default EvaluationDetail