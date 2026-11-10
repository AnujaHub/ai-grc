import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getConfigurationRisque, updateConfigurationRisque } from '../services/riskConfigurationService'
import { displayLabel } from '../utils/displayLabels'

function RiskConfiguration() {
  const { organisationId } = useParams()
  const navigate = useNavigate()

  const [impactLevels, setImpactLevels] = useState([])
  const [probabilityLevels, setProbabilityLevels] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmation, setConfirmation] = useState(false)

  useEffect(() => { chargerConfiguration() }, [organisationId])

  const chargerConfiguration = async () => {
    try {
      const data = await getConfigurationRisque(organisationId)
      setImpactLevels(data.impact_levels)
      setProbabilityLevels(data.probability_levels)
      setLoading(false)
    } catch (err) {
      setError('Unable to load risk configuration')
      setLoading(false)
    }
  }

  const appliquerPreset = (nombreNiveaux) => {
    const presets = {
      3: { impact: ['Faible', 'Moyen', 'Élevé'], probabilite: ['Faible', 'Moyen', 'Élevée'] },
      4: { impact: ['Faible', 'Modéré', 'Élevé', 'Critique'], probabilite: ['Rare', 'Possible', 'Probable', 'Quasi certaine'] },
      5: { impact: ['Très faible', 'Faible', 'Modéré', 'Élevé', 'Critique'], probabilite: ['Très rare', 'Rare', 'Possible', 'Probable', 'Quasi certaine'] },
    }
    setImpactLevels(presets[nombreNiveaux].impact)
    setProbabilityLevels(presets[nombreNiveaux].probabilite)
  }

  const handleChangeNiveau = (liste, setListe, index, valeur) => {
    const copie = [...liste]
    copie[index] = valeur
    setListe(copie)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateConfigurationRisque(organisationId, impactLevels, probabilityLevels)
      setConfirmation(true)
      setTimeout(() => setConfirmation(false), 2500)
    } catch (err) {
      alert('Save failed')
    }
  }

  if (loading) return <div><Navbar /><div className="max-w-2xl mx-auto px-6 py-10 text-ink-soft font-mono text-sm">Loading...</div></div>

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/organizations')} className="text-sm text-ink-soft hover:text-ink mb-6 cursor-pointer">
          ← Back to organizations
        </button>

        <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Risk management</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Risk matrix</h1>
        <p className="text-ink-soft text-sm mb-6">
          Customize the levels used to assess impact and probability for this organization.
        </p>

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-3">Quick presets</p>
          <div className="flex gap-2 mb-6">
            <button onClick={() => appliquerPreset(3)} className="px-4 py-1.5 border border-line text-sm text-ink cursor-pointer hover:border-ink">
              3 levels
            </button>
            <button onClick={() => appliquerPreset(4)} className="px-4 py-1.5 border border-line text-sm text-ink cursor-pointer hover:border-ink">
              4 levels
            </button>
            <button onClick={() => appliquerPreset(5)} className="px-4 py-1.5 border border-line text-sm text-ink cursor-pointer hover:border-ink">
              5 levels
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
              Impact levels <span className="font-normal normal-case text-ink-soft">(lowest to highest)</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {impactLevels.map((niveau, index) => (
                <input
                  key={index}
                  type="text"
                  value={displayLabel(niveau)}
                  onChange={(e) => handleChangeNiveau(impactLevels, setImpactLevels, index, e.target.value)}
                  className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm w-36"
                />
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
              Probability levels <span className="font-normal normal-case text-ink-soft">(lowest to highest)</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {probabilityLevels.map((niveau, index) => (
                <input
                  key={index}
                  type="text"
                  value={displayLabel(niveau)}
                  onChange={(e) => handleChangeNiveau(probabilityLevels, setProbabilityLevels, index, e.target.value)}
                  className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm w-36"
                />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button type="submit" className="btn-primary px-5 py-2 text-sm cursor-pointer">
                Save configuration
              </button>
              {confirmation && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-accent text-sm font-medium"
                >
                  Configuration saved
                </motion.span>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default RiskConfiguration