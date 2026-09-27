import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getConfigurationRisque, updateConfigurationRisque } from '../services/configurationRisqueService'

function ConfigurationRisque() {
  const { organisationId } = useParams()
  const navigate = useNavigate()

  const [niveauxImpact, setNiveauxImpact] = useState([])
  const [niveauxProbabilite, setNiveauxProbabilite] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [confirmation, setConfirmation] = useState(false)

  useEffect(() => { chargerConfiguration() }, [organisationId])

  const chargerConfiguration = async () => {
    try {
      const data = await getConfigurationRisque(organisationId)
      setNiveauxImpact(data.niveaux_impact)
      setNiveauxProbabilite(data.niveaux_probabilite)
      setChargement(false)
    } catch (err) {
      setErreur('Impossible de charger la configuration')
      setChargement(false)
    }
  }

  const appliquerPreset = (nombreNiveaux) => {
    const presets = {
      3: { impact: ['Faible', 'Moyen', 'Élevé'], probabilite: ['Faible', 'Moyen', 'Élevée'] },
      4: { impact: ['Faible', 'Modéré', 'Élevé', 'Critique'], probabilite: ['Rare', 'Possible', 'Probable', 'Quasi certaine'] },
      5: { impact: ['Très faible', 'Faible', 'Modéré', 'Élevé', 'Critique'], probabilite: ['Très rare', 'Rare', 'Possible', 'Probable', 'Quasi certaine'] },
    }
    setNiveauxImpact(presets[nombreNiveaux].impact)
    setNiveauxProbabilite(presets[nombreNiveaux].probabilite)
  }

  const handleChangeNiveau = (liste, setListe, index, valeur) => {
    const copie = [...liste]
    copie[index] = valeur
    setListe(copie)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateConfigurationRisque(organisationId, niveauxImpact, niveauxProbabilite)
      setConfirmation(true)
      setTimeout(() => setConfirmation(false), 2500)
    } catch (err) {
      alert('Erreur lors de l\'enregistrement')
    }
  }

  if (chargement) return <div><Navbar /><div className="max-w-2xl mx-auto px-6 py-10 text-ink-soft font-mono text-sm">Chargement...</div></div>

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/organisations')} className="text-sm text-ink-soft hover:text-ink mb-6 cursor-pointer">
          ← Retour aux organisations
        </button>

        <h1 className="font-display text-2xl text-ink mb-1">Matrice de risque</h1>
        <p className="text-ink-soft text-sm mb-6">
          Personnalise le nombre de niveaux utilisés pour évaluer l'impact et la probabilité des risques de cette organisation.
        </p>

        {erreur && <p className="text-danger text-sm mb-4">{erreur}</p>}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-3">Modèles rapides</p>
          <div className="flex gap-2 mb-6">
            <button onClick={() => appliquerPreset(3)} className="px-4 py-1.5 border border-line text-sm text-ink cursor-pointer hover:border-ink">
              3 niveaux
            </button>
            <button onClick={() => appliquerPreset(4)} className="px-4 py-1.5 border border-line text-sm text-ink cursor-pointer hover:border-ink">
              4 niveaux
            </button>
            <button onClick={() => appliquerPreset(5)} className="px-4 py-1.5 border border-line text-sm text-ink cursor-pointer hover:border-ink">
              5 niveaux
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
              Niveaux d'impact <span className="font-normal normal-case text-ink-soft">(du plus faible au plus fort)</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {niveauxImpact.map((niveau, index) => (
                <input
                  key={index}
                  type="text"
                  value={niveau}
                  onChange={(e) => handleChangeNiveau(niveauxImpact, setNiveauxImpact, index, e.target.value)}
                  className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm w-36"
                />
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">
              Niveaux de probabilité <span className="font-normal normal-case text-ink-soft">(du plus faible au plus fort)</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {niveauxProbabilite.map((niveau, index) => (
                <input
                  key={index}
                  type="text"
                  value={niveau}
                  onChange={(e) => handleChangeNiveau(niveauxProbabilite, setNiveauxProbabilite, index, e.target.value)}
                  className="px-3 py-2 border border-line focus:border-accent outline-none bg-paper text-sm w-36"
                />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button type="submit" className="px-5 py-2 bg-ink text-white text-sm font-medium cursor-pointer hover:bg-[#0d1729]">
                Enregistrer la configuration
              </button>
              {confirmation && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-accent text-sm font-medium"
                >
                  ✓ Configuration enregistrée
                </motion.span>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ConfigurationRisque