import re


def extraire_json(texte):
    """Extract the first valid JSON block found in text, even when surrounded by other text."""
    if not texte:
        raise ValueError("The AI model returned an empty response")

    texte = texte.strip()
    if texte.startswith("```"):
        texte = texte.split("```")[1]
        if texte.startswith("json"):
            texte = texte[4:]

    correspondance = re.search(r'\{.*\}', texte, re.DOTALL)
    if not correspondance:
        raise ValueError(f"No JSON found in the response: {texte[:200]}")

    return json.loads(correspondance.group(0))

from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_risks_and_actions(ai_system_name, reponses_non_conformes):
    """
    reponses_non_conformes: list of dicts with 'clause_titre', 'clause_description', 'reponse', and 'commentaire'.
    Return suggested risks, each with suggested corrective actions.
    """

    clause_summary = ""
    for r in reponses_non_conformes:
        clause_summary += f"- Clause: {r['clause_titre']}\n"
        clause_summary += f"  Question: {r['clause_description']}\n"
        clause_summary += f"  Submitted answer: {r['reponse']}\n"
        if r.get('commentaire'):
            clause_summary += f"  Comment: {r['commentaire']}\n"
        clause_summary += "\n"

    prompt = f"""You are an expert in artificial intelligence governance and ISO/IEC 42001 compliance.

Here are the results of a compliance assessment for the AI system "{ai_system_name}".
The following clauses were assessed as "Non-compliant" or "Partially compliant":

{clause_summary}

For each clause, identify a concrete associated risk and propose a realistic corrective action.

Respond ONLY with valid JSON (no text before or after), using this format:
{{
  "risques": [
    {{
      "titre": "Short risk title",
      "description": "Risk description in 1-2 sentences",
      "categorie": "Risk category (e.g. Documentation, Security, Ethics, Data...)",
      "impact": "Low" or "Medium" or "High",
      "probabilite": "Low" or "Medium" or "High",
      "action_corrective": {{
        "titre": "Short action title",
        "description": "Description of the action to take"
      }}
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )

    contenu = response.choices[0].message.content

    contenu = contenu.strip()
    if contenu.startswith("```"):
        contenu = contenu.split("```")[1]
        if contenu.startswith("json"):
            contenu = contenu[4:]

    resultat = json.loads(contenu)
    return resultat.get("risques", [])


def repondre_assistant_ia(messages_historique, organization_context=None):
    """
    messages_historique : liste de dicts [{"role": "user"/"assistant", "content": "..."}]
    organization_context: optional dict containing organization statistics (score, risks, etc.).
    """

    context_text = ""
    if organization_context:
        context_text = f"""
Here is the current context for the organization selected by the user:
- Number of AI systems: {organization_context.get('nb_systemes_ia', 'unknown')}
- Number of assessments: {organization_context.get('nb_evaluations', 'unknown')}
- Average compliance score: {organization_context.get('score_moyen_conformite', 'unknown')} %
- Open risks: {organization_context.get('nb_risques_ouverts', 'unknown')}
- Overdue corrective actions: {organization_context.get('nb_actions_en_retard', 'unknown')}

Use these figures when relevant to the user's question.
"""

    system_prompt = f"""You are the AI assistant integrated into an artificial intelligence governance and compliance platform based on ISO/IEC 42001.

Your role:
- Help users (compliance officers, auditors, and managers) understand ISO/IEC 42001 requirements
- Explain AI governance clauses and concepts (risk management, bias, explainability, human oversight, etc.)
- Help draft recommendations or corrective actions
- Answer questions about the organization's compliance status when context is provided

{context_text}

Respond clearly, professionally, and concisely (a few sentences, not long essays unless explicitly requested)."""

    messages_for_api = [{"role": "system", "content": system_prompt}]
    messages_for_api.extend(messages_historique)

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=messages_for_api,
        temperature=0.5,
    )

    return response.choices[0].message.content


def generate_report_summary(target_name, evaluation_type, score, high_risk_count, open_risk_count, non_compliant_clause_count, total_clause_count):
    prompt = f"""You are an AI governance expert writing the summary of an ISO/IEC 42001 compliance audit report.

Context:
- Assessed target: {target_name} ({"AI system" if evaluation_type == "Systeme_IA" else "organization-wide governance"})
- Overall compliance score: {score} %
- Number of identified High-level risks: {nb_risques_eleves}
- Number of open (untreated) risks: {nb_risques_ouverts}
- Number of non-compliant or partially compliant clauses out of {nb_clauses_totales} assessed clauses: {nb_clauses_non_conformes}

Write:
1. A short summary paragraph (4-6 sentences) for non-technical leadership explaining the overall compliance status and urgency.
2. A list of 3 prioritized strategic recommendations (one sentence each).

Respond ONLY with valid JSON, with no text before or after, using this format:
{{
  "synthese": "...",
  "recommandations": ["...", "...", "..."]
}}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    contenu = response.choices[0].message.content.strip()
    if contenu.startswith("```"):
        contenu = contenu.split("```")[1]
        if contenu.startswith("json"):
            contenu = contenu[4:]

    return json.loads(contenu)

import base64


def analyze_evidence_text(texte_extrait, clause_title, clause_description, given_response):
    """Analyze text content extracted from a PDF against the clause requirement."""
    truncated_text = texte_extrait[:6000]  # Keep the prompt within a reasonable token budget.

    prompt = f"""You are an expert auditor for ISO/IEC 42001 compliance.

Assessed requirement: {clause_title}
Requirement description: {clause_description}
User-submitted answer: {given_response}

Here is the content extracted from the document submitted as evidence:
---
{truncated_text}
---

Analyze whether this document is relevant and sufficient evidence to support the submitted answer.

Respond ONLY with valid JSON, with no text before or after:
{{
  "verdict": "Relevant" or "Insufficient" or "Not related",
  "explication": "1-2 sentences explaining why"
}}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    message = response.choices[0].message
    contenu = message.content or getattr(message, "reasoning", "") or ""
    return extraire_json(contenu)

def analyze_evidence_image(image_path, clause_title, clause_description, given_response):
    """Analyze an image (screenshot, photo, etc.) against the clause requirement."""
    with open(image_path, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")

    extension = image_path.split(".")[-1].lower()
    mime = "image/png" if extension == "png" else "image/jpeg"

    prompt_text = f"""You are an expert auditor for ISO/IEC 42001 compliance.

Assessed requirement: {clause_title}
Requirement description: {clause_description}
User-submitted answer: {given_response}

Analyze the supplied image: is it relevant and sufficient evidence to support the submitted answer?

Respond ONLY with valid JSON, with no text before or after:
{{
  "verdict": "Relevant" or "Insufficient" or "Not related",
  "explication": "1-2 sentences explaining why and briefly describing what the image shows"
}}
"""

    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_text},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_base64}"}},
                ],
            }
        ],
        temperature=0.2,
    )

    message = response.choices[0].message
    contenu = message.content or getattr(message, "reasoning", "") or ""
    return extraire_json(contenu)