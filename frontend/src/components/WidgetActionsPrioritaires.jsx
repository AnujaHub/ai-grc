import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { displayLabel } from '../utils/displayLabels'

const COULEUR_NIVEAU = {
  'Élevé': 'bg-danger-soft text-danger',
  'Moyen': 'bg-warning-soft text-warning',
  'Faible': 'bg-accent-soft text-accent',
  High: 'bg-danger-soft text-danger',
  Medium: 'bg-warning-soft text-warning',
  Low: 'bg-accent-soft text-accent',
}

function PriorityActionsWidget({ actions, delai = 0 }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delai, ease: 'easeOut' }}
      className="bg-white border border-line rounded-xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">
        Priority actions
      </h3>

      {actions.length === 0 ? (
        <p className="text-ink-soft text-sm py-4">No pending actions. Everything is up to date.</p>
      ) : (
        <ul className="space-y-2.5">
          {actions.map((action) => (
            <li key={action.id} className="flex items-start justify-between gap-3 pb-2.5 border-b border-line last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{action.titre}</p>
                <p className="text-xs text-ink-soft mt-0.5 truncate">Related to: {action.risque_titre}</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${COULEUR_NIVEAU[action.niveau_risque] || ''}`}>
                  {displayLabel(action.risk_level)}
                </span>
                {action.en_retard && (
                  <span className="text-xs font-mono text-danger font-semibold">Overdue</span>
                )}
                {!action.en_retard && action.due_date && (
                  <span className="text-xs font-mono text-ink-soft">{action.due_date}</span>
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
        View all risks →
      </button>
    </motion.div>
  )
}

export default PriorityActionsWidget