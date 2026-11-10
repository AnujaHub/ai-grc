import { getRapports } from '../../services/reportService'
import { getEvaluations } from '../../services/evaluationService'
import { getSystemesIA } from '../../services/aiSystemService'
import { getOrganisations } from '../../services/organizationService'
import { getReferentiels } from '../../services/frameworkService'

export const scoreOf = (report) => {
  const value = report.global_score ?? report.score_global
  return value === null || value === undefined ? null : Number(value)
}

export const scoreBand = (score) => (score === null ? 'none' : score >= 70 ? 'compliant' : score >= 40 ? 'monitor' : 'critical')

export const SCORE_BANDS = [
  { value: 'compliant', label: 'Compliant (70% and above)' },
  { value: 'monitor', label: 'Monitor (40–69%)' },
  { value: 'critical', label: 'Critical (below 40%)' },
]

export async function loadReports() {
  const [reports, evaluations, systems, organizations, frameworks] = await Promise.all([
    getRapports(), getEvaluations(), getSystemesIA(), getOrganisations(), getReferentiels().catch(() => []),
  ])
  const name = (list, id) => list.find((x) => x.id === id)?.nom
  const rows = reports.map((r) => {
    const ev = evaluations.find((e) => e.id === r.evaluation_id)
    const system = ev && systems.find((s) => s.id === ev.systeme_ia_id)
    const orgId = ev?.evaluation_type === 'Organisation' ? ev.organisation_id : system?.organisation_id
    return {
      id: r.id,
      evaluationId: r.evaluation_id,
      referentielId: ev?.referentiel_id,
      target: ev ? (ev.evaluation_type === 'Organisation' ? 'Organization-wide governance' : system?.nom || 'Unknown AI system') : 'Unknown assessment',
      kind: ev?.evaluation_type === 'Organisation' ? 'organization' : 'system',
      organisation: name(organizations, orgId) || '—',
      framework: name(frameworks, ev?.referentiel_id) || '—',
      score: scoreOf(r),
      generatedAt: r.generation_date,
      fileName: (r.file_path || '').split(/[\\/]/).pop() || `report_${r.id}.pdf`,
    }
  })
  const reportable = evaluations
    .filter((e) => e.statut === 'Terminée')
    .map((e) => ({
      id: e.id,
      label: `${e.evaluation_type === 'Organisation' ? name(organizations, e.organisation_id) || 'Organization' : name(systems, e.systeme_ia_id) || 'AI system'} · ${name(frameworks, e.referentiel_id) || 'framework'} · ${e.score ?? '—'}%`,
    }))
  return { rows, reportable }
}
