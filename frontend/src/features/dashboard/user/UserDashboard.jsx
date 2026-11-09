import { ListChecks, FileUp, CalendarClock, AlertTriangle } from 'lucide-react'
import { Alert } from '../../../components/ui'
import { ROLES, getCurrentUser } from '../../../utils/roles'
import DashboardState from '../components/DashboardState'
import DashboardHeader from '../components/DashboardHeader'
import KpiCard from '../components/KpiCard'
import SectionCard from '../components/SectionCard'
import DeadlineList from '../components/DeadlineList'
import useDashboardData from '../hooks/useDashboardData'
import { getUserDashboard } from '../services/dashboardMockService'
import MyTasks from './MyTasks'
import EvidenceRequests from './EvidenceRequests'
import MyControls from './MyControls'
import ProgressRing from './ProgressRing'

const buildDeadlines = (data) =>
  [
    ...data.tasks
      .filter((t) => t.status !== 'completed')
      .map((t) => ({ id: `t-${t.id}`, title: t.title, dueDate: t.dueDate, type: 'Task', status: t.status })),
    ...data.evidenceRequests.map((e) => ({ id: `e-${e.id}`, title: `Evidence for ${e.controlName}`, dueDate: e.dueDate, type: 'Evidence', status: 'pending' })),
  ]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

function UserDashboard() {
  const { data, loading, error, reload } = useDashboardData(getUserDashboard)
  const isAuditor = getCurrentUser()?.role === ROLES.AUDITOR

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <DashboardHeader
            roleLabel={isAuditor ? 'Auditor · read-only' : 'My workspace'}
            subtitle={isAuditor ? 'Controls, evidence and deadlines in your audit scope.' : 'Your assigned controls, evidence requests and deadlines.'}
          />

          {isAuditor && (
            <Alert variant="info">
              Read-only access. As an auditor you can review controls, tasks and evidence, but you cannot change or upload them, so your audit stays independent.
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={ListChecks} label={isAuditor ? 'Controls in scope' : 'Assigned controls'} value={data.kpis.assignedControls.total}
              hint={`${data.kpis.assignedControls.implemented} implemented`} />
            <KpiCard icon={FileUp} label="Evidence requests" value={data.kpis.evidenceRequests} tone="info" hint={isAuditor ? 'open in scope' : 'waiting for you'} delay={0.05} />
            <KpiCard icon={CalendarClock} label="Due this week" value={data.kpis.dueThisWeek} tone="warning" hint="tasks & evidence" delay={0.1} />
            <KpiCard icon={AlertTriangle} label="Overdue" value={data.kpis.overdue} tone="danger" hint="needs attention" delay={0.15} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title={isAuditor ? 'Tasks in scope' : 'My tasks'} className="lg:col-span-2">
              <MyTasks tasks={data.tasks} readOnly={isAuditor} />
            </SectionCard>
            <SectionCard title={isAuditor ? 'Scope progress' : 'My progress'} subtitle={isAuditor ? 'Across controls in audit scope' : 'Across your assigned controls'}>
              <div className="flex flex-col items-center gap-4">
                <ProgressRing value={data.progress} />
                <p className="text-center text-sm text-ink-soft">
                  <span className="font-mono text-ink">{data.kpis.assignedControls.implemented}</span> of{' '}
                  <span className="font-mono text-ink">{data.kpis.assignedControls.total}</span> controls implemented
                </p>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Evidence requests" subtitle={isAuditor ? 'Evidence requested for controls in scope' : 'Documents reviewers have asked you for'}>
              <EvidenceRequests items={data.evidenceRequests} readOnly={isAuditor} />
            </SectionCard>
            <SectionCard title="Upcoming deadlines">
              <DeadlineList items={buildDeadlines(data)} />
            </SectionCard>
          </div>

          <SectionCard title={isAuditor ? 'Controls in audit scope' : 'My assigned controls'} action={{ label: 'Assessments', to: '/evaluations' }}>
            <MyControls controls={data.controls} />
          </SectionCard>
        </>
      )}
    </DashboardState>
  )
}

export default UserDashboard
