from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
from functools import partial
import os

from contenu_statique_rapport import CADRE_REGLEMENTAIRE, DEMARCHE_GOUVERNANCE_IA, GLOSSAIRE, REFERENCES

DOSSIER_RAPPORTS = "rapports"

COULEURS_NIVEAU = {
    "Conforme": colors.HexColor("#16a34a"),
    "Partiellement conforme": colors.HexColor("#f59e0b"),
    "Non conforme": colors.HexColor("#dc2626"),
    "Non applicable": colors.HexColor("#9ca3af"),
}

COULEURS_RISQUE = {
    "Élevé": colors.HexColor("#dc2626"),
    "Moyen": colors.HexColor("#f59e0b"),
    "Faible": colors.HexColor("#16a34a"),
}

COULEUR_PRINCIPALE = colors.HexColor("#1f2937")
COULEUR_ACCENT = colors.HexColor("#7c3aed")
COULEUR_GRIS = colors.HexColor("#6b7280")


def calculer_niveau_matrice(index_impact, index_prob, nb_niveaux_impact, nb_niveaux_prob):
    """Réplique la même logique que le backend pour rester cohérent avec le calcul des risques."""
    norm_impact = index_impact / (nb_niveaux_impact - 1) if nb_niveaux_impact > 1 else 0
    norm_prob = index_prob / (nb_niveaux_prob - 1) if nb_niveaux_prob > 1 else 0
    score = (norm_impact + norm_prob) / 2
    if score <= 0.33:
        return "Faible"
    elif score <= 0.66:
        return "Moyen"
    else:
        return "Élevé"


