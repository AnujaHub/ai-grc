import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const ICON_TONES = {
  accent: 'bg-accent-soft text-accent',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-sky-400/10 text-sky-300',
}

function KpiCard({ icon: Icon, label, value, suffix, hint, trend, tone = 'accent', delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-xl border border-line bg-paper-dark p-5 hover:border-accent/40 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${ICON_TONES[tone]}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="font-mono text-3xl font-semibold text-ink">
        {value}
        {suffix && <span className="ml-1 text-base text-ink-soft">{suffix}</span>}
      </p>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        {trend && (
          <span className={`inline-flex items-center gap-1 font-medium ${trend.good ? 'text-accent' : 'text-danger'}`}>
            {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend.text}
          </span>
        )}
        {hint && <span className="text-ink-soft">{hint}</span>}
      </div>
    </motion.div>
  )
}

export default KpiCard
