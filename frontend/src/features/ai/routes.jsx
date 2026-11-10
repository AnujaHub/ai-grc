import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import AiInsightsPage from './AiInsightsPage'

export const aiRoutes = (
  <Route path="/ai" element={<RoleRoute><AiInsightsPage /></RoleRoute>} />
)