def dessiner_entete_pied_page(canvas, doc, organisation_nom):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#e5e7eb"))
    canvas.line(2*cm, 1.6*cm, A4[0] - 2*cm, 1.6*cm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(COULEUR_GRIS)
    canvas.drawString(2*cm, 1.2*cm, f"{organisation_nom} — Rapport de Conformité IA — ISO/IEC 42001")
    canvas.drawRightString(A4[0] - 2*cm, 1.2*cm, f"Page {doc.page}")
    canvas.restoreState()


def generer_rapport_pdf(donnees):
    os.makedirs(DOSSIER_RAPPORTS, exist_ok=True)
    nom_fichier = f"rapport_{donnees['evaluation_id']}.pdf"
    chemin_complet = os.path.join(DOSSIER_RAPPORTS, nom_fichier)

    doc = SimpleDocTemplate(chemin_complet, pagesize=A4,
                             topMargin=2.5*cm, bottomMargin=2.5*cm,
                             leftMargin=2*cm, rightMargin=2*cm)

    styles = getSampleStyleSheet()
    style_titre_page_garde = ParagraphStyle('TitreGarde', parent=styles['Title'], fontSize=26, textColor=COULEUR_PRINCIPALE, spaceAfter=10, alignment=TA_CENTER)
    style_sous_titre_garde = ParagraphStyle('SousTitreGarde', parent=styles['Normal'], fontSize=14, textColor=COULEUR_ACCENT, alignment=TA_CENTER, spaceAfter=40)
    style_section = ParagraphStyle('Section', parent=styles['Heading1'], fontSize=16, textColor=COULEUR_PRINCIPALE, spaceBefore=10, spaceAfter=14)
    style_sous_section = ParagraphStyle('SousSection', parent=styles['Heading3'], fontSize=12, textColor=COULEUR_PRINCIPALE, spaceBefore=12, spaceAfter=6)
    style_normal = ParagraphStyle('NormalPerso', parent=styles['Normal'], fontSize=10, leading=15)
    style_petit = ParagraphStyle('Petit', parent=styles['Normal'], fontSize=8.5, textColor=COULEUR_GRIS, leading=11)
    style_recommandation = ParagraphStyle('Recommandation', parent=styles['Normal'], fontSize=10, leftIndent=15, spaceAfter=8, leading=14)

    elements = []

    # ============ PAGE DE GARDE ============
    elements.append(Spacer(1, 3*cm))
    elements.append(Paragraph("RAPPORT DE CONFORMITÉ IA", style_titre_page_garde))
    elements.append(Paragraph("Gouvernance des systèmes d'Intelligence Artificielle — Norme ISO/IEC 42001", style_sous_titre_garde))

    cible_libelle = donnees.get('systeme_ia_nom') or "Gouvernance globale de l'organisation"

    data_garde = [
        ["Organisation", donnees['organisation_nom']],
        ["Cible évaluée", cible_libelle],
        ["Référentiel", donnees['referentiel_nom']],
        ["Date de génération", datetime.now().strftime('%d/%m/%Y à %H:%M')],
        ["Score global de conformité", f"{donnees.get('score', 0)} %"],
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
        "Rapport généré automatiquement par la Plateforme de Gouvernance et de Conformité des Systèmes d'Intelligence Artificielle.",
        style_petit
    ))
    elements.append(PageBreak())

    # ============ SOMMAIRE ============
    elements.append(Paragraph("Sommaire", style_section))
    sommaire_items = [
        "1. Synthèse pour la Direction",
        "2. Contexte et périmètre de l'évaluation",
        "3. Cadre réglementaire et normatif applicable",
        "4. Analyse des risques identifiés",
        "5. Cartographie des risques et matrice de criticité",
        "6. Évaluation de la conformité (gap analysis)",
        "7. Plan de remédiation priorisé",
        "8. Démarche de gouvernance de l'Intelligence Artificielle",
        "9. Indicateurs de pilotage (KPI / KRI)",
        "10. Conclusion et recommandations stratégiques",
        "11. Annexes",
    ]
    for item in sommaire_items:
        elements.append(Paragraph(item, style_normal))
    elements.append(PageBreak())

    # ============ 1. SYNTHÈSE POUR LA DIRECTION ============
    elements.append(Paragraph("1. Synthèse pour la Direction", style_section))
    synthese_ia = donnees.get('synthese_ia')
    if synthese_ia and synthese_ia.get('synthese'):
        elements.append(Paragraph(synthese_ia['synthese'], style_normal))
    else:
        elements.append(Paragraph(
            f"Cette évaluation porte sur « {cible_libelle} » selon le référentiel {donnees['referentiel_nom']}. "
            f"Le score global de conformité obtenu est de {donnees.get('score', 0)} %.",
            style_normal
        ))
    elements.append(PageBreak())

    # ============ 2. CONTEXTE ET PÉRIMÈTRE ============
    elements.append(Paragraph("2. Contexte et périmètre de l'évaluation", style_section))
    elements.append(Paragraph(
        f"Cette évaluation a été réalisée pour l'organisation <b>{donnees['organisation_nom']}</b>"
        + (f" (secteur : {donnees['organisation_secteur']})" if donnees.get('organisation_secteur') else "")
        + ".", style_normal
    ))
    elements.append(Spacer(1, 8))

    if donnees.get('systeme_ia_nom'):
        elements.append(Paragraph(
            f"<b>Système IA évalué :</b> {donnees['systeme_ia_nom']}", style_normal
        ))
        if donnees.get('systeme_ia_description'):
            elements.append(Paragraph(donnees['systeme_ia_description'], style_normal))
        if donnees.get('systeme_ia_criticite'):
            elements.append(Paragraph(f"<b>Niveau de criticité déclaré :</b> {donnees['systeme_ia_criticite']}", style_normal))
    else:
        elements.append(Paragraph(
            "Cette évaluation porte sur la gouvernance globale de l'organisation, et non sur un système "
            "d'intelligence artificielle spécifique. Elle couvre les aspects stratégiques, organisationnels "
            "et transversaux de la gouvernance IA.", style_normal
        ))

    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"<b>Référentiel utilisé :</b> {donnees['referentiel_nom']}. "
        f"L'évaluation couvre {donnees['nb_clauses_totales']} exigences réparties sur {len(donnees['chapitres'])} chapitres.",
        style_normal
    ))
    elements.append(PageBreak())

    # ============ 3. CADRE RÉGLEMENTAIRE ============
    elements.append(Paragraph("3. Cadre réglementaire et normatif applicable", style_section))
    for paragraphe in CADRE_REGLEMENTAIRE.strip().split("\n\n"):
        elements.append(Paragraph(paragraphe.strip().replace("\n", " "), style_normal))
        elements.append(Spacer(1, 8))
    elements.append(PageBreak())

    # ============ 4. ANALYSE DES RISQUES ============
    elements.append(Paragraph("4. Analyse des risques identifiés", style_section))

    if not donnees['risques']:
        elements.append(Paragraph("Aucun risque n'a été identifié pour cette évaluation.", style_normal))
    else:
        for i, r in enumerate(donnees['risques'], start=1):
            elements.append(Paragraph(f"Risque R{i} — {r['titre']}", style_sous_section))
            if r['description']:
                elements.append(Paragraph(r['description'], style_normal))
            elements.append(Spacer(1, 4))

            data_risque = [["Catégorie", "Impact", "Probabilité", "Niveau de criticité"]]
            data_risque.append([r['categorie'] or "-", r['impact'], r['probabilite'], r['niveau_risque']])
            table_r = Table(data_risque, colWidths=[4*cm, 3.5*cm, 3.5*cm, 4*cm])
            style_r = [
                ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]
            couleur_niv = COULEURS_RISQUE.get(r['niveau_risque'])
            if couleur_niv:
                style_r.append(('TEXTCOLOR', (3, 1), (3, 1), couleur_niv))
                style_r.append(('FONTNAME', (3, 1), (3, 1), 'Helvetica-Bold'))
            table_r.setStyle(TableStyle(style_r))
            elements.append(table_r)
            elements.append(Spacer(1, 14))
    elements.append(PageBreak())

    # ============ 5. CARTOGRAPHIE ET MATRICE DE CRITICITÉ ============
    elements.append(Paragraph("5. Cartographie des risques et matrice de criticité", style_section))

    niveaux_impact = donnees.get('niveaux_impact', ["Faible", "Moyen", "Élevé"])
    niveaux_probabilite = donnees.get('niveaux_probabilite', ["Faible", "Moyen", "Élevée"])
    nb_i = len(niveaux_impact)
    nb_p = len(niveaux_probabilite)

    elements.append(Paragraph(
        f"La matrice ci-dessous croise {nb_p} niveaux de probabilité et {nb_i} niveaux d'impact, "
        "configurés pour cette organisation.", style_normal
    ))
    elements.append(Spacer(1, 10))

    entete_matrice = ["Probabilité \\ Impact"] + niveaux_impact
    data_matrice = [entete_matrice]

    for idx_p in range(nb_p - 1, -1, -1):
        ligne = [niveaux_probabilite[idx_p]]
        for idx_i in range(nb_i):
            niveau = calculer_niveau_matrice(idx_i, idx_p, nb_i, nb_p)
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
            couleur = COULEURS_RISQUE.get(niveau, colors.white)
            style_matrice.append(('BACKGROUND', (col_idx, ligne_idx), (col_idx, ligne_idx), couleur))
            style_matrice.append(('TEXTCOLOR', (col_idx, ligne_idx), (col_idx, ligne_idx), colors.white))

    table_matrice.setStyle(TableStyle(style_matrice))
    elements.append(table_matrice)
    elements.append(Spacer(1, 20))

    if donnees['risques']:
        elements.append(Paragraph("Positionnement des risques identifiés :", style_sous_section))
        data_position = [["Réf.", "Risque", "Impact", "Probabilité", "Criticité"]]
        for i, r in enumerate(donnees['risques'], start=1):
            data_position.append([f"R{i}", r['titre'], r['impact'], r['probabilite'], r['niveau_risque']])
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
            couleur = COULEURS_RISQUE.get(r['niveau_risque'])
            if couleur:
                style_pos.append(('TEXTCOLOR', (4, i), (4, i), couleur))
                style_pos.append(('FONTNAME', (4, i), (4, i), 'Helvetica-Bold'))
        table_pos.setStyle(TableStyle(style_pos))
        elements.append(table_pos)
    elements.append(PageBreak())

    # ============ 6. GAP ANALYSIS ============
    elements.append(Paragraph("6. Évaluation de la conformité (gap analysis)", style_section))

    for chapitre in donnees['chapitres']:
        elements.append(Paragraph(f"{chapitre['numero']}. {chapitre['titre']}", style_sous_section))

        data_table = [["Clause", "Réponse", "Écart", "Département"]]
        for clause_info in chapitre['clauses']:
            data_table.append([
                Paragraph(f"{clause_info['numero']} — {clause_info['titre']}", style_petit),
                clause_info['reponse'] or "Non répondu",
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
            couleur = COULEURS_NIVEAU.get(clause_info['reponse'])
            if couleur:
                style_commandes.append(('TEXTCOLOR', (1, i), (1, i), couleur))
                style_commandes.append(('FONTNAME', (1, i), (1, i), 'Helvetica-Bold'))
        table.setStyle(TableStyle(style_commandes))
        elements.append(table)
        elements.append(Spacer(1, 10))

    elements.append(PageBreak())

    # ============ 7. PLAN DE REMÉDIATION PRIORISÉ ============
    elements.append(Paragraph("7. Plan de remédiation priorisé", style_section))

    toutes_actions = []
    for i, r in enumerate(donnees['risques'], start=1):
        for a in r.get('actions', []):
            toutes_actions.append({
                "risque_ref": f"R{i}",
                "risque_titre": r['titre'],
                "risque_niveau": r['niveau_risque'],
                **a
            })

    ordre_priorite = {"Élevé": 0, "Moyen": 1, "Faible": 2}
    toutes_actions.sort(key=lambda a: ordre_priorite.get(a['risque_niveau'], 3))

    if not toutes_actions:
        elements.append(Paragraph("Aucune action corrective n'a encore été définie pour cette évaluation.", style_normal))
    else:
        data_actions = [["Réf.", "Action corrective", "Échéance", "Statut"]]
        for a in toutes_actions:
            data_actions.append([
                a['risque_ref'],
                Paragraph(f"{a['titre']} (lié à : {a['risque_titre']})", style_petit),
                a['date_echeance'],
                a['statut'],
            ])
        table_actions = Table(data_actions, colWidths=[1.5*cm, 8.5*cm, 3*cm, 3*cm])
        style_actions = [
            ('BACKGROUND', (0, 0), (-1, 0), COULEUR_PRINCIPALE),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]
        table_actions.setStyle(TableStyle(style_actions))
        elements.append(table_actions)

    elements.append(PageBreak())

    # ============ 8. DÉMARCHE DE GOUVERNANCE IA ============
    elements.append(Paragraph("8. Démarche de gouvernance de l'Intelligence Artificielle", style_section))
    for paragraphe in DEMARCHE_GOUVERNANCE_IA.strip().split("\n\n"):
        elements.append(Paragraph(paragraphe.strip().replace("\n", " "), style_normal))
        elements.append(Spacer(1, 8))
    elements.append(PageBreak())

    # ============ 9. INDICATEURS KPI/KRI ============
    elements.append(Paragraph("9. Indicateurs de pilotage (KPI / KRI)", style_section))

    score = donnees.get('score', 0)
    niveau_global = "Maîtrisé" if score >= 70 else "À surveiller" if score >= 40 else "Critique"
    couleur_niveau_global = colors.HexColor("#16a34a") if score >= 70 else colors.HexColor("#f59e0b") if score >= 40 else colors.HexColor("#dc2626")

    data_indicateurs = [
        ["Indicateur", "Valeur"],
        ["Score global de conformité", f"{score} %"],
        ["Niveau de conformité", niveau_global],
        ["Clauses évaluées", str(donnees.get('nb_clauses_totales', 0))],
        ["Clauses en écart (Non conforme / Partiel)", str(donnees.get('nb_clauses_non_conformes', 0))],
        ["Risques identifiés", str(len(donnees['risques']))],
        ["Risques de niveau Élevé", str(donnees.get('nb_risques_eleves', 0))],
        ["Risques ouverts (non traités)", str(donnees.get('nb_risques_ouverts', 0))],
        ["Actions correctives définies", str(len(toutes_actions))],
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
        ('TEXTCOLOR', (1, 2), (1, 2), couleur_niveau_global),
        ('FONTNAME', (1, 2), (1, 2), 'Helvetica-Bold'),
    ]
    table_indicateurs.setStyle(TableStyle(style_ind))
    elements.append(table_indicateurs)
    elements.append(PageBreak())

    # ============ 10. CONCLUSION ET RECOMMANDATIONS ============
    elements.append(Paragraph("10. Conclusion et recommandations stratégiques", style_section))

    if synthese_ia and synthese_ia.get('recommandations'):
        elements.append(Paragraph("Recommandations stratégiques prioritaires :", style_normal))
        elements.append(Spacer(1, 8))
        for i, reco in enumerate(synthese_ia['recommandations'], start=1):
            elements.append(Paragraph(f"{i}. {reco}", style_recommandation))
    else:
        elements.append(Paragraph(
            "Il est recommandé de traiter en priorité les risques de niveau Élevé identifiés dans ce rapport, "
            "et de planifier des actions correctives pour chaque non-conformité relevée.",
            style_normal
        ))
    elements.append(PageBreak())

    # ============ 11. ANNEXES ============
    elements.append(Paragraph("11. Annexes", style_section))

    elements.append(Paragraph("11.1 Glossaire", style_sous_section))
    data_glossaire = [["Terme", "Définition"]]
    for terme, definition in GLOSSAIRE:
        data_glossaire.append([terme, Paragraph(definition, style_petit)])
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

    elements.append(Paragraph("11.2 Références", style_sous_section))
    for ref in REFERENCES:
        elements.append(Paragraph(f"• {ref}", style_petit))

    doc.build(
        elements,
        onFirstPage=lambda c, d: None,
        onLaterPages=partial(dessiner_entete_pied_page, organisation_nom=donnees['organisation_nom'])
    )

    return chemin_complet