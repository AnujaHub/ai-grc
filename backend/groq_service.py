import re


def extraire_json(texte):
    """Extrait le premier bloc JSON valide trouvé dans un texte, même s'il y a du texte autour."""
    if not texte:
        raise ValueError("Réponse vide reçue du modèle IA")

    texte = texte.strip()
    if texte.startswith("```"):
        texte = texte.split("```")[1]
        if texte.startswith("json"):
            texte = texte[4:]

    correspondance = re.search(r'\{.*\}', texte, re.DOTALL)
    if not correspondance:
        raise ValueError(f"Aucun JSON trouvé dans la réponse : {texte[:200]}")

    return json.loads(correspondance.group(0))

from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generer_risques_et_actions(nom_systeme_ia, reponses_non_conformes):
    """
    reponses_non_conformes : liste de dicts avec 'clause_titre', 'clause_description', 'reponse', 'commentaire'
    Retourne une liste de risques suggérés, chacun avec ses actions correctives suggérées.
    """

    resume_clauses = ""
    for r in reponses_non_conformes:
        resume_clauses += f"- Clause : {r['clause_titre']}\n"
        resume_clauses += f"  Question : {r['clause_description']}\n"
        resume_clauses += f"  Réponse donnée : {r['reponse']}\n"
        if r.get('commentaire'):
            resume_clauses += f"  Commentaire : {r['commentaire']}\n"
        resume_clauses += "\n"

    prompt = f"""Tu es un expert en gouvernance de l'intelligence artificielle et en conformité ISO/IEC 42001.

Voici les résultats d'une évaluation de conformité pour le système IA "{nom_systeme_ia}".
Les clauses suivantes ont été jugées "Non conforme" ou "Partiellement conforme" :

{resume_clauses}

Pour chacune de ces clauses, identifie un risque concret associé, puis propose une action corrective réaliste.

Réponds UNIQUEMENT avec un JSON valide (sans texte avant ou après), au format suivant :
{{
  "risques": [
    {{
      "titre": "Titre court du risque",
      "description": "Description du risque en 1-2 phrases",
      "categorie": "Catégorie du risque (ex: Documentation, Sécurité, Éthique, Données...)",
      "impact": "Faible" ou "Moyen" ou "Élevé",
      "probabilite": "Faible" ou "Moyen" ou "Élevée",
      "action_corrective": {{
        "titre": "Titre court de l'action",
        "description": "Description de l'action à mener"
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


def repondre_assistant_ia(messages_historique, contexte_organisation=None):
    """
    messages_historique : liste de dicts [{"role": "user"/"assistant", "content": "..."}]
    contexte_organisation : dict optionnel avec les stats de l'organisation (score, risques...)
    """

    contexte_texte = ""
    if contexte_organisation:
        contexte_texte = f"""
Voici le contexte actuel de l'organisation sélectionnée par l'utilisateur :
- Nombre de systèmes IA : {contexte_organisation.get('nb_systemes_ia', 'inconnu')}
- Nombre d'évaluations : {contexte_organisation.get('nb_evaluations', 'inconnu')}
- Score moyen de conformité : {contexte_organisation.get('score_moyen_conformite', 'inconnu')} %
- Risques ouverts : {contexte_organisation.get('nb_risques_ouverts', 'inconnu')}
- Actions correctives en retard : {contexte_organisation.get('nb_actions_en_retard', 'inconnu')}

Utilise ces chiffres si la question de l'utilisateur s'y rapporte.
"""

    system_prompt = f"""Tu es l'assistant IA intégré à une plateforme de gouvernance et de conformité des systèmes d'intelligence artificielle, basée sur la norme ISO/IEC 42001.

Ton rôle :
- Aider les utilisateurs (responsables conformité, auditeurs, managers) à comprendre les exigences de la norme ISO/IEC 42001
- Expliquer des clauses ou des concepts de gouvernance IA (gestion des risques, biais, explicabilité, supervision humaine, etc.)
- Aider à rédiger des recommandations ou des actions correctives
- Répondre aux questions sur l'état de conformité de l'organisation si un contexte est fourni

{contexte_texte}

Réponds de manière claire, professionnelle et concise (quelques phrases, pas de longs pavés sauf si on te le demande explicitement)."""

    messages_pour_api = [{"role": "system", "content": system_prompt}]
    messages_pour_api.extend(messages_historique)

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=messages_pour_api,
        temperature=0.5,
    )

    return response.choices[0].message.content


def generer_synthese_rapport(nom_cible, type_evaluation, score, nb_risques_eleves, nb_risques_ouverts, nb_clauses_non_conformes, nb_clauses_totales):
    prompt = f"""Tu es un expert en gouvernance de l'IA rédigeant la synthèse d'un rapport d'audit de conformité ISO/IEC 42001.

Contexte :
- Cible évaluée : {nom_cible} ({"système IA" if type_evaluation == "Systeme_IA" else "gouvernance globale de l'organisation"})
- Score de conformité global : {score} %
- Nombre de risques de niveau Élevé identifiés : {nb_risques_eleves}
- Nombre de risques encore ouverts (non traités) : {nb_risques_ouverts}
- Nombre de clauses en écart (non conforme ou partiellement conforme) sur {nb_clauses_totales} clauses évaluées : {nb_clauses_non_conformes}

Rédige :
1. Un court paragraphe de synthèse (4-6 phrases) à destination d'une direction non technique, expliquant l'état général de conformité et le niveau d'urgence.
2. Une liste de 3 recommandations stratégiques prioritaires (une phrase chacune).

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, au format :
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


def analyser_preuve_texte(texte_extrait, clause_titre, clause_description, reponse_donnee):
    """Analyse un contenu texte (issu d'un PDF) au regard de l'exigence de la clause."""
    texte_tronque = texte_extrait[:6000]  # limite pour rester raisonnable en tokens

    prompt = f"""Tu es un auditeur expert en conformité ISO/IEC 42001.

Exigence évaluée : {clause_titre}
Description de l'exigence : {clause_description}
Réponse déclarée par l'utilisateur : {reponse_donnee}

Voici le contenu extrait du document déposé comme preuve :
---
{texte_tronque}
---

Analyse si ce document constitue une preuve pertinente et suffisante pour justifier la réponse déclarée.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{{
  "verdict": "Pertinente" ou "Insuffisante" ou "Non liée",
  "explication": "1-2 phrases expliquant pourquoi"
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

def analyser_preuve_image(chemin_image, clause_titre, clause_description, reponse_donnee):
    """Analyse une image (capture d'écran, photo...) au regard de l'exigence de la clause."""
    with open(chemin_image, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")

    extension = chemin_image.split(".")[-1].lower()
    mime = "image/png" if extension == "png" else "image/jpeg"

    prompt_texte = f"""Tu es un auditeur expert en conformité ISO/IEC 42001.

Exigence évaluée : {clause_titre}
Description de l'exigence : {clause_description}
Réponse déclarée par l'utilisateur : {reponse_donnee}

Analyse l'image fournie : constitue-t-elle une preuve pertinente et suffisante pour justifier la réponse déclarée ?

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{{
  "verdict": "Pertinente" ou "Insuffisante" ou "Non liée",
  "explication": "1-2 phrases expliquant pourquoi, en décrivant brièvement ce que montre l'image"
}}
"""

    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_texte},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_base64}"}},
                ],
            }
        ],
        temperature=0.2,
    )

    message = response.choices[0].message
    contenu = message.content or getattr(message, "reasoning", "") or ""
    return extraire_json(contenu)