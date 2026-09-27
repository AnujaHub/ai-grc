import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getJournalAudit } from '../services/journalAuditService'

const COULEUR_ACTION = {
  connexion: 'text-ink-soft',
  creation: 'text-accent',
  modification: 'text-warning',
  finalisation: 'text-accent',
  suppression: 'text-danger',
}

const LIBELLE_ACTION = {
  connexion: 'Connexion',
  creation: 'Création',
  modification: 'Modification',
  finalisation: 'Finalisation',
  suppression: 'Suppression',
}

const TYPES_RESSOURCE = ['Organisation', 'Evaluation', 'Risque', 'Utilisateur']

function JournalAudit() {
  const [entrees, setEntrees] = useState([])
  const [filtreType, setFiltreType] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => { chargerJournal() }, [filtreType])

  const chargerJournal = async () => {
    try {
      const data = await getJournalAudit(filtreType || null)
      setEntrees(data)
    } catch (err) {
      setErreur('Accès refusé — cette page est réservée aux administrateurs et auditeurs.')
    }
  }

  if (erreur) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-danger text-sm bg-danger-soft border border-danger/20 px-4 py-3">{erreur}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl text-ink mb-1">Journal d'audit</h1>
        <p className="text-ink-soft text-sm mb-6">
          Historique des actions réalisées sur la plateforme — traçabilité complète (NFR-013).
        </p>

        <div className="mb-4 flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Filtrer par ressource</label>
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            className="px-3 py-1.5 border border-line text-sm bg-white focus:border-accent outline-none"
          >
            <option value="">Toutes</option>
            {TYPES_RESSOURCE.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft font-mono">Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Utilisateur</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Action</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Ressource</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Détails</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft whitespace-nowrap">
                    {new Date(e.date_action).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-ink">{e.utilisateur_email || 'Système'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs font-medium ${COULEUR_ACTION[e.action] || 'text-ink'}`}>
                      {LIBELLE_ACTION[e.action] || e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{e.ressource_type}</td>
                  <td className="px-4 py-3 text-ink-soft text-xs">{e.details || '—'}</td>
                </tr>
              ))}
              {entrees.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-ink-soft text-sm">Aucune entrée dans le journal.</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}

export default JournalAudit