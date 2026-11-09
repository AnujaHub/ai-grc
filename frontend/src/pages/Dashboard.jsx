import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import ComplianceBadge from '../components/CachetConformite'
import { getDashboardStats, getScoresParSysteme, getNonConformitesParDepartement } from '../services/dashboardService'
import { getOrganisations } from '../services/organisationService'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import PriorityActionsWidget from '../components/WidgetActionsPrioritaires'
import { getActionsPrioritaires } from '../services/dashboardService'


const COULEURS_GRAPHIQUE = ['#fb7185', '#f5b85b', '#38d9c2']

function CarteGraphique({ titre, children, delai = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delai, ease: 'easeOut' }}
      className="bg-white border border-line rounded-xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">{titre}</h3>
      {children}
    </motion.div>
  )
}

function Dashboard() {
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'))
  const [organizations, setOrganizations] = useState([])
  const [organisationId, setOrganisationId] = useState('')

  const [stats, setStats] = useState(null)
  const [scoresParSysteme, setScoresParSysteme] = useState([])
  const [nonConformitesParDept, setNonConformitesParDept] = useState([])
  const [actionsPrioritaires, setActionsPrioritaires] = useState([])
  const [error, setError] = useState('')
  const emptyStats = {
    nb_organisations: 0,
    nb_systemes_ia: 0,
    nb_evaluations: 0,
    nb_evaluations_terminees: 0,
    nb_evaluations_en_cours: 0,
    score_moyen_conformite: 0,
    risques: { eleve: 0, moyen: 0, faible: 0, ouverts: 0 },
    actions_correctives: { ouvertes: 0, terminees: 0, en_retard: 0 },
  }

  const loadOrganizations = useCallback(async () => {
    try {
      const data = await getOrganisations()
      setOrganizations(data)
    } catch {
      setError('Unable to load organizations')
    }
  }, [])

  const chargerStats = useCallback(async () => {
    try {
      const [statsData, scoresData, deptData, actionsData] = await Promise.all([
        getDashboardStats(organisationId || null),
        getScoresParSysteme(organisationId || null),
        getNonConformitesParDepartement(organisationId || null),
        getActionsPrioritaires(organisationId || null),
      ])
      setStats({ ...emptyStats, ...statsData, risques: { ...emptyStats.risques, ...statsData?.risques }, actions_correctives: { ...emptyStats.actions_correctives, ...statsData?.actions_correctives } })
      setScoresParSysteme(scoresData)
      setNonConformitesParDept(deptData)
      setActionsPrioritaires(actionsData)
    } catch {
      setError('Unable to load statistics')
    }
  }, [organisationId])

  useEffect(() => { loadOrganizations() }, [loadOrganizations])
  useEffect(() => { chargerStats() }, [chargerStats])

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-10 text-danger">{error}</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-10 text-ink-soft font-mono text-sm">Loading...</div>
      </div>
    )
  }

  const donneesRisques = [
    { name: 'High', value: stats.risques?.eleve ?? 0 },
    { name: 'Medium', value: stats.risques?.moyen ?? 0 },
    { name: 'Low', value: stats.risques?.faible ?? 0 },
  ]
  const donneesEvaluations = [
    { name: 'Completed', valeur: stats.nb_evaluations_terminees },
    { name: 'In progress', valeur: stats.nb_evaluations_en_cours },
  ]
  const donneesActions = [
    { name: 'Open', valeur: stats.corrective_actions?.ouvertes ?? 0 },
    { name: 'Completed', valeur: stats.corrective_actions?.terminees ?? 0 },
    { name: 'Overdue', valeur: stats.corrective_actions?.en_retard ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-accent text-xs font-mono uppercase tracking-[0.18em] mb-2">Control center</p>
            <h1 className="font-display text-3xl font-semibold text-ink">AI governance overview</h1>
            {utilisateur && (
              <p className="text-ink-soft mt-1 text-sm">
                {utilisateur.prenom} {utilisateur.nom}
                <span className="ml-1 font-mono text-xs capitalize">— {utilisateur.role?.replace('_', ' ')}</span>
              </p>
            )}
          </div>
          <ComplianceBadge score={stats.score_moyen_conformite ?? 0} taille={100} />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Organization</label>
          <select
            value={organisationId}
            onChange={(e) => setOrganisationId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-line text-sm focus:border-accent outline-none bg-white"
          >
            <option value="">All organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.nom}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <StatCard titre="Organizations" valeur={stats.nb_organisations} delai={0} />
          <StatCard titre="AI systems" valeur={stats.nb_systemes_ia} delai={0.05} />
          <StatCard titre="Assessments" valeur={stats.nb_evaluations} delai={0.1} />
          <StatCard titre="Open risks" valeur={stats.risques?.ouverts ?? 0} couleur="danger" delai={0.15} />
          <StatCard titre="Overdue actions" valeur={stats.corrective_actions?.en_retard ?? 0} couleur="warning" delai={0.2} />
        </div>

        <div className="mb-8">
          <PriorityActionsWidget actions={actionsPrioritaires} delai={0.25} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <CarteGraphique titre="Risk distribution by level" delai={0.1}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={donneesRisques} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={85}>
                  {donneesRisques.map((entry, index) => (
                    <Cell key={index} fill={COULEURS_GRAPHIQUE[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #e2e0d8', fontFamily: 'Public Sans' }} />
                <Legend wrapperStyle={{ fontFamily: 'Public Sans', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </CarteGraphique>

          <CarteGraphique titre="AI system compliance score" delai={0.15}>
            {scoresParSysteme.length === 0 ? (
              <p className="text-ink-soft text-sm py-16 text-center">No completed assessments yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoresParSysteme}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d8" />
                  <XAxis dataKey="systeme_nom" tick={{ fontSize: 12, fontFamily: 'Public Sans' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip contentStyle={{ border: '1px solid #e2e0d8', fontFamily: 'Public Sans' }} />
                  <Bar dataKey="score" fill="#38d9c2" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CarteGraphique>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CarteGraphique titre="Assessment status" delai={0.2}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={donneesEvaluations}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d8" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Public Sans' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                <Tooltip contentStyle={{ border: '1px solid #e2e0d8', fontFamily: 'Public Sans' }} />
                <Bar dataKey="valeur" fill="#8b7cf6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CarteGraphique>

          <CarteGraphique titre="Corrective actions" delai={0.25}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={donneesActions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d8" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Public Sans' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                <Tooltip contentStyle={{ border: '1px solid #e2e0d8', fontFamily: 'Public Sans' }} />
                <Bar dataKey="valeur" fill="#f5b85b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CarteGraphique>

          <CarteGraphique titre="Non-conformities by department" delai={0.3}>
            {nonConformitesParDept.length === 0 ? (
              <p className="text-ink-soft text-sm py-14 text-center">No non-conformities detected.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={nonConformitesParDept}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d8" />
                  <XAxis dataKey="departement" angle={-25} textAnchor="end" height={60} interval={0} tick={{ fontSize: 10, fontFamily: 'Public Sans' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip contentStyle={{ border: '1px solid #e2e0d8', fontFamily: 'Public Sans' }} />
                  <Bar dataKey="nombre" fill="#fb7185" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CarteGraphique>
        </div>

      </div>
    </div>
  )
}

export default Dashboard