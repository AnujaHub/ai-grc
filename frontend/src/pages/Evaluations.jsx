import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getEvaluations, createEvaluation } from '../services/evaluationService'
import { getSystemesIA } from '../services/systemeIaService'
import { getReferentiels } from '../services/referentielService'
import { getOrganisations } from '../services/organisationService'
import { peutEditer } from '../utils/permissions'
import { displayLabel } from '../utils/displayLabels'

function Evaluations() {
  const [evaluations, setEvaluations] = useState([])
  const [systemes, setSystemes] = useState([])
  const [referentiels, setReferentiels] = useState([])
  const [organizations, setOrganizations] = useState([])

  const [typeEvaluation, setTypeEvaluation] = useState('Systeme_IA')
  const [systemeId, setSystemeId] = useState('')
  const [organisationId, setOrganisationId] = useState('')
  const [referentielId, setReferentielId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const authorized = peutEditer()

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    try {
      const [evalsData, systemesData, refsData, orgsData] = await Promise.all([
        getEvaluations(), getSystemesIA(), getReferentiels(), getOrganisations(),
      ])
      setEvaluations(evalsData)
      setSystemes(systemesData)
      setReferentiels(refsData)
      setOrganizations(orgsData)
    } catch (err) {
      setError('Unable to load assessment data')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const nouvelleEval = await createEvaluation(
        typeEvaluation, referentielId,
        typeEvaluation === 'Systeme_IA' ? systemeId : null,
        typeEvaluation === 'Organisation' ? organisationId : null
      )
      navigate(`/evaluations/${nouvelleEval.id}`)
    } catch (err) {
      setError('Assessment creation failed')
    }
  }

  const getNomSysteme = (id) => systemes.find((s) => s.id === id)?.nom || null
  const getNomOrganisation = (id) => organizations.find((o) => o.id === id)?.nom || null
  const getNomReferentiel = (id) => referentiels.find((r) => r.id === id)?.nom || 'Unknown'

  const couleurStatut = (statut) =>
    statut === 'Terminée' ? 'bg-accent-soft text-accent' :
    statut === 'En cours' ? 'bg-warning-soft text-warning' : 'bg-line text-ink-soft'

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Compliance</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-2">Compliance assessments</h1>
        <p className="text-ink-soft text-sm mb-6">Measure governance maturity against your selected framework.</p>

        {authorized && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">Start a new assessment</h2>

          <form onSubmit={handleCreate}>
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="radio" name="typeEvaluation" value="Systeme_IA"
                  checked={typeEvaluation === 'Systeme_IA'}
                  onChange={(e) => setTypeEvaluation(e.target.value)}
                  className="accent-accent" />
                Specific AI system
              </label>
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="radio" name="typeEvaluation" value="Organisation"
                  checked={typeEvaluation === 'Organisation'}
                  onChange={(e) => setTypeEvaluation(e.target.value)}
                  className="accent-accent" />
                Organization-wide governance
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              {typeEvaluation === 'Systeme_IA' ? (
                <select value={systemeId} onChange={(e) => setSystemeId(e.target.value)} required
                  className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm">
                  <option value="">— AI system —</option>
                  {systemes.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              ) : (
                <select value={organisationId} onChange={(e) => setOrganisationId(e.target.value)} required
                  className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm">
                  <option value="">— Organization —</option>
                  {organizations.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
                </select>
              )}

              <select value={referentielId} onChange={(e) => setReferentielId(e.target.value)} required
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm">
                <option value="">— Reference framework —</option>
                {referentiels.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
              </select>

              <button type="submit" className="btn-primary px-5 py-2 text-sm cursor-pointer">
                Create and start
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
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Target</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Reference framework</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Score</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft font-mono">Started</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <tr key={ev.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 text-ink">
                    {ev.evaluation_type === 'Organisation'
                      ? <span>{getNomOrganisation(ev.organisation_id) || 'Unknown'} <span className="text-ink-soft text-xs font-mono">— governance</span></span>
                      : (getNomSysteme(ev.systeme_ia_id) || 'Unknown')}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{getNomReferentiel(ev.referentiel_id)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-mono font-medium ${couleurStatut(ev.statut)}`}>
                      {displayLabel(ev.statut)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink">{ev.score !== null ? `${ev.score}%` : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{ev.start_date}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/evaluations/${ev.id}`)}
                      className="text-xs font-medium text-accent hover:underline cursor-pointer"
                    >
                      Ouvrir →
                    </button>
                  </td>
                </tr>
              ))}
              {evaluations.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-ink-soft text-sm">No assessments yet.</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}

export default Evaluations