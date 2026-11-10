const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

const daysFromNow = (days, hours = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

const MB = 1024 * 1024

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export const MAX_FILE_MB = 10
export const MAX_FILES_PER_UPLOAD = 10
export const STORAGE_WARNING_PERCENT = 80

export const FORMAT_GROUPS = [
  { label: 'Documents', extensions: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt'] },
  { label: 'Spreadsheets', extensions: ['xls', 'xlsx', 'ods', 'csv'] },
  { label: 'Presentations', extensions: ['ppt', 'pptx', 'odp'] },
  { label: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] },
  { label: 'Logs & data', extensions: ['log', 'json', 'xml'] },
  { label: 'Email', extensions: ['eml', 'msg'] },
  { label: 'Archives', extensions: ['zip'] },
]

export const ACCEPTED_EXTENSIONS = FORMAT_GROUPS.flatMap((g) => g.extensions)
export const CATEGORIES = [
  'Policy',
  'Evidence',
  'Audit Report',
  'Compliance Document',
  'Other',
  'Procedure',
  'Report',
  'Screenshot',
  'Log export',
  'Contract',
  'Training record',
  'Dataset documentation',
]
export const CONFIDENTIALITY = ['Internal', 'Confidential', 'Restricted']
export const EVIDENCE_STATUSES = [
  { value: 'approved', label: 'Approved' },
  { value: 'in_review', label: 'In review' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
]

const evidence = [
  {
    id: 'EV-1042', title: 'Information security policy', fileName: 'information-security-policy-v3.pdf', fileType: 'pdf',
    category: 'Policy', status: 'approved', sizeBytes: 1.2 * MB, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-6),
    validUntil: daysFromNow(359), confidentiality: 'Internal', reviewer: 'Anita Desai', controls: ['A.5.1', 'A.5.4', 'A.5.36'],
    description: 'Board-approved top-level information security policy with objectives, scope and management commitment.',
    versions: [
      { version: 3, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-6), sizeBytes: 1.2 * MB, note: 'Added cloud and remote working sections after review' },
      { version: 2, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-21), sizeBytes: 1.1 * MB, note: 'Updated for ISO/IEC 27001:2022 control set' },
      { version: 1, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-64), sizeBytes: 0.9 * MB, note: 'Initial upload' },
    ],
  },
  {
    id: 'EV-1041', title: 'Acceptable use policy', fileName: 'acceptable-use-policy-v2.1.docx', fileType: 'docx',
    category: 'Policy', status: 'in_review', sizeBytes: 0.6 * MB, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-1),
    validUntil: daysFromNow(364), confidentiality: 'Internal', reviewer: null, controls: ['A.5.10', 'A.6.2'],
    description: 'Rules for using company devices, email, internet, cloud tools and information.',
    versions: [
      { version: 2, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-1), sizeBytes: 0.6 * MB, note: 'Added rules for generative AI tools' },
      { version: 1, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-90), sizeBytes: 0.5 * MB, note: 'Initial upload' },
    ],
  },
  {
    id: 'EV-1039', title: 'Network architecture diagram', fileName: 'network-architecture-2026.png', fileType: 'png',
    category: 'Screenshot', status: 'in_review', sizeBytes: 1.4 * MB, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-2),
    validUntil: daysFromNow(180), confidentiality: 'Confidential', reviewer: null, controls: ['A.8.20', 'A.8.22', 'A.8.27'],
    description: 'Current network zones, firewalls and segmentation between office, production and guest networks.',
    versions: [{ version: 1, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-2), sizeBytes: 1.4 * MB, note: 'Initial upload' }],
  },
  {
    id: 'EV-1037', title: 'Quarterly user access review', fileName: 'access-review-q3.csv', fileType: 'csv',
    category: 'Log export', status: 'approved', sizeBytes: 0.3 * MB, uploadedBy: 'Priya Sharma', uploadedAt: daysFromNow(-12),
    validUntil: daysFromNow(78), confidentiality: 'Confidential', reviewer: 'Emma Wilson', controls: ['A.5.18', 'A.8.2'],
    description: 'Manager sign-off of user and privileged access for all production systems, Q3.',
    versions: [{ version: 1, uploadedBy: 'Priya Sharma', uploadedAt: daysFromNow(-12), sizeBytes: 0.3 * MB, note: 'Initial upload' }],
  },
  {
    id: 'EV-1033', title: 'Security roles and responsibilities matrix', fileName: 'security-raci.pdf', fileType: 'pdf',
    category: 'Procedure', status: 'approved', sizeBytes: 0.9 * MB, uploadedBy: 'Anita Desai', uploadedAt: daysFromNow(-40),
    validUntil: daysFromNow(325), confidentiality: 'Internal', reviewer: 'Karan Singh', controls: ['A.5.2', 'A.5.3'],
    description: 'RACI matrix for security activities, including segregation of conflicting duties.',
    versions: [{ version: 1, uploadedBy: 'Anita Desai', uploadedAt: daysFromNow(-40), sizeBytes: 0.9 * MB, note: 'Initial upload' }],
  },
  {
    id: 'EV-1030', title: 'Information asset register', fileName: 'asset-register-2026.xlsx', fileType: 'xlsx',
    category: 'Report', status: 'approved', sizeBytes: 2.1 * MB, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-18),
    validUntil: daysFromNow(72), confidentiality: 'Internal', reviewer: 'Anita Desai', controls: ['A.5.9', 'A.5.12'],
    description: 'Register of 412 information assets with owner, location, classification and retention.',
    versions: [
      { version: 4, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-18), sizeBytes: 2.1 * MB, note: 'Added 26 SaaS applications' },
      { version: 3, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-48), sizeBytes: 1.9 * MB, note: 'Classification column completed' },
      { version: 2, uploadedBy: 'Karan Singh', uploadedAt: daysFromNow(-95), sizeBytes: 1.7 * MB, note: 'Added asset owner column' },
      { version: 1, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-140), sizeBytes: 1.2 * MB, note: 'Initial upload' },
    ],
  },
  {
    id: 'EV-1026', title: 'External penetration test report', fileName: 'pentest-report-2026.pdf', fileType: 'pdf',
    category: 'Report', status: 'rejected', sizeBytes: 6.8 * MB, uploadedBy: 'Priya Sharma', uploadedAt: daysFromNow(-9),
    validUntil: daysFromNow(356), confidentiality: 'Restricted', reviewer: 'Anita Desai', controls: ['A.8.8', 'A.8.29'],
    reviewComment: 'Retest evidence for the two critical findings is missing. Please add the retest annex and re-upload.',
    description: 'Annual external penetration test of internet-facing applications and infrastructure.',
    versions: [{ version: 1, uploadedBy: 'Priya Sharma', uploadedAt: daysFromNow(-9), sizeBytes: 6.8 * MB, note: 'Initial upload' }],
  },
  {
    id: 'EV-1021', title: 'Cloud provider security assessment', fileName: 'cloud-provider-assessment.pdf', fileType: 'pdf',
    category: 'Contract', status: 'in_review', sizeBytes: 1.1 * MB, uploadedBy: 'Rahul Verma', uploadedAt: daysFromNow(-3),
    validUntil: daysFromNow(362), confidentiality: 'Confidential', reviewer: null, controls: ['A.5.19', 'A.5.20', 'A.5.23'],
    description: 'Supplier security questionnaire, certifications and contract clauses for the main cloud provider.',
    versions: [{ version: 1, uploadedBy: 'Rahul Verma', uploadedAt: daysFromNow(-3), sizeBytes: 1.1 * MB, note: 'Initial upload' }],
  },
  {
    id: 'EV-1015', title: 'Security awareness training records', fileName: 'awareness-training-2026.xlsx', fileType: 'xlsx',
    category: 'Training record', status: 'approved', sizeBytes: 0.4 * MB, uploadedBy: 'Sofia Rossi', uploadedAt: daysFromNow(-25),
    validUntil: daysFromNow(150), confidentiality: 'Internal', reviewer: 'Karan Singh', controls: ['A.6.3'],
    description: 'Completion status of the annual security awareness course and phishing simulations by department.',
    versions: [{ version: 1, uploadedBy: 'Sofia Rossi', uploadedAt: daysFromNow(-25), sizeBytes: 0.4 * MB, note: 'Initial upload' }],
  },
  {
    id: 'EV-1009', title: 'Backup restore test', fileName: 'backup-restore-test-q2.png', fileType: 'png',
    category: 'Screenshot', status: 'expired', sizeBytes: 0.8 * MB, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-120),
    validUntil: daysFromNow(-30), confidentiality: 'Internal', reviewer: 'Emma Wilson', controls: ['A.8.13'],
    description: 'Screenshot and log of a successful restore of the production database from backup.',
    versions: [{ version: 1, uploadedBy: 'Arjun Mehta', uploadedAt: daysFromNow(-120), sizeBytes: 0.8 * MB, note: 'Initial upload' }],
  },
  {
    id: 'EV-1004', title: 'Incident response procedure', fileName: 'incident-response-procedure.docx', fileType: 'docx',
    category: 'Procedure', status: 'approved', sizeBytes: 0.7 * MB, uploadedBy: 'Priya Sharma', uploadedAt: daysFromNow(-55),
    validUntil: daysFromNow(310), confidentiality: 'Internal', reviewer: 'Anita Desai', controls: ['A.5.24', 'A.5.25', 'A.5.26'],
    description: 'Detection, triage, escalation, containment, recovery and notification steps for security incidents.',
    versions: [{ version: 1, uploadedBy: 'Priya Sharma', uploadedAt: daysFromNow(-55), sizeBytes: 0.7 * MB, note: 'Initial upload' }],
  },
]

