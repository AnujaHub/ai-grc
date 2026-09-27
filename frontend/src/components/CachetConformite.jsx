import { motion } from 'framer-motion'

function CachetConformite({ score, taille = 130 }) {
  const couleur = score >= 70 ? '#0f6b5c' : score >= 40 ? '#b3541e' : '#9b2c2c'
  const libelle = score >= 70 ? 'CONFORME' : score >= 40 ? 'À SURVEILLER' : 'CRITIQUE'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -6 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: taille, height: taille }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <circle cx="50" cy="50" r="46" fill="none" stroke={couleur} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={couleur} strokeWidth="2" />
      </svg>
      <div className="text-center px-2">
        <p className="font-mono font-bold leading-none" style={{ color: couleur, fontSize: taille * 0.24 }}>
          {score}%
        </p>
        <p className="font-mono uppercase tracking-wider mt-1" style={{ color: couleur, fontSize: taille * 0.075 }}>
          {libelle}
        </p>
      </div>
    </motion.div>
  )
}

export default CachetConformite