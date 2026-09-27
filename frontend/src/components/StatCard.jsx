import { motion } from 'framer-motion'

function StatCard({ titre, valeur, couleur = 'ink', delai = 0 }) {
  const couleurTexte = {
    ink: 'text-ink',
    accent: 'text-accent',
    warning: 'text-warning',
    danger: 'text-danger',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delai, ease: 'easeOut' }}
      className="bg-white border border-line p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">{titre}</p>
      <p className={`font-mono text-3xl font-semibold ${couleurTexte[couleur]}`}>{valeur}</p>
    </motion.div>
  )
}

export default StatCard