const policies = [
  {
    id: 'POL-01', title: 'Information security policy', category: 'Policy', owner: 'Anita Desai', version: '3.0', status: 'approved',
    updatedAt: daysFromNow(-30), nextReview: daysFromNow(335), controls: ['A.5.1', 'A.5.4'],
    content: '<h2>1. Purpose</h2><p>This policy sets out how the organisation protects the confidentiality, integrity and availability of its information.</p><h2>2. Scope</h2><p>It applies to all employees, contractors, systems and locations.</p><h2>3. Objectives</h2><ul><li>Protect customer and company information</li><li>Meet legal, regulatory and contractual requirements</li><li>Continually improve the information security management system</li></ul>',
  },
  {
    id: 'POL-02', title: 'Acceptable use policy', category: 'Policy', owner: 'Karan Singh', version: '2.1', status: 'in_review',
    updatedAt: daysFromNow(-1), nextReview: daysFromNow(364), controls: ['A.5.10', 'A.6.2'],
    content: '<h2>1. Purpose</h2><p>Defines how staff may use company information, devices and services.</p><h2>2. Not allowed</h2><ul><li>Sharing passwords or access cards</li><li>Storing company data on personal cloud accounts</li></ul><h2>3. Allowed</h2><p>Reasonable personal use of company devices that does not affect security or performance.</p>',
  },
  {
    id: 'POL-03', title: 'Access control policy', category: 'Policy', owner: 'Priya Sharma', version: '1.4', status: 'approved',
    updatedAt: daysFromNow(-75), nextReview: daysFromNow(15), controls: ['A.5.15', 'A.5.18', 'A.8.2'],
    content: '<h2>1. Principles</h2><p>Access is granted on a need-to-know and least-privilege basis.</p><h2>2. Reviews</h2><p>Managers review user access every quarter and privileged access every month.</p>',
  },
  {
    id: 'POL-04', title: 'Information classification and handling procedure', category: 'Procedure', owner: 'Karan Singh', version: '0.3', status: 'draft',
    updatedAt: daysFromNow(-4), nextReview: null, controls: ['A.5.12', 'A.5.13'],
    content: '<h2>1. Classification levels</h2><p>Information is classified as Public, Internal, Confidential or Restricted.</p>',
  },
  {
    id: 'POL-05', title: 'Supplier security policy', category: 'Policy', owner: 'Rahul Verma', version: '1.0', status: 'approved',
    updatedAt: daysFromNow(-200), nextReview: daysFromNow(-12), controls: ['A.5.19', 'A.5.20'],
    content: '<h2>1. Due diligence</h2><p>Suppliers with access to company information must complete a security assessment before contract signature.</p>',
  },
]

