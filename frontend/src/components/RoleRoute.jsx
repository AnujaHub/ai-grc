import { Navigate } from 'react-router-dom'
import AccessDenied from './AccessDenied'
import { getCurrentUser, hasRole } from '../utils/roles'

function RoleRoute({ allow, children }) {
  const token = localStorage.getItem('token')
  const user = getCurrentUser()

  if (!token || !user) return <Navigate to="/" replace />
  if (allow && !hasRole(user, allow)) return <AccessDenied />

  return children
}

export default RoleRoute
