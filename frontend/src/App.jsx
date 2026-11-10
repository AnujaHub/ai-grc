import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Organizations from './pages/Organizations'
import AISystems from './pages/AISystems'
import Assessments from './pages/Assessments'
import AssessmentDetail from './pages/AssessmentDetail'
import Risks from './pages/Risks'
import RiskDetail from './pages/RiskDetail'
import RiskConfiguration from './pages/RiskConfiguration'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AssistantChatbot from './components/AssistantChatbot'
import { Toaster } from './components/ui'
import { ROLES } from './utils/roles'
import { authRoutes, AUTH_PATHS } from './features/auth/routes'
import { dashboardRoutes } from './features/dashboard/routes'
import { controlRoutes } from './features/controls/routes'
import { evidenceRoutes } from './features/evidence/routes'
import { grcPlanRoutes } from './features/grc-plan/routes'
import { userRoutes } from './features/users/routes'
import { approvalRoutes } from './features/approvals/routes'
import { notificationRoutes } from './features/notifications/routes'
import { aiRoutes } from './features/ai/routes'
import { reportRoutes } from './features/reports/routes'

const MANAGERS = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

function ChatbotOutsideAuth() {
  const { pathname } = useLocation()
  return AUTH_PATHS.includes(pathname) ? null : <AssistantChatbot />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {authRoutes}
        {dashboardRoutes}
        {controlRoutes}
        {evidenceRoutes}
        {grcPlanRoutes}
        {userRoutes}
        {approvalRoutes}
        {notificationRoutes}
        {aiRoutes}
        {reportRoutes}
        <Route path="/organizations" element={<RoleRoute allow={MANAGERS}><Organizations /></RoleRoute>} />
        <Route path="/ai-systems" element={<ProtectedRoute><AISystems /></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute><Assessments /></ProtectedRoute>} />
        <Route path="/assessments/:evaluationId" element={<ProtectedRoute><AssessmentDetail /></ProtectedRoute>} />
        <Route path="/risks" element={<ProtectedRoute><Risks /></ProtectedRoute>} />
        <Route path="/risks/:risqueId" element={<ProtectedRoute><RiskDetail /></ProtectedRoute>} />
        <Route path="/risk-configuration/:organisationId" element={<RoleRoute allow={MANAGERS}><RiskConfiguration /></RoleRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
      <ChatbotOutsideAuth />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
