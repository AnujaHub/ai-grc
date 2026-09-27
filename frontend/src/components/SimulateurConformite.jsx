import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CachetConformite from './CachetConformite'

const SCORE_PAR_REPONSE = {
  'Conforme': 100,
  'Partiellement conforme': 50,
  'Non conforme': 0,
  'Non applicable': null,
}

function SimulateurConformite({ reponses, chapitresFiltres }) {
  const [clausesCorrigees, setClausesCorrigees] = useState(new Set())
  const [ouvert, setOuvert] = useState(false)

  // Construit la liste des clauses en écart (Non conforme / Partiellement conforme), avec leur titre
  const clausesEnEcart = useMemo(() => {
    const resultat = []
    chapitresFiltres.forEach((chapitre) => {
      chapitre.clauses.forEach((clause) => {
        const reponse = reponses.find((r) => r.clause_id === clause.id)
        if (reponse && (reponse.reponse === 'Non conforme' || reponse.reponse === 'Partiellement conforme')) {
          resultat.push({
            clauseId: clause.id,
            titre: clause.titre,
            numero: clause.numero,
            reponseActuelle: reponse.reponse,
          })
        }
      })
    })
    return resultat
  }, [reponses, chapitresFiltres])

  const scoreActuel = useMemo(() => {
    const valeurs = reponses
      .map((r) => SCORE_PAR_REPONSE[r.reponse])
      .filter((v) => v !== null && v !== undefined)
    if (valeurs.length === 0) return 0
    return Math.round((valeurs.reduce((a, b) => a + b, 0) / valeurs.length) * 100) / 100
  }, [reponses])

  const scoreProjete = useMemo(() => {
    const valeurs = reponses.map((r) => {
      if (clausesCorrigees.has(r.clause_id)) return 100
      return SCORE_PAR_REPONSE[r.reponse]
    }).filter((v) => v !== null && v !== undefined)
    if (valeurs.length === 0) return 0
    return Math.round((valeurs.reduce((a, b) => a + b, 0) / valeurs.length) * 100) / 100
  }, [reponses, clausesCorrigees])

  const toggleClause = (clauseId) => {
    setClausesCorrigees((prev) => {
      const copie = new Set(prev)
      if (copie.has(clauseId)) copie.delete(clauseId)
      else copie.add(clauseId)
      return copie
    })
  }

  if (clausesEnEcart.length === 0) return null

  const gain = Math.round((scoreProjete - scoreActuel) * 100) / 100

  return (
    <div className="bg-white border border-line mb-8">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="w-full flex items-center justify-between px-6 py-4 cursor-pointer"
      >
        <div className="text-left">
          <p className="font-display text-lg text-ink">Simulateur « Et si... »</p>
          <p className="text-ink-soft text-xs mt-0.5">
            Estime l'impact de la correction des non-conformités sur ton score
          </p>
        </div>
        <span className="font-mono text-ink-soft text-sm">{ouvert ? '−' : '+'}</span>
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-line pt-6">
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">Score actuel</p>
                  <CachetConformite score={scoreActuel} taille={90} />
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-2xl text-ink-soft">→</span>
                  {gain !== 0 && (
                    <motion.span
                      key={gain}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`font-mono text-sm font-semibold ${gain > 0 ? 'text-accent' : 'text-ink-soft'}`}
                    >
                      {gain > 0 ? '+' : ''}{gain} pts
                    </motion.span>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">Score projeté</p>
                  <CachetConformite score={scoreProjete} taille={90} />
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-3">
                Cocher les non-conformités à corriger (simulation)
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {clausesEnEcart.map((clause) => (
                  <label
                    key={clause.clauseId}
                    className="flex items-start gap-3 text-sm border border-line px-3 py-2 cursor-pointer hover:bg-paper"
                  >
                    <input
                      type="checkbox"
                      checked={clausesCorrigees.has(clause.clauseId)}
                      onChange={() => toggleClause(clause.clauseId)}
                      className="mt-0.5 accent-accent"
                    />
                    <span className="flex-1">
                      <span className="font-mono text-ink-soft mr-2">{clause.numero}</span>
                      <span className="text-ink">{clause.titre}</span>
                      <span className={`ml-2 text-xs font-mono ${clause.reponseActuelle === 'Non conforme' ? 'text-danger' : 'text-warning'}`}>
                        ({clause.reponseActuelle})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SimulateurConformite