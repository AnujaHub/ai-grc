import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import { ROLES } from '../../utils/roles'
import DashboardPage from './DashboardPage'
import SuperAdminDashboard from './super-admin/SuperAdminDashboard'
import AdminDashboard from './admin/AdminDashboard'
import UserDashboard from './user/UserDashboard'

export const DASHBOARD_ACCESS = {
  superAdmin: [ROLES.SUPER_ADMIN],
  admin: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  user: [ROLES.COMPLIANCE_OFFICER, ROLES.AUDITOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
}

export const dashboardRoutes = (
  <>
    <Route path="/dashboard" element={<RoleRoute><DashboardPage /></RoleRoute>} />
    <Route path="/dashboard/super-admin" element={<RoleRoute allow={DASHBOARD_ACCESS.superAdmin}><SuperAdminDashboard /></RoleRoute>} />
    <Route path="/dashboard/admin" element={<RoleRoute allow={DASHBOARD_ACCESS.admin}><AdminDashboard /></RoleRoute>} />
    <Route path="/dashboard/user" element={<RoleRoute allow={DASHBOARD_ACCESS.user}><UserDashboard /></RoleRoute>} />
  </>
)
