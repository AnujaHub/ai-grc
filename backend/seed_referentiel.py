from database import SessionLocal
from models.referentiel import ReferenceFramework
from models.chapitre import Chapter
from models.clause import Clause

# Implementation note.
DONNEES = [
    ("1", "AI Governance Strategy and Principles", "Organisation", "Direction", [
        ("AI strategy", "Is there an approved AI strategy and responsible AI principles aligned to business objectives, risk appetite, customer outcomes, regulation and technology strategy?"),
        ("Innovation versus control", "How does management balance innovation benefits against model, conduct, operational, privacy, security, financial crime, legal and reputational risks?"),
        ("Principles to controls", "Are AI principles translated into measurable requirements for use-case intake, vendor selection, lifecycle controls, customer communications and monitoring?"),
        ("Scope of AI", "Does the governance scope cover ML, statistical models, rule-based ADM, GenAI, LLMs, copilots, chatbots and embedded vendor AI?"),
    ]),
    ("2", "AI Governance Operating Model", "Organisation", "Direction / Gouvernance", [
        ("Governance structure", "Is there a documented AI governance operating model with roles, committees, decision rights, escalation routes, and three lines of responsibility?"),
        ("Cross-functional accountability", "Are responsibilities clear for owners, developers, validators, business users, data, privacy, security, compliance, legal, procurement and technology teams?"),
        ("Group and entity alignment", "Is AI governance aligned across groups, legal entities, branches, shared services, outsourced providers and cloud environments?"),
        ("Exceptions", "How are AI policy exceptions, emergency deployments, unsupported uses and risk acceptances approved, time-bound, monitored and escalated?"),
    ]),
    ("3", "AI Governance Policies, Standards and Procedures", "Organisation", "Conformité", [
        ("AI policy suite", "Are AI policies and standards approved for intake, classification, development, validation, deployment, monitoring, change, retirement and incident management?"),
        ("Control integration", "Are AI procedures integrated with SDLC, model risk management, data governance, privacy, information security, outsourcing, procurement and operational resilience?"),
        ("GenAI acceptable use", "Do standards define prohibited, restricted and permitted GenAI uses, including prompts, outputs, confidential data, IP, disclosure and human review?"),
        ("Policy refresh", "How are AI policies updated for regulatory change, incidents, model failures, technology changes and supervisory feedback?"),
    ]),
    ("4", "AI Use Case Inventory and Classification", "Organisation", "Conformité", [
        ("Inventory completeness", "Is there a complete AI inventory covering owner, purpose, users, data, vendor, model type, lifecycle status, criticality, customer impact and legal entity?"),
        ("Risk classification", "Are AI use cases classified by risk, including prohibited, high-risk, limited-risk transparency, GPAI dependency, materiality and financial-services impact?"),
        ("Shadow AI", "How are shadow AI, local experiments, public GenAI use, copilots, embedded SaaS AI and vendor AI identified and brought into governance?"),
        ("Reclassification triggers", "Do changes to data, model, prompts, RAG sources, vendor versions, user groups, decision impact or regulatory scope trigger reclassification?"),
    ]),
    ("5", "AI Risk Management", "Organisation", "Gestion des risques", [
        ("Risk assessment", "Are AI risks assessed across model performance, data, privacy, security, conduct, financial crime, resilience, legal, outsourcing and customer harm dimensions?"),
        ("Timing of assessments", "Are risk assessments performed before development, procurement, deployment and material change, and refreshed periodically based on risk tier?"),
        ("Risk tolerance", "Are risk tolerances defined by use-case type, customer impact, automation level, reversibility, model complexity, criticality and regulatory classification?"),
        ("Control mapping", "How are controls mapped to inherent and residual AI risks with owners, test frequency, evidence requirements and escalation thresholds?"),
    ]),
    ("6", "EU AI Act Readiness", "Organisation", "Juridique", [
        ("Role mapping", "Has the institution mapped its AI Act roles as provider, deployer, importer, distributor, product manufacturer and GPAI integrator, including vendor arrangements?"),
        ("Prohibited practice screening", "Are AI use cases screened for prohibited practices, such as manipulative techniques, exploitation of vulnerabilities, social scoring, and prohibited biometric/emotional uses?"),
        ("High-risk AI identification", "Are high-risk AI systems identified, including those for creditworthiness, essential services, life/health insurance pricing, employment, and other Annex III use cases?"),
        ("Obligation implementation", "How are transparency, data governance, technical documentation, logging, human oversight, accuracy, robustness, cybersecurity, post-market monitoring and incident obligations translated into controls?"),
    ]),
    ("7", "Model Risk Management", "Systeme_IA", "Data Science / Model Risk", [
        ("Model inventory and tiering", "Are AI and ML models included in the enterprise model inventory and tiered by materiality, complexity, usage, customer impact and regulatory relevance?"),
        ("Independent validation", "Is independent validation required before production use and after material changes, with a scope proportionate to the model risk tier?"),
        ("Validation scope", "Does validation cover conceptual soundness, data quality, implementation, performance, explainability, bias, robustness, limitations, and usability testing?"),
        ("Limitations and use boundaries", "How are model limitations, assumptions, uncertainty, use boundaries, prohibited uses and compensating controls communicated to users and governance bodies?"),
    ]),
    ("8", "AI Lifecycle Management", "Systeme_IA", "IT / Data Science", [
        ("Lifecycle gates", "Are lifecycle gates defined from ideation, design and data sourcing through development, testing, validation, deployment, monitoring, change and retirement?"),
        ("Controlled environments", "Are development environments, code repositories, notebooks, feature stores, MLOps pipelines and deployment permissions access-controlled and versioned?"),
        ("Change control", "Do changes to model versions, retraining, features, thresholds, prompts, RAG sources, vendor configurations and deployment context follow approved change control?"),
        ("Rollback and retirement", "How are rollback, fallback, kill-switch, retirement, archival and post-retirement monitoring criteria defined and tested?"),
    ]),
    ("9", "Data Governance for AI", "Systeme_IA", "Data", [
        ("Dataset documentation", "Are training, validation, testing and production datasets documented for provenance, lawful basis, licensing, lineage, retention, quality and representativeness?"),
        ("Sensitive and proxy variables", "Are sensitive, protected and proxy variables identified, justified, controlled, excluded or monitored according to risk and legal requirements?"),
        ("Synthetic and external data", "Are synthetic, augmented, scraped, purchased and external datasets governed for quality, representativeness, privacy, IP rights, model risk and permitted use?"),
        ("Leakage and contamination", "How are target leakage, data leakage, staleness, survivorship bias, sample bias and training/test contamination detected and remediated?"),
    ]),
    ("10", "Explainability and Transparency", "Systeme_IA", "Data Science", [
        ("Explainability requirements", "Are explainability requirements defined based on customer impact, regulatory classification, model complexity, decision materiality and user needs?"),
        ("Explanation methods", "Are local and global explanations, reason codes, feature importance, counterfactuals or surrogate models tested for accuracy and consistency?"),
        ("User and customer transparency", "Are customers and users informed when they interact with AI or receive AI-generated decisions, recommendations, or content, as required?"),
        ("Complaints and appeals", "How do explanations support complaints, appeals, human intervention, vulnerability assessment, and conduct risk reviews in plain language?"),
    ]),
    ("11", "Fairness, Bias and Non-Discrimination", "Systeme_IA", "Data Science / Conformité", [
        ("Fairness framework", "Are fairness objectives, protected characteristics, proxy variables, segmentation criteria, metrics, thresholds and escalation triggers defined?"),
        ("Bias testing", "Is bias testing performed before deployment, after material change and periodically in production with documented results and remediation triggers?"),
        ("Sector impacts", "Are disparate impacts assessed in credit, insurance, fraud, AML, collections, segmentation and investment recommendation use cases where applicable?"),
        ("Bias mitigation governance", "How are bias mitigation decisions, trade-offs, model changes and residual risk acceptances documented, challenged and approved?"),
    ]),
    ("12", "Human Oversight and Accountability", "Systeme_IA", "Métier", [
        ("Oversight design", "Is human oversight designed based on customer impact, automation level, reversibility, uncertainty, user competence and regulatory classification?"),
        ("Reviewer capability", "Are reviewers given appropriate tools, training, explanations, authority and time to challenge, override, stop or escalate AI outputs?"),
        ("Override monitoring", "Are overrides, approvals, exceptions, appeals, and human interventions logged, monitored, and analysed for patterns or control weaknesses?"),
        ("Decision accountability", "How is accountability assigned where AI informs credit, underwriting, claims, AML, sanctions, trading surveillance, fraud or investment advice?"),
    ]),
    ("13", "Testing, Validation and Monitoring", "Systeme_IA", "Data Science / QA", [
        ("Performance testing", "Does model risk tier define performance, stability, calibration, drift, robustness, stress, back-testing and sensitivity tests?"),
        ("Production monitoring", "Are monitoring thresholds, alerts, dashboards, runbooks, breach response and escalation pathways implemented for production AI?"),
        ("GenAI testing", "Are GenAI outputs tested for hallucination, toxicity, prompt injection, data leakage, factual reliability, citation quality and unsafe content?"),
        ("Review of monitoring results", "How are monitoring results reviewed by model owners, validators, risk committees and business control owners?"),
    ]),
    ("14", "Security, Robustness and Resilience", "Systeme_IA", "Sécurité IT", [
        ("Threat modelling", "Are AI systems threat-modelled for adversarial attacks, prompt injection, data poisoning, model extraction, inversion, API abuse and unauthorised access?"),
        ("Resilience integration", "Are material AI systems included in ICT resilience, business continuity, disaster recovery, operational resilience and critical function mapping?"),
        ("Asset protection", "Are model artefacts, prompts, embeddings, vector stores, datasets, secrets, API keys and logs protected and monitored?"),
        ("Security testing", "How are adversarial, failover, fallback, rate limiting, abuse prevention and resilience tests performed and evidenced?"),
    ]),
    ("15", "Third-Party and Vendor AI Risk", "Systeme_IA", "Achats / Juridique", [
        ("Vendor AI identification", "Are vendor, outsourced, embedded SaaS and cloud AI capabilities identified through procurement, outsourcing, technology inventory and contract review?"),
        ("Contractual protections", "Do contracts address audit rights, data use, confidentiality, IP, model updates, subcontracting, incidents, exit, performance, regulatory cooperation and AI Act role allocation?"),
        ("Due diligence evidence", "Are vendor model cards, technical documentation, validation evidence, SOC/ISO reports, penetration tests, AI Act evidence and limitations reviewed?"),
        ("Ongoing monitoring", "How are vendor AI updates, service changes, incidents, performance breaches, regulatory changes and subcontractor changes monitored?"),
    ]),
    ("16", "Generative AI Governance", "Systeme_IA", "Data Science", [
        ("Acceptable use", "Is there an approved GenAI acceptable-use standard covering permitted uses, prohibited uses, sensitive data, prompts, outputs, citations, human review and disclosure?"),
        ("GenAI risk assessment", "Are LLM applications assessed for hallucination, prompt injection, data leakage, IP infringement, confidentiality, bias, overreliance, misinformation and unsafe content?"),
        ("RAG governance", "Are RAG pipelines, vector stores and knowledge bases governed for source quality, freshness, access permissions, lineage, citation and content retirement?"),
        ("Prompt and output controls", "How are prompts, system prompts, prompt templates, guardrails, output validation, logging and red-team testing controlled for customer-facing or high-impact GenAI?"),
    ]),
    ("17", "Automated Decision-Making and Customer Impact", "Systeme_IA", "Métier / Conformité", [
        ("ADM inventory", "Are automated and AI-assisted decisions identified and assessed for legal basis, customer harm, fairness, explainability, appeal rights and human intervention?"),
        ("Credit decisions", "Are AI decisions for credit scoring, affordability, collections, forbearance, and limit management governed by fairness, explainability, validation, and customer challenge?"),
        ("Insurance decisions", "Are underwriting, claims, fraud, and pricing AI decisions governed by fairness, data provenance, explainability, vulnerable customers, and human review?"),
        ("Investment decisions", "How are investment advice, suitability, appropriateness, portfolio recommendations and client communications involving AI governed and monitored?"),
    ]),
    ("18", "AI Incident Management", "Organisation", "Sécurité / Conformité", [
        ("Incident taxonomy", "Is there an AI incident taxonomy covering model errors, bias, hallucination, drift, data leakage, cyber compromise, unauthorised use and customer impact?"),
        ("Integration with incident frameworks", "Are AI incidents integrated with operational risk, ICT, privacy, conduct, complaints, regulatory notification and crisis management processes?"),
        ("Incident handling", "Do incidents require severity assessment, impact population, containment, root cause analysis, remediation, customer communication and regulatory assessment?"),
        ("Near misses and trends", "How are near misses, monitoring breaches, bias exceptions, hallucination events and override anomalies recorded, trended and used for improvement?"),
    ]),
    ("19", "Documentation, Record-Keeping and Auditability", "Systeme_IA", "Conformité", [
        ("Technical documentation", "Is AI documentation complete for purpose, users, data, design, training, validation, deployment, monitoring, limitations and user instructions?"),
        ("Decision reconstruction", "Do logs enable reconstruction of outputs, decisions, prompts, model versions, input data, human overrides and user actions?"),
        ("Record retention", "Are records, logs, datasets, model artefacts, prompts, validation packs, monitoring results, and approvals retained in accordance with policy and regulation?"),
        ("Audit trail", "How can internal audit or a supervisor trace an AI decision from the source input through the model/prompt to the output, human action, and customer communication?"),
    ]),
    ("20", "AI Training and Literacy", "Organisation", "RH / Formation", [
        ("Role-based AI literacy", "Is AI literacy training mandatory and tailored to board members, senior management, developers, validators, users, procurement, risk, compliance, legal, security and frontline teams?"),
        ("Training content", "Does training cover AI Act obligations, responsible AI, model risk, data governance, privacy, security, GenAI use, customer impact, prohibited practices and escalation?"),
        ("Competency assessment", "Are competency assessments required before individuals use, approve, validate or oversee high-impact AI and GenAI systems?"),
        ("Training effectiveness", "How is AI training effectiveness measured, reported and used to update policy, controls and user support?"),
    ]),
    ("21", "Metrics, Reporting and Continuous Improvement", "Organisation", "Direction", [
        ("AI dashboard", "Are AI governance KPIs, KRIs and KCIs reported by use case, risk tier, legal entity, business domain and regulatory classification?"),
        ("Metric coverage", "Do metrics cover inventory completeness, overdue validations, bias, drift, incidents, hallucinations, exceptions, vendor issues, training and remediation?"),
        ("Independent testing", "Are AI controls independently tested, and are issues tracked with owners, target dates, validation evidence, and escalation and closure criteria?"),
        ("Maturity reassessment", "How is AI governance maturity periodically reassessed and updated in response to regulatory changes, incidents, supervisory feedback, performance, vendor and technology evolution?"),
    ]),
]


