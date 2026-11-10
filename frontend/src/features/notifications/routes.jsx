import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import NotificationsPage from './NotificationsPage'

export const notificationRoutes = (
  <Route path="/notifications" element={<RoleRoute><NotificationsPage /></RoleRoute>} />
)
