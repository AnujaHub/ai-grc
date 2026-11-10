export const FRAMEWORK = { name: 'ISO/IEC 27001:2022', annex: 'Annex A' }

const THEMES = {"5": "Organizational controls", "6": "People controls", "7": "Physical controls", "8": "Technological controls"}

const CATALOGUE = [
  ["A.5.1", "5", "Governance", "Policies for information security", "Set, approve, publish and periodically review the information security policy and topic-specific policies."],
  ["A.5.2", "5", "Governance", "Information security roles and responsibilities", "Define and assign who is responsible for each information security activity."],
  ["A.5.3", "5", "Governance", "Segregation of duties", "Split conflicting duties between different people to reduce the chance of misuse or error."],
  ["A.5.4", "5", "Governance", "Management responsibilities", "Managers make sure staff apply security in line with the organisation's policies."],
  ["A.5.5", "5", "Compliance", "Contact with authorities", "Keep up-to-date contacts with regulators, law enforcement and other relevant authorities."],
  ["A.5.6", "5", "IT Security", "Contact with special interest groups", "Stay in touch with security forums and professional groups to share knowledge."],
  ["A.5.7", "5", "IT Security", "Threat intelligence", "Collect and analyse information about threats so defences can be adjusted early."],
  ["A.5.8", "5", "Governance", "Information security in project management", "Build security requirements into every project from start to finish."],
  ["A.5.9", "5", "IT Operations", "Inventory of information and other associated assets", "Keep a current register of information assets with a named owner for each."],
  ["A.5.10", "5", "Compliance", "Acceptable use of information and other associated assets", "Document and communicate the rules for using information and company equipment."],
  ["A.5.11", "5", "HR", "Return of assets", "Recover company equipment and information when someone leaves or changes role."],
  ["A.5.12", "5", "Compliance", "Classification of information", "Classify information by confidentiality, integrity and availability needs."],
  ["A.5.13", "5", "Compliance", "Labelling of information", "Label information so its classification is visible to anyone handling it."],
  ["A.5.14", "5", "IT Security", "Information transfer", "Protect information when it is sent inside or outside the organisation."],
  ["A.5.15", "5", "IT Security", "Access control", "Define rules for who can access which information and systems, based on business need."],
  ["A.5.16", "5", "IT Operations", "Identity management", "Manage the full life cycle of user and system identities."],
  ["A.5.17", "5", "IT Security", "Authentication information", "Control how passwords, keys and other secrets are issued, stored and changed."],
  ["A.5.18", "5", "IT Security", "Access rights", "Grant, review, change and remove access rights in line with the access policy."],
  ["A.5.19", "5", "Risk", "Information security in supplier relationships", "Manage the security risks that come from using suppliers' products and services."],
  ["A.5.20", "5", "Legal", "Information security within supplier agreements", "Put the required security obligations into each supplier contract."],
  ["A.5.21", "5", "Risk", "Security in the ICT supply chain", "Manage security risks in the supply chain for hardware, software and services."],
  ["A.5.22", "5", "Risk", "Monitoring and change management of supplier services", "Regularly monitor supplier performance and review changes to their services."],
  ["A.5.23", "5", "IT Security", "Information security for use of cloud services", "Define how cloud services are selected, used, managed and exited securely."],
  ["A.5.24", "5", "IT Security", "Incident management planning and preparation", "Prepare the plan, roles and procedures for handling security incidents."],
  ["A.5.25", "5", "IT Security", "Assessment and decision on security events", "Assess security events and decide whether they should be treated as incidents."],
  ["A.5.26", "5", "IT Security", "Response to information security incidents", "Respond to incidents following the documented procedures."],
  ["A.5.27", "5", "Risk", "Learning from information security incidents", "Use lessons from incidents to strengthen controls and reduce repeat events."],
  ["A.5.28", "5", "Legal", "Collection of evidence", "Identify, collect and preserve evidence about security events in a defensible way."],
  ["A.5.29", "5", "Risk", "Information security during disruption", "Keep security at the right level during a disruption or crisis."],
  ["A.5.30", "5", "IT Operations", "ICT readiness for business continuity", "Plan, test and maintain ICT so it can support business continuity objectives."],
  ["A.5.31", "5", "Legal", "Legal, statutory, regulatory, and contractual requirements", "Identify and keep track of the legal and contractual security requirements that apply."],
  ["A.5.32", "5", "Legal", "Intellectual property rights", "Protect intellectual property and use licensed material lawfully."],
  ["A.5.33", "5", "Compliance", "Protection of records", "Protect records from loss, destruction, falsification and unauthorised access."],
  ["A.5.34", "5", "Legal", "Privacy and protection of personal data", "Meet privacy laws and protect personally identifiable information."],
  ["A.5.35", "5", "Governance", "Independent review of information security", "Have the security approach reviewed independently at planned intervals or after major change."],
  ["A.5.36", "5", "Compliance", "Compliance with policies, rules, and standards", "Regularly check that security policies and standards are being followed."],
  ["A.5.37", "5", "IT Operations", "Documented operating procedures", "Document operating procedures and make them available to the people who need them."],
  ["A.6.1", "6", "HR", "Screening", "Carry out background checks on candidates before they join, proportionate to the role."],
  ["A.6.2", "6", "HR", "Terms and conditions of employment", "Make security responsibilities part of employment contracts."],
  ["A.6.3", "6", "HR", "Information security awareness, education, and training", "Give staff regular security awareness and role-specific training."],
  ["A.6.4", "6", "HR", "Disciplinary process", "Have a formal, communicated process for handling security policy violations."],
  ["A.6.5", "6", "HR", "Responsibilities after termination or change of employment", "Define security duties that continue after someone leaves or changes role."],
  ["A.6.6", "6", "Legal", "Confidentiality or non-disclosure agreements", "Use confidentiality agreements that reflect the organisation's needs and review them regularly."],
  ["A.6.7", "6", "IT Security", "Remote working", "Protect information that is accessed, processed or stored while working remotely."],
  ["A.6.8", "6", "IT Security", "Information security event reporting", "Give staff a quick, simple way to report observed or suspected security events."],
  ["A.7.1", "7", "Facilities", "Physical security perimeters", "Define and protect the boundaries of areas that hold information and equipment."],
  ["A.7.2", "7", "Facilities", "Physical entry", "Protect secure areas with entry controls and access points."],
  ["A.7.3", "7", "Facilities", "Securing offices, rooms, and facilities", "Design and apply physical security for offices, rooms and facilities."],
  ["A.7.4", "7", "Facilities", "Physical security monitoring", "Continuously monitor premises for unauthorised physical access."],
  ["A.7.5", "7", "Facilities", "Protecting against physical and environmental threats", "Protect against fire, flood, power loss and other physical or environmental threats."],
  ["A.7.6", "7", "Facilities", "Working in secure areas", "Set rules for working inside secure areas."],
  ["A.7.7", "7", "Facilities", "Clear desk and clear screen", "Keep desks clear of papers and media and lock unattended screens."],
  ["A.7.8", "7", "Facilities", "Equipment siting and protection", "Place and protect equipment to reduce physical and environmental risks."],
  ["A.7.9", "7", "IT Operations", "Security of assets off-premises", "Protect laptops and other assets used outside company premises."],
  ["A.7.10", "7", "IT Operations", "Storage media", "Manage storage media through acquisition, use, transport and disposal."],
  ["A.7.11", "7", "Facilities", "Supporting utilities", "Protect facilities from failures of power, cooling and other utilities."],
  ["A.7.12", "7", "Facilities", "Cabling security", "Protect power and data cables from interception, interference or damage."],
  ["A.7.13", "7", "IT Operations", "Equipment maintenance", "Maintain equipment correctly so information stays available and intact."],
  ["A.7.14", "7", "IT Operations", "Secure disposal or re-use of equipment", "Securely wipe or destroy data before equipment is disposed of or re-used."],
  ["A.8.1", "8", "IT Operations", "User endpoint devices", "Protect information stored on or accessed through laptops, phones and other user devices."],
  ["A.8.2", "8", "IT Security", "Privileged access rights", "Restrict and closely manage administrator and other privileged access."],
  ["A.8.3", "8", "IT Security", "Information access restriction", "Limit access to information and systems according to the access policy."],
  ["A.8.4", "8", "Engineering", "Access to source code", "Control read and write access to source code and development tools."],
  ["A.8.5", "8", "IT Security", "Secure authentication", "Use secure sign-in methods, such as multi-factor authentication, based on risk."],
  ["A.8.6", "8", "IT Operations", "Capacity management", "Monitor and adjust resource capacity to meet current and future needs."],
  ["A.8.7", "8", "IT Security", "Protection against malware", "Protect systems against malware, supported by user awareness."],
  ["A.8.8", "8", "IT Security", "Management of technical vulnerabilities", "Identify technical vulnerabilities, assess exposure and fix them in time."],
  ["A.8.9", "8", "IT Operations", "Configuration management", "Define, apply, monitor and review secure configurations for hardware, software and networks."],
  ["A.8.10", "8", "IT Operations", "Information deletion", "Delete information when it is no longer needed."],
  ["A.8.11", "8", "Engineering", "Data masking", "Mask sensitive data, such as personal data, in line with policy and legal needs."],
  ["A.8.12", "8", "IT Security", "Data leakage prevention", "Detect and prevent unauthorised disclosure of sensitive information."],
  ["A.8.13", "8", "IT Operations", "Information backup", "Take backups of information, software and systems and test that they can be restored."],
  ["A.8.14", "8", "IT Operations", "Redundancy of information processing facilities", "Build in enough redundancy to meet availability requirements."],
  ["A.8.15", "8", "IT Security", "Logging", "Produce, store, protect and analyse logs of activities, exceptions and events."],
  ["A.8.16", "8", "IT Security", "Monitoring activities", "Monitor networks, systems and applications for unusual behaviour and act on it."],
  ["A.8.17", "8", "IT Operations", "Clock synchronization", "Synchronise system clocks to approved time sources."],
  ["A.8.18", "8", "IT Security", "Use of privileged utility programs", "Restrict and control utility programs that can override system or application controls."],
  ["A.8.19", "8", "IT Operations", "Installation of software on operational systems", "Control which software can be installed on production systems."],
  ["A.8.20", "8", "IT Operations", "Networks security", "Secure, manage and control networks and network devices."],
  ["A.8.21", "8", "IT Operations", "Security of network services", "Identify and monitor the security features and service levels of network services."],
  ["A.8.22", "8", "IT Operations", "Segregation of networks", "Separate groups of services, users and systems into different networks."],
  ["A.8.23", "8", "IT Security", "Web filtering", "Manage access to external websites to reduce exposure to malicious content."],
  ["A.8.24", "8", "IT Security", "Use of cryptography", "Define and apply rules for using encryption and managing keys."],
  ["A.8.25", "8", "Engineering", "Secure development life cycle", "Apply security rules throughout the software and system development life cycle."],
  ["A.8.26", "8", "Engineering", "Application security requirements", "Identify and approve security requirements when building or buying applications."],
  ["A.8.27", "8", "Engineering", "Secure system architecture and engineering principles", "Define and apply secure engineering principles to all system development."],
  ["A.8.28", "8", "Engineering", "Secure coding", "Apply secure coding practices in software development."],
  ["A.8.29", "8", "Engineering", "Security testing in development and acceptance", "Test security during development and before systems are accepted into production."],
  ["A.8.30", "8", "Engineering", "Outsourced development", "Direct, monitor and review development work done by external parties."],
  ["A.8.31", "8", "Engineering", "Separation of development, test, and production environments", "Keep development, test and production environments separate and secured."],
  ["A.8.32", "8", "IT Operations", "Change management", "Control changes to systems and information processing facilities through a formal process."],
  ["A.8.33", "8", "Engineering", "Test information", "Select, protect and manage information used for testing."],
  ["A.8.34", "8", "Compliance", "Protection of information systems during audit testing", "Plan audit tests on live systems with management so operations are not disrupted."],
]