def seed():
    db = SessionLocal()

    existant = db.query(ReferenceFramework).filter(ReferenceFramework.code == "ISO42001-MAT").first()
    if existant:
        print("The reference framework already exists; no data inserted.")
        db.close()
        return

    referentiel = ReferenceFramework(
        code="ISO42001-MAT",
        nom="ISO/IEC 42001 - AI Governance Maturity Assessment",
        description="AI governance maturity assessment framework based on ISO/IEC 42001, ISO/IEC 23894, and the EU AI Act.",
        version="1.0",
        statut="actif"
    )
    db.add(referentiel)
    db.commit()
    db.refresh(referentiel)

    for chap_numero, chapter_title, evaluation_type_local, departement, clauses in DONNEES:
        chapitre = Chapter(
            referentiel_id=referentiel.id,
            numero=chap_numero,
            titre=chapter_title
        )
        db.add(chapitre)
        db.commit()
        db.refresh(chapitre)

        for index, (clause_title, question) in enumerate(clauses, start=1):
            clause = Clause(
                chapitre_id=chapitre.id,
                numero=f"{chap_numero}.{index}",
                titre=clause_title,
                description=question,
                requirement_type="Hybrid",
                ordre=index,
                evaluation_type=evaluation_type_local,
                departement_suggere=departement,
            )
            db.add(clause)

        db.commit()

    print(f"✅ Reference framework created with {len(DONNEES)} chapters and {sum(len(c[4]) for c in DONNEES)} clauses.")
    db.close()


if __name__ == "__main__":
    seed()