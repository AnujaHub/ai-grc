import { createTask } from '../grc-plan/planData'

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

const ago = (days, hours = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

const daysFromNow = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const MODEL = 'Llama 3.3 70B via Groq'

const store = {
  evidence: [
    {
      id: 'AI-EA-21', evidenceId: 'EV-1026', evidenceTitle: 'External penetration test report', controls: ['A.8.8', 'A.8.29'], generatedAt: ago(0, 5), confidence: 0.86,
      verdict: 'insufficient', summary: 'The report covers internet-facing applications but has no retest results for the two critical findings.',
      extracted: [['Test date', '14 Oct 2026'], ['Tester', 'External firm (CREST certified)'], ['Scope', '6 applications, 2 IP ranges'], ['Critical findings', '2'], ['High findings', '5']],
      findings: [
        { severity: 'high', text: 'No evidence that the 2 critical findings were fixed and retested.' },
        { severity: 'medium', text: 'Internal network was out of scope, so A.8.20 is only partly covered.' },
        { severity: 'low', text: 'Report is signed and dated, which supports its authenticity.' },
      ],
      status: 'suggested',
    },
    {
      id: 'AI-EA-19', evidenceId: 'EV-1042', evidenceTitle: 'Information security policy', controls: ['A.5.1', 'A.5.4'], generatedAt: ago(2), confidence: 0.93,
      verdict: 'relevant', summary: 'The policy is approved by the board, dated, and covers objectives, scope and management commitment.',
      extracted: [['Version', '3.0'], ['Approved by', 'Board of directors'], ['Approval date', '28 Oct 2026'], ['Next review', 'Oct 2027']],
      findings: [{ severity: 'low', text: 'Topic-specific policies are referenced but not attached.' }],
      status: 'accepted', reviewedBy: 'Anita Desai', reviewedAt: ago(1),
    },
    {
      id: 'AI-EA-17', evidenceId: 'EV-1009', evidenceTitle: 'Backup restore test', controls: ['A.8.13'], generatedAt: ago(6), confidence: 0.71,
      verdict: 'insufficient', summary: 'The screenshot shows a successful restore, but it is older than the 90-day testing cycle.',
      extracted: [['Restore date', '12 Jul 2026'], ['System', 'Production database'], ['Duration', '42 minutes']],
      findings: [{ severity: 'medium', text: 'Evidence is outside the quarterly testing window.' }],
      status: 'dismissed', reviewedBy: 'Emma Wilson', reviewedAt: ago(5), reviewNote: 'A newer test is already scheduled; analysis not needed.',
    },
  ],
  risks: [
    {
      id: 'AI-RS-08', title: 'Unpatched critical vulnerabilities on internet-facing apps', source: 'Penetration test report (EV-1026)', controls: ['A.8.8'], generatedAt: ago(0, 4), confidence: 0.88,
      likelihood: 'Likely', impact: 'Major', level: 'high', rationale: 'Two critical findings have no retest evidence and remediation is overdue (T-101).',
      treatment: 'Fix and retest the two critical findings within 14 days. Track under T-101.', status: 'suggested',
    },
    {
      id: 'AI-RS-07', title: 'Privileged accounts without MFA', source: 'Assessment answers, control A.8.5', controls: ['A.8.5', 'A.8.2'], generatedAt: ago(0, 4), confidence: 0.91,
      likelihood: 'Possible', impact: 'Severe', level: 'high', rationale: 'MFA rollout is blocked (T-104) and a risk acceptance for the legacy VPN is pending.',
      treatment: 'Prioritise MFA licences and restrict admin access to managed devices.', status: 'suggested',
    },
    {
      id: 'AI-RS-06', title: 'Supplier security not reviewed after contract change', source: 'Cloud provider assessment (EV-1021)', controls: ['A.5.19', 'A.5.22'], generatedAt: ago(0, 4), confidence: 0.64,
      likelihood: 'Possible', impact: 'Moderate', level: 'medium', rationale: 'The assessment predates the new data-residency clause in the renewed contract.',
      treatment: 'Ask the provider for an updated SOC 2 report and confirm data residency.', status: 'suggested',
    },
    {
      id: 'AI-RS-03', title: 'Loss of audit evidence due to short log retention', source: 'Assessment answers, control A.8.15', controls: ['A.8.15'], generatedAt: ago(8), confidence: 0.77,
      likelihood: 'Possible', impact: 'Moderate', level: 'medium', rationale: 'Logs are kept for 30 days while audits need 12 months.',
      treatment: 'Extend retention to 12 months in the SIEM.', status: 'accepted', reviewedBy: 'Emma Wilson', reviewedAt: ago(7),
    },
  ],
  recommendations: [
    {
      id: 'AI-CR-14', control: 'A.8.5', controlTitle: 'Secure authentication', gap: 'MFA is not enforced for administrator accounts.', generatedAt: ago(1), confidence: 0.92,
      recommendation: 'Enforce MFA for all privileged and remote access, starting with the 14 domain admin accounts.', priority: 'high', effort: 'Medium', scoreGain: 2.1, status: 'suggested',
    },
    {
      id: 'AI-CR-13', control: 'A.5.12', controlTitle: 'Classification of information', gap: '38% of assets in the register have no classification.', generatedAt: ago(1), confidence: 0.84,
      recommendation: 'Ask each asset owner to classify their assets using the four-level scheme, with a 2-week deadline.', priority: 'medium', effort: 'Low', scoreGain: 1.4, status: 'suggested',
    },
    {
      id: 'AI-CR-12', control: 'A.8.13', controlTitle: 'Information backup', gap: 'The latest restore test evidence has expired.', generatedAt: ago(1), confidence: 0.89,
      recommendation: 'Run a restore test of the production database this month and upload the log as evidence.', priority: 'medium', effort: 'Low', scoreGain: 0.9, status: 'suggested',
    },
    {
      id: 'AI-CR-09', control: 'A.6.3', controlTitle: 'Information security awareness, education, and training', gap: 'Training completion is 81%, below the 95% target.', generatedAt: ago(10), confidence: 0.8,
      recommendation: 'Send reminders to the 3 departments below target and report completion to management.', priority: 'low', effort: 'Low', scoreGain: 0.6,
      status: 'accepted', reviewedBy: 'Karan Singh', reviewedAt: ago(9), taskId: 'T-108',
    },
  ],
  summaries: [
    {
      id: 'AI-RP-05', reportTitle: 'ISO/IEC 27001:2022 assessment, Q3', reportRef: 'Q3 report', generatedAt: ago(9), confidence: 0.87, score: 72,
      summary: 'Overall compliance is 72%, up 5 points from Q2. Organizational and physical controls are strong. Technological controls lag behind, mainly in authentication, vulnerability management and logging.',
      keyFindings: ['6 controls are overdue, 4 of them technological', 'MFA for privileged accounts is the largest single gap', '13 of 93 controls have approved evidence'],
      strengths: ['Policy suite approved and published', 'Asset register complete for 412 assets', 'Access reviews performed every quarter'],
      status: 'accepted', reviewedBy: 'Anita Desai', reviewedAt: ago(8),
    },
    {
      id: 'AI-RP-04', reportTitle: 'Supplier security review, H1', reportRef: 'H1 supplier report', generatedAt: ago(40), confidence: 0.79, score: 64,
      summary: 'Most critical suppliers have current security assessments. Two cloud suppliers have expired certifications and one has no right-to-audit clause.',
      keyFindings: ['2 suppliers with expired ISO 27001 certificates', '1 contract without a right-to-audit clause'],
      strengths: ['All suppliers classified by criticality'],
      status: 'suggested',
    },
  ],
}

export async function getAiInsights() {
  await wait()
  return JSON.parse(JSON.stringify(store))
}

export async function reviewAiItem(kind, id, decision, { actor, note }) {
  await wait(350)
  const item = store[kind].find((x) => x.id === id)
  Object.assign(item, { status: decision, reviewedBy: actor, reviewedAt: new Date().toISOString(), reviewNote: note || null })
  if (kind === 'recommendations' && decision === 'accepted') {
    const task = await createTask({
      title: item.recommendation.split(',')[0].replace(/\.$/, ''),
      control: item.control,
      owner: actor,
      priority: item.priority,
      milestoneId: 'M3',
      dueDate: daysFromNow(item.effort === 'Low' ? 14 : 30),
      description: `From AI recommendation ${item.id}: ${item.recommendation}`,
    })
    item.taskId = task.id
  }
  return JSON.parse(JSON.stringify(item))
}

export const pendingAiCount = () => Object.values(store).flat().filter((x) => x.status === 'suggested').length
