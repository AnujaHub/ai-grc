import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Organisations from './pages/Organisations'
import SystemesIA from './pages/SystemesIA'
import Evaluations from './pages/Evaluations'
import EvaluationDetail from './pages/EvaluationDetail'
import Risques from './pages/Risques'
import RisqueDetail from './pages/RisqueDetail'
import ProtectedRoute from './components/ProtectedRoute'
import ConfigurationRisque from './pages/ConfigurationRisque'
import AssistantChatbot from './components/AssistantChatbot'
import Rapports from './pages/Rapports'
import Utilisateurs from './pages/Utilisateurs'
import JournalAudit from './pages/JournalAudit'
import Profil from './pages/Profil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/organisations" element={<ProtectedRoute><Organisations /></ProtectedRoute>} />
        <Route path="/systemes-ia" element={<ProtectedRoute><SystemesIA /></ProtectedRoute>} />
        <Route path="/evaluations" element={<ProtectedRoute><Evaluations /></ProtectedRoute>} />
        <Route path="/evaluations/:evaluationId" element={<ProtectedRoute><EvaluationDetail /></ProtectedRoute>} />
        <Route path="/risques" element={<ProtectedRoute><Risques /></ProtectedRoute>} />
        <Route path="/risques/:risqueId" element={<ProtectedRoute><RisqueDetail /></ProtectedRoute>} />
        <Route path="/configuration-risque/:organisationId" element={<ProtectedRoute><ConfigurationRisque /></ProtectedRoute>} />
        <Route path="/rapports" element={<ProtectedRoute><Rapports /></ProtectedRoute>} />
        <Route path="/utilisateurs" element={<ProtectedRoute><Utilisateurs /></ProtectedRoute>} />
        <Route path="/journal-audit" element={<ProtectedRoute><JournalAudit /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
      </Routes>
      <AssistantChatbot />
    </BrowserRouter>
  )
}

export default App