const STORAGE_LIMIT = 10 * 1024 * MB

const extensionOf = (name) => name.split('.').pop().toLowerCase()

export const evidenceForControl = (code) => evidence.filter((e) => e.controls.includes(code)).map((e) => ({ ...e }))

export const evidenceCoverage = (code) => {
  const linked = evidence.filter((e) => e.controls.includes(code))
  if (linked.some((e) => e.status === 'approved')) return 'approved'
  if (linked.length) return 'pending'
  return 'missing'
}

export const COVERAGE_OPTIONS = [
  { value: 'approved', label: 'Approved evidence' },
  { value: 'pending', label: 'Evidence awaiting approval' },
  { value: 'missing', label: 'No evidence' },
]

export async function listEvidence() {
  await wait()
  return evidence.map((e) => ({ ...e }))
}

export async function getEvidence(id) {
  await wait()
  const item = evidence.find((e) => e.id === id)
  if (!item) {
    const error = new Error('Not found')
    error.response = { status: 404, data: { detail: 'Evidence not found.' } }
    throw error
  }
  return { ...item, versions: item.versions.map((v) => ({ ...v })) }
}

export async function saveEvidencePreview(id, blob) {
  await wait(300)
  const item = evidence.find((e) => e.id === id)
  if (!item) {
    const error = new Error('Not found')
    error.response = { status: 404, data: { detail: 'Evidence not found.' } }
    throw error
  }
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  item.previewUrl = URL.createObjectURL(blob)
  item.sizeBytes = blob.size
  item.status = 'in_review'
  item.uploadedAt = new Date().toISOString()
  return { ...item }
}

