import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getRisqueDetail, createActionCorrective, updateStatutAction } from '../services/risqueService'

const COULEUR_NIVEAU = {
  'Élevé': 'bg-danger-soft text-danger',
  'Moyen': 'bg-warning-soft text-warning',
  'Faible': 'bg-accent-soft text-accent',
}

function RisqueDetail() {
  const { risqueId } = useParams()
  const navigate = useNavigate()

  const [risque, setRisque] = useState(null)
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [dateEcheance, setDateEcheance] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => { chargerRisque() }, [risqueId])

  const chargerRisque = async () => {
    try {
      const data = await getRisqueDetail(risqueId)
      setRisque(data)
    } catch (err) {
      setErreur('Impossible de charger le risque')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createActionCorrective(risqueId, { titre, description, date_echeance: dateEcheance || null })
      setTitre(''); setDescription(''); setDateEcheance('')
      chargerRisque()
    } catch (err) {
      alert('Erreur lors de la création de l\'action corrective')
    }
  }

  const handleChangeStatutAction = async (actionId, nouveauStatut) => {
    try {
      await updateStatutAction(actionId, nouveauStatut)
      chargerRisque()
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  if (!risque) return <div><Navbar /><div className="max-w-3xl mx-auto px-6 py-10 text-ink-soft font-mono text-sm">Chargement...</div></div>

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/risques')} className="text-sm text-ink-soft hover:text-ink mb-6 cursor-pointer">
          ← Retour aux risques
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="font-display text-xl text-ink">{risque.titre}</h1>
            <span className={`shrink-0 px-2 py-0.5 text-xs font-mono font-medium ${COULEUR_NIVEAU[risque.niveau_risque] || ''}`}>
              {risque.niveau_risque}
            </span>
          </div>
          <p className="text-ink-soft text-sm mb-4">{risque.description}</p>
          <div className="flex gap-6 text-xs font-mono text-ink-soft">
            <span>Impact : <span className="text-ink">{risque.impact}</span></span>
            <span>Probabilité : <span className="text-ink">{risque.probabilite}</span></span>
            <span>Statut : <span className="text-ink">{risque.statut}</span></span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-line p-6 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">Ajouter une action corrective</h2>
          {erreur && <p className="text-danger text-sm mb-3">{erreur}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Titre de l'action" value={titre} onChange={(e) => setTitre(e.target.value)} required
                className="flex-1 min-w-[220px] px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm" />
              <input type="date" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)}
                className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm font-mono" />
            </div>
            <textarea placeholder="Description de l'action" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm min-h-[60px]" />
            <button type="submit" className="px-5 py-2 bg-ink text-white text-sm font-medium cursor-pointer hover:bg-[#0d1729]">
              Ajouter l'action
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Titre</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Description</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft font-mono">Échéance</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Statut</th>
              </tr>
            </thead>
            <tbody>
              {risque.actions_correctives.map((action) => (
                <tr key={action.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink font-medium">{action.titre}</td>
                  <td className="px-4 py-3 text-ink-soft">{action.description || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{action.date_echeance || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={action.statut}
                      onChange={(e) => handleChangeStatutAction(action.id, e.target.value)}
                      className="px-2 py-1 border border-line text-xs bg-paper focus:border-accent outline-none"
                    >
                      <option value="Ouverte">Ouverte</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminée">Terminée</option>
                    </select>
                  </td>
                </tr>
              ))}
              {risque.actions_correctives.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-ink-soft text-sm">Aucune action corrective définie.</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}

export default RisqueDetail