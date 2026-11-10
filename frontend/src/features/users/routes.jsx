import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import { ROLES } from '../../utils/roles'
import UsersPage from './UsersPage'
import UserDetailPage from './UserDetailPage'

const MANAGERS = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

export const userRoutes = (
  <>
    <Route path="/users" element={<RoleRoute allow={MANAGERS}><UsersPage /></RoleRoute>} />
    <Route path="/users/:id" element={<RoleRoute allow={MANAGERS}><UserDetailPage /></RoleRoute>} />
  </>
)