export const TEAM = [
  { name: 'Anita Desai', role: 'Chief Information Security Officer' },
  { name: 'Karan Singh', role: 'Compliance officer' },
  { name: 'Priya Sharma', role: 'Security engineer' },
  { name: 'Emma Wilson', role: 'Risk manager' },
  { name: 'Rahul Verma', role: 'Legal counsel' },
  { name: 'Arjun Mehta', role: 'Infrastructure lead' },
  { name: 'Daniel Okafor', role: 'Facilities manager' },
  { name: 'Sofia Rossi', role: 'HR & training lead' },
]

const OWNER_BY_DEPARTMENT = {
  Governance: 'Anita Desai',
  Compliance: 'Karan Singh',
  'IT Security': 'Priya Sharma',
  Risk: 'Emma Wilson',
  Legal: 'Rahul Verma',
  'IT Operations': 'Arjun Mehta',
  Engineering: 'Arjun Mehta',
  Facilities: 'Daniel Okafor',
  HR: 'Sofia Rossi',
}

export const DEPARTMENTS = Object.keys(OWNER_BY_DEPARTMENT)

export const CONTROL_STATUSES = [
  { value: 'implemented', label: 'Implemented' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'not_started', label: 'Not started' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'not_applicable', label: 'Not applicable' },
]

