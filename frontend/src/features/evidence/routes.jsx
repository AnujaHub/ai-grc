import { Route } from 'react-router-dom'
import RoleRoute from '../../components/RoleRoute'
import EvidenceLibraryPage from './EvidenceLibraryPage'
import UploadEvidencePage from './UploadEvidencePage'
import EvidenceDetailPage from './EvidenceDetailPage'
import DocumentEditorPage from './DocumentEditorPage'

export const evidenceRoutes = (
  <>
    <Route path="/evidence" element={<RoleRoute><EvidenceLibraryPage /></RoleRoute>} />
    <Route path="/evidence/upload" element={<RoleRoute><UploadEvidencePage /></RoleRoute>} />
    <Route path="/evidence/documents/:id" element={<RoleRoute><DocumentEditorPage /></RoleRoute>} />
    <Route path="/evidence/:id" element={<RoleRoute><EvidenceDetailPage /></RoleRoute>} />
  </>
)
