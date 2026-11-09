from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from xml.sax.saxutils import escape
from datetime import datetime
from functools import partial
import os

from contenu_statique_rapport import CADRE_REGLEMENTAIRE, DEMARCHE_GOUVERNANCE_IA, GLOSSAIRE, REFERENCES

DOSSIER_RAPPORTS = "rapports"


def safe_paragraph_text(value):
    return escape(str(value or ""))

LEVEL_COLORS = {
    "Conforme": colors.HexColor("#16a34a"),
    "Partiellement conforme": colors.HexColor("#f59e0b"),
    "Non conforme": colors.HexColor("#dc2626"),
    "Non applicable": colors.HexColor("#9ca3af"),
}

RISK_COLORS = {
    "Élevé": colors.HexColor("#dc2626"),
    "Moyen": colors.HexColor("#f59e0b"),
    "Faible": colors.HexColor("#16a34a"),
    "High": colors.HexColor("#dc2626"),
    "Medium": colors.HexColor("#f59e0b"),
    "Low": colors.HexColor("#16a34a"),
}

LIBELLES_ANGLAIS = {
    "Élevé": "High",
    "Élevée": "High",
    "Moyen": "Medium",
    "Faible": "Low",
    "Conforme": "Compliant",
    "Partiellement conforme": "Partially compliant",
    "Non conforme": "Non-compliant",
    "Non applicable": "Not applicable",
    "Non répondu": "Not answered",
    "Ouverte": "Open",
    "En cours": "In progress",
    "Terminée": "Completed",
    "Maîtrisé": "Controlled",
    "À surveiller": "Needs attention",
    "Critique": "Critical",
}


def libelle_anglais(value):
    return LIBELLES_ANGLAIS.get(value, value)

COULEUR_PRINCIPALE = colors.HexColor("#1f2937")
COULEUR_ACCENT = colors.HexColor("#7c3aed")
COULEUR_GRIS = colors.HexColor("#6b7280")


def calculate_matrix_level(impact_index, index_prob, impact_level_count, nb_niveaux_prob):
    """Mirror the backend logic to keep risk calculations consistent."""
    normalized_impact = impact_index / (impact_level_count - 1) if impact_level_count > 1 else 0
    norm_prob = index_prob / (nb_niveaux_prob - 1) if nb_niveaux_prob > 1 else 0
    score = (normalized_impact + norm_prob) / 2
    if score <= 0.33:
        return "Faible"
    elif score <= 0.66:
        return "Moyen"
    else:
        return "Élevé"


