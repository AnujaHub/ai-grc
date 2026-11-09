import { Link } from 'react-router-dom'
import { Gauge, ListChecks, ClipboardList, BadgeCheck, Users, ClipboardCheck } from 'lucide-react'
import { Button } from '../../../components/ui'
import DashboardState from '../components/DashboardState'
import DashboardHeader from '../components/DashboardHeader'
import KpiCard from '../components/KpiCard'
import SectionCard from '../components/SectionCard'
import DonutChart from '../components/DonutChart'
import ActivityFeed from '../components/ActivityFeed'
import DeadlineList from '../components/DeadlineList'
import { getCurrentUser, getFullName } from '../../../utils/roles'
import useDashboardData from '../hooks/useDashboardData'
import { getAdminDashboard } from '../services/dashboardMockService'
import DomainCompliance from './DomainCompliance'
import ApprovalQueue from './ApprovalQueue'
import TaskOverview from './TaskOverview'
import TeamWorkload from './TeamWorkload'

const CONTROL_STATUS_COLORS = ['#38d9c2', '#7dd3fc', '#64748b', '#fb7185']

function AdminDashboard() {
  const { data, loading, error, reload } = useDashboardData(getAdminDashboard)

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <DashboardHeader
            roleLabel={`Admin · ${data.organisation}`}
            subtitle="Compliance, approvals and team progress for your organisation."
            actions={
              <>
                <Link to="/evaluations"><Button><ClipboardCheck className="h-4 w-4" /> Start assessment</Button></Link>
              </>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard icon={Gauge} label="Compliance score" value={data.kpis.complianceScore.value} suffix="%"
              trend={{ up: true, good: true, text: `+${data.kpis.complianceScore.change}%` }} hint="vs last quarter" />
            <KpiCard icon={ListChecks} label="Controls" value={data.kpis.controls.implemented} suffix={`/ ${data.kpis.controls.total}`}
              hint="implemented" tone="info" delay={0.05} />
            <KpiCard icon={ClipboardList} label="Open tasks" value={data.kpis.tasks.open} tone="warning"
              hint={<span className="text-danger">{data.kpis.tasks.overdue} overdue</span>} delay={0.1} />
            <KpiCard icon={BadgeCheck} label="Pending approvals" value={data.kpis.pendingApprovals} tone="warning" hint="need your review" delay={0.15} />
            <KpiCard icon={Users} label="Active users" value={data.kpis.users.active} suffix={`/ ${data.kpis.users.total}`}
              tone="info" hint="in your organisation" delay={0.2} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title="Compliance by domain" subtitle="Lowest-scoring domains first" action={{ label: 'Assessments', to: '/evaluations' }} className="lg:col-span-2">
              <DomainCompliance domains={data.domainCompliance} />
            </SectionCard>
            <div className="space-y-4">
              <SectionCard title="Control status" subtitle={`${data.kpis.controls.total} controls`}>
                <DonutChart data={data.controlStatus} colors={CONTROL_STATUS_COLORS} centerValue={`${data.kpis.complianceScore.value}%`} centerLabel="compliant" />
              </SectionCard>
              <SectionCard title="Tasks">
                <TaskOverview data={data.tasksByStatus} />
              </SectionCard>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Approval requests" subtitle="Evidence, policies, registrations and risk acceptances">
              <ApprovalQueue items={data.approvals} currentUserName={getFullName(getCurrentUser())} />
            </SectionCard>
            <SectionCard title="Upcoming deadlines">
              <DeadlineList items={data.deadlines} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Team workload" action={{ label: 'Manage users', to: '/utilisateurs' }}>
              <TeamWorkload members={data.team} />
            </SectionCard>
            <SectionCard title="Recent activity" action={{ label: 'Audit log', to: '/journal-audit' }}>
              <ActivityFeed items={data.activity} />
            </SectionCard>
          </div>
        </>
      )}
    </DashboardState>
  )
}

export default AdminDashboard
