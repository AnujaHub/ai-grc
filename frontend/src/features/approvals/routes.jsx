import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import ApprovalsPage from './ApprovalsPage'
import ApprovalDetailPage from './ApprovalDetailPage'

export const approvalRoutes = (
  <>
    <Route path="/approvals" element={<RoleRoute><ApprovalsPage /></RoleRoute>} />
    <Route path="/approvals/:id" element={<RoleRoute><ApprovalDetailPage /></RoleRoute>} />
  </>
)
