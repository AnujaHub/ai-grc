import { ROLES, getCurrentUser } from '../../utils/roles'
import SuperAdminDashboard from './super-admin/SuperAdminDashboard'
import AdminDashboard from './admin/AdminDashboard'
import UserDashboard from './user/UserDashboard'

const DASHBOARD_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: SuperAdminDashboard,
  [ROLES.ADMIN]: AdminDashboard,
}

function DashboardPage() {
  const Dashboard = DASHBOARD_BY_ROLE[getCurrentUser()?.role] || UserDashboard
  return <Dashboard />
}

export default DashboardPage
