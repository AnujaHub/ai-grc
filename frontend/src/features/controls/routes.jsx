import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import ControlsCataloguePage from './ControlsCataloguePage'
import ControlDetailPage from './ControlDetailPage'

export const controlRoutes = (
  <>
    <Route path="/controls" element={<RoleRoute><ControlsCataloguePage /></RoleRoute>} />
    <Route path="/controls/:code" element={<RoleRoute><ControlDetailPage /></RoleRoute>} />
  </>
)