export async function deleteEvidence(id) {
  await wait(250)
  const index = evidence.findIndex((item) => item.id === id)
  if (index < 0) {
    const error = new Error('Not found')
    error.response = { status: 404, data: { detail: 'Evidence not found.' } }
    throw error
  }
  const [removed] = evidence.splice(index, 1)
  if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl)
}

const assertSpace = async (bytes) => {
  const { freeBytes } = await getStorage()
  if (bytes > freeBytes) {
    const error = new Error('Storage full')
    error.response = { status: 413, data: { detail: `Not enough storage space. ${formatBytes(bytes)} selected, ${formatBytes(freeBytes)} left.` } }
    throw error
  }
}

export async function uploadEvidence(entries, uploadedBy) {
  await assertSpace(entries.reduce((sum, e) => sum + e.file.size, 0))
  const created = entries.map((entry, i) => {
    const id = `EV-${1043 + evidence.length + i}`
    const item = {
      id,
      title: entry.title,
      fileName: entry.file.name,
      fileType: extensionOf(entry.file.name),
      category: entry.category,
      status: 'in_review',
      sizeBytes: entry.file.size,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      validUntil: entry.validUntil ? new Date(entry.validUntil).toISOString() : null,
      confidentiality: entry.confidentiality,
      reviewer: null,
      controls: entry.controls,
      description: entry.description,
      previewUrl: ['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(extensionOf(entry.file.name))
        ? URL.createObjectURL(entry.file)
        : null,
      versions: [{ version: 1, uploadedBy, uploadedAt: new Date().toISOString(), sizeBytes: entry.file.size, note: 'Initial upload' }],
    }
    evidence.unshift(item)
    return item
  })
  return created
}

export async function uploadNewVersion(id, file, note, uploadedBy) {
  await assertSpace(file.size)
  const item = evidence.find((e) => e.id === id)
  const version = item.versions[0].version + 1
  item.versions.unshift({ version, uploadedBy, uploadedAt: new Date().toISOString(), sizeBytes: file.size, note: note || 'New version' })
  Object.assign(item, { fileName: file.name, fileType: extensionOf(file.name), sizeBytes: file.size, status: 'in_review', reviewer: null, reviewComment: null, uploadedAt: new Date().toISOString() })
  return { ...item }
}

export async function setEvidenceControls(id, codes) {
  await wait(250)
  const item = evidence.find((e) => e.id === id)
  item.controls = [...codes]
  return { ...item }
}

export async function linkEvidenceToControl(evidenceIds, code) {
  await wait(250)
  evidence.forEach((e) => {
    if (evidenceIds.includes(e.id) && !e.controls.includes(code)) e.controls.push(code)
  })
}

export async function unlinkEvidenceFromControl(id, code) {
  await wait(200)
  const item = evidence.find((e) => e.id === id)
  item.controls = item.controls.filter((c) => c !== code)
}

export async function reviewEvidence(id, decision, comment, reviewer) {
  await wait(300)
  const item = evidence.find((e) => e.id === id)
  Object.assign(item, { status: decision, reviewer, reviewComment: comment || null })
  return { ...item }
}

export async function getStorage() {
  await wait(200)
  const byType = {}
  evidence.forEach((e) => {
    e.versions.forEach((v) => {
      byType[e.fileType] = (byType[e.fileType] || 0) + v.sizeBytes
    })
  })
  const versionsBytes = Object.values(byType).reduce((a, b) => a + b, 0)
  const usedBytes = 6.4 * 1024 * MB + versionsBytes
  return {
    usedBytes,
    limitBytes: STORAGE_LIMIT,
    freeBytes: Math.max(0, STORAGE_LIMIT - usedBytes),
    files: evidence.reduce((n, e) => n + e.versions.length, 0) + 1268,
    byType: Object.entries(byType).map(([type, bytes]) => ({ type, bytes })).sort((a, b) => b.bytes - a.bytes),
  }
}

export async function listPolicies() {
  await wait()
  return policies.map((p) => ({ ...p }))
}

export async function getPolicy(id) {
  await wait(250)
  const policy = policies.find((p) => p.id === id)
  if (!policy) {
    const error = new Error('Not found')
    error.response = { status: 404, data: { detail: 'Document not found.' } }
    throw error
  }
  return { ...policy }
}

export async function savePolicy(id, patch) {
  await wait(400)
  if (!id) {
    const policy = { id: `POL-0${policies.length + 1}`, version: '0.1', status: 'draft', controls: [], nextReview: null, ...patch, updatedAt: new Date().toISOString() }
    policies.push(policy)
    return { ...policy }
  }
  const policy = policies.find((p) => p.id === id)
  Object.assign(policy, patch, { updatedAt: new Date().toISOString() })
  return { ...policy }
}
