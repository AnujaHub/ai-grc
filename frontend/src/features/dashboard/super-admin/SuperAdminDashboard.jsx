import { Link } from 'react-router-dom'
import { Building2, Users, UserPlus, Gauge, Cpu, HardDrive } from 'lucide-react'
import { Button } from '../../../components/ui'
import DashboardState from '../components/DashboardState'
import DashboardHeader from '../components/DashboardHeader'
import KpiCard from '../components/KpiCard'
import SectionCard from '../components/SectionCard'
import DonutChart from '../components/DonutChart'
import ActivityFeed from '../components/ActivityFeed'
import ProgressBar from '../components/ProgressBar'
import useDashboardData from '../hooks/useDashboardData'
import { getSuperAdminDashboard } from '../services/dashboardMockService'
import ComplianceByOrgChart from './ComplianceByOrgChart'
import PendingRegistrations from './PendingRegistrations'
import OrganisationsTable from './OrganisationsTable'

function SuperAdminDashboard() {
  const { data, loading, error, reload } = useDashboardData(getSuperAdminDashboard)

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <DashboardHeader
            roleLabel="Super admin"
            subtitle="Platform-wide overview across all organisations."
            actions={
              <>
                <Link to="/organizations"><Button><Building2 className="h-4 w-4" /> Add organisation</Button></Link>
              </>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <KpiCard className="xl:col-span-2" icon={Building2} label="Organisations" value={data.kpis.organisations.total}
              hint={`${data.kpis.organisations.active} active`} />
            <KpiCard icon={Users} label="Users" value={data.kpis.users.total} tone="info"
              trend={{ up: true, good: true, text: `+${data.kpis.users.newThisMonth}` }} hint="this month" delay={0.05} />
            <KpiCard icon={UserPlus} label="Pending sign-ups" value={data.kpis.pendingRegistrations} tone="warning" hint="awaiting approval" delay={0.1} />
            <KpiCard icon={Gauge} label="Avg. compliance" value={data.kpis.averageCompliance.value} suffix="%"
              trend={{ up: true, good: true, text: `+${data.kpis.averageCompliance.change}%` }} hint="vs last quarter" delay={0.15} />
            <KpiCard icon={Cpu} label="AI systems" value={data.kpis.aiSystems} tone="info" hint="registered" delay={0.2} />
            <div className="rounded-xl border border-line bg-paper-dark p-5 sm:col-span-2 xl:col-span-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-ink-soft"><HardDrive className="h-4 w-4" /> Platform storage</span>
                <span className="font-mono text-ink">
                  {data.kpis.storage.usedGb} GB <span className="text-ink-soft">/ {data.kpis.storage.limitGb} GB</span>
                </span>
              </div>
              <ProgressBar value={(data.kpis.storage.usedGb / data.kpis.storage.limitGb) * 100} tone="info" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title="Compliance by organisation" subtitle="Current score against the 93 controls" className="lg:col-span-2">
              <ComplianceByOrgChart data={data.complianceByOrganisation} />
            </SectionCard>
            <SectionCard title="Users by role" action={{ label: 'Manage', to: '/users' }}>
              <DonutChart data={data.roleDistribution} centerLabel="users" />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title="Pending registrations" subtitle="Approve or reject new accounts" action={{ label: 'View all', to: '/users' }}>
              <PendingRegistrations items={data.pendingRegistrations} />
            </SectionCard>
            <SectionCard title="Organisations" action={{ label: 'View all', to: '/organizations' }} className="lg:col-span-2">
              <OrganisationsTable items={data.organisations} />
            </SectionCard>
          </div>

          <SectionCard title="Recent platform activity" action={{ label: 'Audit log', to: '/audit-log' }}>
            <ActivityFeed items={data.activity} />
          </SectionCard>
        </>
      )}
    </DashboardState>
  )
}

export default SuperAdminDashboard
