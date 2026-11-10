import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import { ROLES } from '../../utils/roles'
import ReportsPage from './ReportsPage'
import ReportDetailPage from './ReportDetailPage'
import AuditLogPage from './AuditLogPage'

export const reportRoutes = (
  <>
    <Route path="/reports" element={<RoleRoute><ReportsPage /></RoleRoute>} />
    <Route path="/reports/:id" element={<RoleRoute><ReportDetailPage /></RoleRoute>} />
    <Route path="/audit-log" element={<RoleRoute allow={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AUDITOR]}><AuditLogPage /></RoleRoute>} />
  </>
)
