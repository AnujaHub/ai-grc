import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import GrcPlanPage from './GrcPlanPage'
import TaskDetailPage from './TaskDetailPage'

export const grcPlanRoutes = (
  <>
    <Route path="/grc-plan" element={<RoleRoute><GrcPlanPage /></RoleRoute>} />
    <Route path="/grc-plan/tasks/:id" element={<RoleRoute><TaskDetailPage /></RoleRoute>} />
  </>
)
