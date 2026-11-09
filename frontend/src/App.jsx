import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Organizations from './pages/Organisations'
import AISystems from './pages/SystemesIA'
import Evaluations from './pages/Evaluations'
import EvaluationDetail from './pages/EvaluationDetail'
import Risks from './pages/Risques'
import RiskDetail from './pages/RisqueDetail'
import ProtectedRoute from './components/ProtectedRoute'
import RiskConfiguration from './pages/ConfigurationRisque'
import AssistantChatbot from './components/AssistantChatbot'
import Reports from './pages/Rapports'
import Users from './pages/Utilisateurs'
import AuditLog from './pages/JournalAudit'
import Profile from './pages/Profil'
import { authRoutes, AUTH_PATHS } from './features/auth/routes'
import { dashboardRoutes } from './features/dashboard/routes'

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
        <Route path="/organisations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
        <Route path="/systemes-ia" element={<ProtectedRoute><AISystems /></ProtectedRoute>} />
        <Route path="/evaluations" element={<ProtectedRoute><Evaluations /></ProtectedRoute>} />
        <Route path="/evaluations/:evaluationId" element={<ProtectedRoute><EvaluationDetail /></ProtectedRoute>} />
        <Route path="/risques" element={<ProtectedRoute><Risks /></ProtectedRoute>} />
        <Route path="/risques/:risqueId" element={<ProtectedRoute><RiskDetail /></ProtectedRoute>} />
        <Route path="/configuration-risque/:organisationId" element={<ProtectedRoute><RiskConfiguration /></ProtectedRoute>} />
        <Route path="/rapports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/utilisateurs" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/journal-audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
      <ChatbotOutsideAuth />
    </BrowserRouter>
  )
}

export default App
