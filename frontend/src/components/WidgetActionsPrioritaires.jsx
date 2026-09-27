import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const COULEUR_NIVEAU = {
  'Élevé': 'bg-danger-soft text-danger',
  'Moyen': 'bg-warning-soft text-warning',
  'Faible': 'bg-accent-soft text-accent',
}

function WidgetActionsPrioritaires({ actions, delai = 0 }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delai, ease: 'easeOut' }}
      className="bg-white border border-line p-6"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">
        Actions prioritaires
      </h3>

      {actions.length === 0 ? (
        <p className="text-ink-soft text-sm py-4">Aucune action en attente. Tout est à jour.</p>
      ) : (
        <ul className="space-y-2.5">
          {actions.map((action) => (
            <li key={action.id} className="flex items-start justify-between gap-3 pb-2.5 border-b border-line last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{action.titre}</p>
                <p className="text-xs text-ink-soft mt-0.5 truncate">Lié à : {action.risque_titre}</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 text-xs font-mono font-medium ${COULEUR_NIVEAU[action.niveau_risque] || ''}`}>
                  {action.niveau_risque}
                </span>
                {action.en_retard && (
                  <span className="text-xs font-mono text-danger font-semibold">En retard</span>
                )}
                {!action.en_retard && action.date_echeance && (
                  <span className="text-xs font-mono text-ink-soft">{action.date_echeance}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => navigate('/risques')}
        className="text-xs text-accent hover:underline cursor-pointer mt-4"
      >
        Voir tous les risques →
      </button>
    </motion.div>
  )
}

export default WidgetActionsPrioritaires