def dessiner_entete_pied_page(canvas, doc, organization_name):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#e5e7eb"))
    canvas.line(2*cm, 1.6*cm, A4[0] - 2*cm, 1.6*cm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(COULEUR_GRIS)
    canvas.drawString(2*cm, 1.2*cm, f"{organization_name} — AI Compliance Report — ISO/IEC 42001")
    canvas.drawRightString(A4[0] - 2*cm, 1.2*cm, f"Page {doc.page}")
    canvas.restoreState()


def generate_report_pdf(donnees):
    os.makedirs(DOSSIER_RAPPORTS, exist_ok=True)
    file_name = f"rapport_{donnees['evaluation_id']}.pdf"
    full_path = os.path.join(DOSSIER_RAPPORTS, file_name)

    doc = SimpleDocTemplate(full_path, pagesize=A4,
                             topMargin=2.5*cm, bottomMargin=2.5*cm,
                             leftMargin=2*cm, rightMargin=2*cm)

    styles = getSampleStyleSheet()
    cover_title_style = ParagraphStyle('TitreGarde', parent=styles['Title'], fontSize=26, textColor=COULEUR_PRINCIPALE, spaceAfter=10, alignment=TA_CENTER)
    cover_subtitle_style = ParagraphStyle('SousTitreGarde', parent=styles['Normal'], fontSize=14, textColor=COULEUR_ACCENT, alignment=TA_CENTER, spaceAfter=40)
    style_section = ParagraphStyle('Section', parent=styles['Heading1'], fontSize=16, textColor=COULEUR_PRINCIPALE, spaceBefore=10, spaceAfter=14)
    style_sous_section = ParagraphStyle('SousSection', parent=styles['Heading3'], fontSize=12, textColor=COULEUR_PRINCIPALE, spaceBefore=12, spaceAfter=6)
    style_normal = ParagraphStyle('NormalPerso', parent=styles['Normal'], fontSize=10, leading=15)
    style_petit = ParagraphStyle('Petit', parent=styles['Normal'], fontSize=8.5, textColor=COULEUR_GRIS, leading=11)
    style_recommandation = ParagraphStyle('Recommandation', parent=styles['Normal'], fontSize=10, leftIndent=15, spaceAfter=8, leading=14)

    elements = []

    # ============ COVER PAGE ============
    elements.append(Spacer(1, 3*cm))
    elements.append(Paragraph("AI COMPLIANCE REPORT", cover_title_style))
    elements.append(Paragraph("Artificial Intelligence Systems Governance — ISO/IEC 42001 Standard", cover_subtitle_style))

    cible_libelle = donnees.get('systeme_ia_nom') or "Organization-wide governance"

    data_garde = [
        ["Organization", donnees['organisation_nom']],
        ["Assessed target", cible_libelle],
        ["Framework", donnees['referentiel_nom']],
        ["Generated on", datetime.now().strftime('%Y-%m-%d %H:%M')],
        ["Overall compliance score", f"{donnees.get('score', 0)} %"],
    ]
    table_garde = Table(data_garde, colWidths=[6*cm, 9*cm])
    table_garde.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f3f4f6")),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(Spacer(1, 1*cm))
    elements.append(table_garde)
    elements.append(Spacer(1, 2*cm))
    elements.append(Paragraph(
        "Report automatically generated by the Artificial Intelligence Governance and Compliance Platform.",
        style_petit
    ))
    elements.append(PageBreak())

    # ============ SOMMAIRE ============
    elements.append(Paragraph("Table of Contents", style_section))
    sommaire_items = [
        "1. Executive summary",
        "2. Assessment context and scope",
        "3. Applicable regulatory and standards framework",
        "4. Analysis of identified risks",
        "5. Risk map and criticality matrix",
        "6. Compliance assessment (gap analysis)",
        "7. Prioritized remediation plan",
        "8. Artificial Intelligence governance approach",
        "9. Performance indicators (KPI / KRI)",
        "10. Conclusion and strategic recommendations",
        "11. Appendices",
    ]
    for item in sommaire_items:
        elements.append(Paragraph(item, style_normal))
    elements.append(PageBreak())

    # Implementation note.
    elements.append(Paragraph("1. Executive summary", style_section))
    synthese_ia = donnees.get('synthese_ia')
    if synthese_ia and synthese_ia.get('synthese'):
        elements.append(Paragraph(safe_paragraph_text(synthese_ia['synthese']), style_normal))
    else:
        elements.append(Paragraph(
            f"This assessment covers “{cible_libelle}” under the {donnees['referentiel_nom']} framework. "
            f"The overall compliance score is {donnees.get('score', 0)} %.",
            style_normal
        ))
    elements.append(PageBreak())

    # Implementation note.
    elements.append(Paragraph("2. Assessment context and scope", style_section))
    elements.append(Paragraph(
        f"This assessment was conducted for the organization <b>{safe_paragraph_text(donnees['organisation_nom'])}</b>"
        + (f" (sector: {safe_paragraph_text(donnees['organisation_secteur'])})" if donnees.get('organisation_secteur') else "")
        + ".", style_normal
    ))
    elements.append(Spacer(1, 8))

    if donnees.get('systeme_ia_nom'):
        elements.append(Paragraph(
            f"<b>Assessed AI system:</b> {safe_paragraph_text(donnees['systeme_ia_nom'])}", style_normal
        ))
        if donnees.get('systeme_ia_description'):
            elements.append(Paragraph(safe_paragraph_text(donnees['systeme_ia_description']), style_normal))
        if donnees.get('systeme_ia_criticite'):
            elements.append(Paragraph(f"<b>Declared criticality level:</b> {libelle_anglais(donnees['systeme_ia_criticite'])}", style_normal))
    else:
        elements.append(Paragraph(
            "This assessment covers the organization's overall governance rather than a specific "
            "artificial intelligence system. It covers strategic, organizational, and cross-functional "
            "AI governance aspects.", style_normal
        ))

    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"<b>Framework used:</b> {safe_paragraph_text(donnees['referentiel_nom'])}. "
        f"The assessment covers {donnees['nb_clauses_totales']} requirements across {len(donnees['chapitres'])} chapters.",
        style_normal
    ))
    elements.append(PageBreak())

    # Implementation note.
    elements.append(Paragraph("3. Applicable regulatory and standards framework", style_section))
    for paragraphe in CADRE_REGLEMENTAIRE.strip().split("\n\n"):
        elements.append(Paragraph(paragraphe.strip().replace("\n", " "), style_normal))
        elements.append(Spacer(1, 8))
    elements.append(PageBreak())

    # ============ 4. RISK ANALYSIS ============
    elements.append(Paragraph("4. Analysis of identified risks", style_section))

    if not donnees['risques']:
        elements.append(Paragraph("No risks were identified for this assessment.", style_normal))
    else:
        for i, r in enumerate(donnees['risques'], start=1):
            elements.append(Paragraph(f"Risk R{i} — {safe_paragraph_text(r['titre'])}", style_sous_section))
            if r['description']:
                elements.append(Paragraph(safe_paragraph_text(r['description']), style_normal))
            elements.append(Spacer(1, 4))

            risk_data = [["Category", "Impact", "Probability", "Criticality level"]]
            risk_data.append([r['categorie'] or "-", libelle_anglais(r['impact']), libelle_anglais(r['probabilite']), libelle_anglais(r['niveau_risque'])])
            table_r = Table(risk_data, colWidths=[4*cm, 3.5*cm, 3.5*cm, 4*cm])
            style_r = [
                ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]
            couleur_niv = RISK_COLORS.get(r['niveau_risque'])
            if couleur_niv:
                style_r.append(('TEXTCOLOR', (3, 1), (3, 1), couleur_niv))
                style_r.append(('FONTNAME', (3, 1), (3, 1), 'Helvetica-Bold'))
            table_r.setStyle(TableStyle(style_r))
            elements.append(table_r)
            elements.append(Spacer(1, 14))
    elements.append(PageBreak())

    # Implementation note.
    elements.append(Paragraph("5. Risk map and criticality matrix", style_section))

    impact_levels = donnees.get('niveaux_impact', ["Faible", "Moyen", "Élevé"])
    probability_levels = donnees.get('niveaux_probabilite', ["Faible", "Moyen", "Élevée"])
    nb_i = len(impact_levels)
    nb_p = len(probability_levels)

    elements.append(Paragraph(
        f"The matrix below combines {nb_p} probability levels and {nb_i} impact levels "
        "configured for this organization.", style_normal
    ))
    elements.append(Spacer(1, 10))

    entete_matrice = ["Probability \\ Impact"] + [libelle_anglais(v) for v in impact_levels]
    data_matrice = [entete_matrice]

    for idx_p in range(nb_p - 1, -1, -1):
        ligne = [libelle_anglais(probability_levels[idx_p])]
        for idx_i in range(nb_i):
            niveau = calculate_matrix_level(idx_i, idx_p, nb_i, nb_p)
            ligne.append(niveau)
        data_matrice.append(ligne)

    largeur_col = 3*cm
    table_matrice = Table(data_matrice, colWidths=[3.5*cm] + [largeur_col]*nb_i)
    style_matrice = [
        ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (0, -1), colors.HexColor("#f3f4f6")),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for ligne_idx in range(1, len(data_matrice)):
        for col_idx in range(1, len(data_matrice[ligne_idx])):
            niveau = data_matrice[ligne_idx][col_idx]
            couleur = RISK_COLORS.get(niveau, colors.white)
            style_matrice.append(('BACKGROUND', (col_idx, ligne_idx), (col_idx, ligne_idx), couleur))
            style_matrice.append(('TEXTCOLOR', (col_idx, ligne_idx), (col_idx, ligne_idx), colors.white))

    table_matrice.setStyle(TableStyle(style_matrice))
    elements.append(table_matrice)
    elements.append(Spacer(1, 20))

    if donnees['risques']:
        elements.append(Paragraph("Positioning of identified risks:", style_sous_section))
        data_position = [["Ref.", "Risk", "Impact", "Probability", "Criticality"]]
        for i, r in enumerate(donnees['risques'], start=1):
            data_position.append([f"R{i}", r['titre'], libelle_anglais(r['impact']), libelle_anglais(r['probabilite']), libelle_anglais(r['niveau_risque'])])
        table_pos = Table(data_position, colWidths=[1.5*cm, 6*cm, 3*cm, 3*cm, 2.5*cm])
        style_pos = [
            ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]
        for i, r in enumerate(donnees['risques'], start=1):
            couleur = RISK_COLORS.get(r['niveau_risque'])
            if couleur:
                style_pos.append(('TEXTCOLOR', (4, i), (4, i), couleur))
                style_pos.append(('FONTNAME', (4, i), (4, i), 'Helvetica-Bold'))
        table_pos.setStyle(TableStyle(style_pos))
        elements.append(table_pos)
    elements.append(PageBreak())

    # ============ 6. GAP ANALYSIS ============
    elements.append(Paragraph("6. Compliance assessment (gap analysis)", style_section))

    for chapitre in donnees['chapitres']:
        elements.append(Paragraph(f"{chapitre['numero']}. {safe_paragraph_text(chapitre['titre'])}", style_sous_section))

        data_table = [["Clause", "Answer", "Gap", "Department"]]
        for clause_info in chapitre['clauses']:
            data_table.append([
                Paragraph(f"{clause_info['numero']} — {safe_paragraph_text(clause_info['titre'])}", style_petit),
                libelle_anglais(clause_info['reponse']) if clause_info['reponse'] else "Not answered",
                clause_info['ecart'] or "-",
                clause_info['departement'] or "-",
            ])

        table = Table(data_table, colWidths=[7*cm, 3*cm, 2.5*cm, 3.5*cm])
        style_commandes = [
            ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]
        for i, clause_info in enumerate(chapitre['clauses'], start=1):
            couleur = LEVEL_COLORS.get(clause_info['reponse'])
            if couleur:
                style_commandes.append(('TEXTCOLOR', (1, i), (1, i), couleur))
                style_commandes.append(('FONTNAME', (1, i), (1, i), 'Helvetica-Bold'))
        table.setStyle(TableStyle(style_commandes))
        elements.append(table)
        elements.append(Spacer(1, 10))

    elements.append(PageBreak())

    # ============ 7. PRIORITIZED REMEDIATION PLAN ============
    elements.append(Paragraph("7. Prioritized remediation plan", style_section))

    all_actions = []
    for i, r in enumerate(donnees['risques'], start=1):
        for a in r.get('actions', []):
            all_actions.append({
                "risque_ref": f"R{i}",
                "risque_titre": r['titre'],
                "risque_niveau": r['niveau_risque'],
                **a
            })

    ordre_priorite = {"Élevé": 0, "Moyen": 1, "Faible": 2}
    all_actions.sort(key=lambda a: ordre_priorite.get(a['risque_niveau'], 3))

    if not all_actions:
        elements.append(Paragraph("No corrective actions have been defined for this assessment yet.", style_normal))
    else:
        action_data = [["Ref.", "Corrective action", "Due date", "Status"]]
        for a in all_actions:
            action_data.append([
                a['risque_ref'],
                Paragraph(f"{safe_paragraph_text(a['titre'])} (linked to: {safe_paragraph_text(a['risque_titre'])})", style_petit),
                a['date_echeance'],
                libelle_anglais(a['statut']),
            ])
        actions_table = Table(action_data, colWidths=[1.5*cm, 8.5*cm, 3*cm, 3*cm])
        actions_style = [
            ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]
        actions_table.setStyle(TableStyle(actions_style))
        elements.append(actions_table)

    elements.append(PageBreak())

    # ============ 8. AI GOVERNANCE APPROACH ============
    elements.append(Paragraph("8. Artificial Intelligence governance approach", style_section))
    for paragraphe in DEMARCHE_GOUVERNANCE_IA.strip().split("\n\n"):
        elements.append(Paragraph(paragraphe.strip().replace("\n", " "), style_normal))
        elements.append(Spacer(1, 8))
    elements.append(PageBreak())

    # ============ 9. KPI/KRI INDICATORS ============
    elements.append(Paragraph("9. Performance indicators (KPI / KRI)", style_section))

    score = donnees.get('score', 0)
    overall_level = "Controlled" if score >= 70 else "Needs attention" if score >= 40 else "Critical"
    overall_level_color = colors.HexColor("#16a34a") if score >= 70 else colors.HexColor("#f59e0b") if score >= 40 else colors.HexColor("#dc2626")

    data_indicateurs = [
        ["Indicator", "Value"],
        ["Overall compliance score", f"{score} %"],
        ["Compliance level", overall_level],
        ["Assessed clauses", str(donnees.get('nb_clauses_totales', 0))],
        ["Non-compliant or partial clauses", str(donnees.get('nb_clauses_non_conformes', 0))],
        ["Identified risks", str(len(donnees['risques']))],
        ["High-level risks", str(donnees.get('nb_risques_eleves', 0))],
        ["Open (untreated) risks", str(donnees.get('nb_risques_ouverts', 0))],
        ["Defined corrective actions", str(len(all_actions))],
    ]
    table_indicateurs = Table(data_indicateurs, colWidths=[9*cm, 6*cm])
    style_ind = [
        ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TEXTCOLOR', (1, 2), (1, 2), overall_level_color),
        ('FONTNAME', (1, 2), (1, 2), 'Helvetica-Bold'),
    ]
    table_indicateurs.setStyle(TableStyle(style_ind))
    elements.append(table_indicateurs)
    elements.append(PageBreak())

    # ============ 10. CONCLUSION AND RECOMMENDATIONS ============
    elements.append(Paragraph("10. Conclusion and strategic recommendations", style_section))

    if synthese_ia and synthese_ia.get('recommandations'):
        elements.append(Paragraph("Priority strategic recommendations:", style_normal))
        elements.append(Spacer(1, 8))
        for i, reco in enumerate(synthese_ia['recommandations'], start=1):
            elements.append(Paragraph(f"{i}. {safe_paragraph_text(reco)}", style_recommandation))
    else:
        elements.append(Paragraph(
            "The High-level risks identified in this report should be addressed first, with corrective "
            "actions planned for each identified non-conformity.",
            style_normal
        ))
    elements.append(PageBreak())

    # ============ 11. APPENDICES ============
    elements.append(Paragraph("11. Appendices", style_section))

    elements.append(Paragraph("11.1 Glossary", style_sous_section))
    data_glossaire = [["Term", "Definition"]]
    for terme, definition in GLOSSAIRE:
        data_glossaire.append([terme, Paragraph(safe_paragraph_text(definition), style_petit)])
    table_glossaire = Table(data_glossaire, colWidths=[4*cm, 11*cm])
    table_glossaire.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(table_glossaire)
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("11.2 References", style_sous_section))
    for ref in REFERENCES:
        elements.append(Paragraph(f"• {safe_paragraph_text(ref)}", style_petit))

    doc.build(
        elements,
        onFirstPage=lambda c, d: None,
        onLaterPages=partial(dessiner_entete_pied_page, organization_name=donnees['organisation_nom'])
    )

    return full_path