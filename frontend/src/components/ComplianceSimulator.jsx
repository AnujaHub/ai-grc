import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, FlaskConical } from 'lucide-react'
import ComplianceBadge from './ComplianceBadge'
import { displayLabel } from '../utils/displayLabels'
import StatusBadge from './ui/StatusBadge'

const SCORE_PAR_REPONSE = {
  Conforme: 100,
  'Partiellement conforme': 50,
  'Non conforme': 0,
  'Non applicable': null,
}

const average = (values) => {
  const valid = values.filter((v) => v !== null && v !== undefined)
  if (!valid.length) return 0
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100
}

function ComplianceSimulator({ reponses, chapitresFiltres }) {
  const [corrigees, setCorrigees] = useState(new Set())
  const [open, setOpen] = useState(false)

  const ecarts = useMemo(
    () =>
      chapitresFiltres.flatMap((chapitre) =>
        chapitre.clauses
          .map((clause) => ({ clause, reponse: reponses.find((r) => r.clause_id === clause.id) }))
          .filter(({ reponse }) => reponse && (reponse.reponse === 'Non conforme' || reponse.reponse === 'Partiellement conforme'))
          .map(({ clause, reponse }) => ({ clauseId: clause.id, titre: clause.titre, numero: clause.numero, reponseActuelle: reponse.reponse })),
      ),
    [reponses, chapitresFiltres],
  )

  const scoreActuel = useMemo(() => average(reponses.map((r) => SCORE_PAR_REPONSE[r.reponse])), [reponses])
  const scoreProjete = useMemo(
    () => average(reponses.map((r) => (corrigees.has(r.clause_id) ? 100 : SCORE_PAR_REPONSE[r.reponse]))),
    [reponses, corrigees],
  )

  const toggle = (clauseId) =>
    setCorrigees((prev) => {
      const next = new Set(prev)
      if (next.has(clauseId)) next.delete(clauseId)
      else next.add(clauseId)
      return next
    })

  if (ecarts.length === 0) return null

  const gain = Math.round((scoreProjete - scoreActuel) * 100) / 100
  const allSelected = corrigees.size === ecarts.length

  return (
    <section className="rounded-xl border border-line bg-paper-dark">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer">
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300"><FlaskConical className="h-4 w-4" /></span>
          <span>
            <span className="block text-sm font-semibold text-ink">What-if simulator</span>
            <span className="block text-xs text-ink-soft">{ecarts.length} gaps found. See how fixing them would change the score.</span>
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="grid grid-cols-1 gap-6 border-t border-line p-5 lg:grid-cols-[18rem_1fr]">
              <div className="flex items-center justify-center gap-4 rounded-xl border border-line bg-paper p-4">
                <div className="text-center">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Current</p>
                  <ComplianceBadge score={scoreActuel} taille={84} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="h-5 w-5 text-ink-soft" />
                  {gain !== 0 && (
                    <motion.span key={gain} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-xs font-semibold text-accent">
                      +{gain} pts
                    </motion.span>
                  )}
                </div>
                <div className="text-center">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Projected</p>
                  <ComplianceBadge score={scoreProjete} taille={84} />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Gaps to fix (simulation only)</p>
                  <button type="button" onClick={() => setCorrigees(allSelected ? new Set() : new Set(ecarts.map((e) => e.clauseId)))} className="text-xs font-medium text-accent hover:underline cursor-pointer">
                    {allSelected ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {ecarts.map((e) => (
                    <li key={e.clauseId}>
                      <label className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${corrigees.has(e.clauseId) ? 'border-accent/50 bg-accent-soft' : 'border-line hover:border-accent/40'}`}>
                        <input type="checkbox" checked={corrigees.has(e.clauseId)} onChange={() => toggle(e.clauseId)} className="h-4 w-4 accent-[#38d9c2]" />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="mr-2 font-mono text-xs text-ink-soft">{e.numero}</span>
                          <span className="text-ink">{e.titre}</span>
                        </span>
                        <StatusBadge status={e.reponseActuelle === 'Non conforme' ? 'overdue' : 'pending'} label={displayLabel(e.reponseActuelle)} />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default ComplianceSimulator
