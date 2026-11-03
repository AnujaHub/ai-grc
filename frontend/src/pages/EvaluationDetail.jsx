import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import CachetConformite from '../components/CachetConformite'
import { getEvaluationDetail, repondreAClause, finaliserEvaluation } from '../services/evaluationService'
import { getChapitres } from '../services/referentielService'
import GestionPreuves from '../components/GestionPreuves'
import { genererRisquesIA } from '../services/risqueService'
import { genererRapport } from '../services/rapportService'
import { peutEditer } from '../utils/permissions'
import SimulateurConformite from '../components/SimulateurConformite'
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
  const [chapitres, setChapitres] = useState([])
  const [reponses, setReponses] = useState({})
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [genererationIA, setGenerationIA] = useState(false)
  const [genererationRapport, setGenerationRapport] = useState(false)
  const autorise = peutEditer()

  useEffect(() => { chargerDonnees() }, [evaluationId])

  const chargerDonnees = async () => {
    try {
      const evalData = await getEvaluationDetail(evaluationId)
      const chapitresData = await getChapitres(evalData.referentiel_id)
      setEvaluation(evalData)
      setChapitres(chapitresData)

      const reponsesInitiales = {}
      evalData.reponses.forEach((r) => {
        reponsesInitiales[r.clause_id] = { reponse: r.reponse || '', commentaire: r.commentaire || '' }
      })
      setReponses(reponsesInitiales)
      setChargement(false)
    } catch (err) {
      setErreur('Unable to load the assessment')
      setChargement(false)
    }
  }

  const handleChangeReponse = (clauseId, champ, valeur) => {
    setReponses((prev) => ({ ...prev, [clauseId]: { ...prev[clauseId], [champ]: valeur } }))
  }

  const handleSauvegarder = async (clauseId) => {
    const donnee = reponses[clauseId]
    if (!donnee || !donnee.reponse) { alert('Select a response before saving'); return }
    try {
      await repondreAClause(evaluationId, clauseId, donnee.reponse, donnee.commentaire || '')
      await chargerDonnees()
    } catch (err) {
      alert('Save failed')
    }
  }

  const handleFinaliser = async () => {
    try {
      const evalFinalisee = await finaliserEvaluation(evaluationId)
      setEvaluation(evalFinalisee)
    } catch (err) {
      alert('Completion failed')
    }
  }

  const handleGenererRisquesIA = async () => {
    setGenerationIA(true)
    try {
      const resultat = await genererRisquesIA(evaluationId)
      alert(resultat.message)
    } catch (err) {
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
      alert('Report generation failed')
    } finally {
      setGenerationRapport(false)
    }
  }

  const getReponseIdPourClause = (clauseId) => {
    const reponseExistante = evaluation.reponses.find((r) => r.clause_id === clauseId)
    return reponseExistante ? reponseExistante.id : null
  }

  if (chargement) return <div><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-ink-soft font-mono text-sm">Loading...</div></div>
  if (erreur) return <div><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-danger">{erreur}</div></div>

  const chapitresFiltres = chapitres
    .filter((ch) => ch.clauses.some((c) => c.type_evaluation === evaluation.type_evaluation))
    .map((ch) => ({ ...ch, clauses: ch.clauses.filter((c) => c.type_evaluation === evaluation.type_evaluation) }))

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
              Status: <span className="font-medium text-ink">{displayLabel(evaluation.statut)}</span>
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              {autorise && evaluation.statut !== 'Terminée' && (
                <button onClick={handleFinaliser}
                  className="px-4 py-2 bg-accent text-white text-sm font-medium cursor-pointer hover:opacity-90">
                  Complete and calculate score
                </button>
              )}
              {autorise && (
                <button onClick={handleGenererRisquesIA} disabled={genererationIA}
                  className="px-4 py-2 border border-ink text-ink text-sm font-medium cursor-pointer hover:bg-ink hover:text-white disabled:opacity-50">
                  {genererationIA ? 'Analyzing...' : 'Generate risks (AI)'}
                </button>
              )}
              {evaluation.statut === 'Terminée' && (
                <button onClick={handleGenererRapport} disabled={genererationRapport}
                  className="px-4 py-2 border border-line text-ink-soft text-sm font-medium cursor-pointer hover:border-ink hover:text-ink disabled:opacity-50">
                  {genererationRapport ? 'Generating...' : 'Generate PDF report'}
                </button>
              )}
            </div>
          </div>

          {evaluation.score !== null && (
            <CachetConformite score={evaluation.score} taille={90} />
          )}
        </div>

        <SimulateurConformite reponses={evaluation.reponses} chapitresFiltres={chapitresFiltres} />
        {chapitresFiltres.map((chapitre, idxChap) => (
          <motion.div
            key={chapitre.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idxChap * 0.03, 0.3) }}
            className="mb-6"
          >
            <h2 className="font-display text-lg text-ink mb-3 pb-2 border-b border-line">
              {chapitre.numero}. {chapitre.titre}
            </h2>

            {chapitre.clauses.map((clause) => (
              <div key={clause.id} className="bg-white border border-line p-5 mb-3">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="font-medium text-ink text-sm">
                    <span className="font-mono text-ink-soft mr-2">{clause.numero}</span>
                    {clause.titre}
                  </p>
                  {clause.departement_suggere && (
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-ink-soft border border-line px-2 py-0.5">
                      {clause.departement_suggere}
                    </span>
                  )}
                </div>
                <p className="text-ink-soft text-xs mb-4">{clause.description}</p>

                <div className="flex flex-wrap gap-4 mb-3">
                  {OPTIONS_REPONSE.map((option) => (
                    <label key={option} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={`reponse-${clause.id}`}
                        value={option}
                        checked={reponses[clause.id]?.reponse === option}
                        onChange={(e) => handleChangeReponse(clause.id, 'reponse', e.target.value)}
                        className="accent-accent"
                      />
                      <span className={reponses[clause.id]?.reponse === option ? `font-medium ${COULEUR_REPONSE[option]}` : 'text-ink-soft'}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>

                {autorise ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Commentaire (optionnel)"
                      value={reponses[clause.id]?.commentaire || ''}
                      onChange={(e) => handleChangeReponse(clause.id, 'commentaire', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-line focus:border-accent outline-none bg-paper text-sm"
                    />
                    <button
                      onClick={() => handleSauvegarder(clause.id)}
                      className="px-4 py-1.5 bg-ink text-white text-xs font-medium cursor-pointer hover:bg-[#0d1729]"
                    >
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  reponses[clause.id]?.commentaire && (
                    <p className="text-ink-soft text-xs italic">« {reponses[clause.id].commentaire} »</p>
                  )
                )}

                {getReponseIdPourClause(clause.id) && (
                  <GestionPreuves reponseId={getReponseIdPourClause(clause.id)} />
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