const STATUS_PATTERN = ['implemented', 'implemented', 'in_progress', 'implemented', 'not_started', 'implemented', 'in_progress', 'implemented',
  'overdue', 'implemented', 'implemented', 'in_progress', 'not_applicable', 'implemented', 'not_started', 'implemented']
const RISK_PATTERN = ['high', 'medium', 'low', 'medium', 'high', 'medium']
const DUE_PATTERN = [12, 25, -6, 40, 8, 60, 18, -3, 33, 4]
const STATUS_OVERRIDES = { 'A.5.1': 'implemented', 'A.5.9': 'implemented', 'A.5.10': 'in_progress', 'A.8.5': 'overdue', 'A.8.8': 'in_progress', 'A.8.13': 'implemented', 'A.8.20': 'in_progress' }

const daysFromNow = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

const controls = CATALOGUE.map(([code, themeCode, department, title, description], i) => {
  const status = STATUS_OVERRIDES[code] || STATUS_PATTERN[i % STATUS_PATTERN.length]
  const due = DUE_PATTERN[i % DUE_PATTERN.length]
  return {
    code,
    domainCode: `A.${themeCode}`,
    domain: THEMES[themeCode],
    department,
    title,
    description,
    status,
    owner: OWNER_BY_DEPARTMENT[department],
    riskLevel: RISK_PATTERN[i % RISK_PATTERN.length],
    frequency: i % 3 === 0 ? 'Quarterly' : 'Annual',
    dueDate: daysFromNow(status === 'overdue' ? -Math.abs(due) - 2 : Math.abs(due) + 3),
    lastReviewed: status === 'not_started' ? null : daysFromNow(-(20 + (i % 9) * 11)),
  }
})

export const DOMAINS = Object.entries(THEMES).map(([code, name]) => ({ code: `A.${code}`, name }))

export const TOTAL_CONTROLS = controls.length

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

export const findControl = (code) => controls.find((c) => c.code === code)

export const allControls = () => controls

export async function listControls() {
  await wait()
  return controls.map((c) => ({ ...c }))
}

export async function getControl(code) {
  await wait()
  const index = controls.findIndex((c) => c.code === code)
  if (index === -1) {
    const error = new Error('Control not found')
    error.response = { status: 404, data: { detail: 'Control not found.' } }
    throw error
  }
  return {
    control: { ...controls[index] },
    previous: controls[index - 1]?.code || null,
    next: controls[index + 1]?.code || null,
  }
}

export async function updateControl(code, patch) {
  await wait(250)
  const control = findControl(code)
  Object.assign(control, patch)
  return { ...control }
}
