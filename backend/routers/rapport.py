from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models.evaluation import Evaluation
from models.reponse import Response
from models.clause import Clause
from models.chapitre import Chapter
from models.systeme_ia import AISystem
from models.organisation import Organization
from models.referentiel import ReferenceFramework
from models.risque import Risk
from models.rapport import Report
from models.utilisateur import User
from schemas.rapport import ReportOut
from security import get_current_user
from rapport_service import generate_report_pdf
from groq_service import generate_report_summary
from typing import List
from uuid import UUID
import os

router = APIRouter(prefix="/rapports", tags=["Rapports"])


def gather_report_data(evaluation_id: UUID, db: Session):
    from models.action_corrective import CorrectiveAction
    from models.configuration_risque import RiskConfiguration

    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Assessment not found")

    referentiel = db.query(ReferenceFramework).filter(ReferenceFramework.id == evaluation.referentiel_id).first()

    if evaluation.evaluation_type == "Systeme_IA":
        systeme = db.query(AISystem).filter(AISystem.id == evaluation.systeme_ia_id).first()
        organisation = db.query(Organization).filter(Organization.id == systeme.organisation_id).first() if systeme else None
        ai_system_name = systeme.nom if systeme else None
        ai_system_description = systeme.description if systeme else None
        ai_system_criticality = systeme.criticality_level if systeme else None
        real_organization_id = systeme.organisation_id if systeme else None
    else:
        organisation = db.query(Organization).filter(Organization.id == evaluation.organisation_id).first()
        ai_system_name = None
        ai_system_description = None
        ai_system_criticality = None
        real_organization_id = evaluation.organisation_id

    reponses = db.query(Response).filter(Response.evaluation_id == evaluation_id).all()
    responses_by_clause = {r.clause_id: r for r in reponses}

    db_chapters = db.query(Chapter).filter(Chapter.referentiel_id == evaluation.referentiel_id).all()

    chapter_data = []
    total_clause_count = 0
    non_compliant_clause_count = 0

    for chapitre in db_chapters:
        db_clauses = db.query(Clause).filter(
            Clause.chapitre_id == chapitre.id,
            Clause.evaluation_type == evaluation.evaluation_type
        ).order_by(Clause.ordre).all()

        if not db_clauses:
            continue

        clause_info = []
        for clause in db_clauses:
            reponse = responses_by_clause.get(clause.id)
            total_clause_count += 1
            ecart = None
            if reponse:
                if reponse.reponse == "Non conforme":
                    ecart = "Majeur"
                    non_compliant_clause_count += 1
                elif reponse.reponse == "Partiellement conforme":
                    ecart = "Modéré"
                    non_compliant_clause_count += 1
                elif reponse.reponse == "Conforme":
                    ecart = "None"

            clause_info.append({
                "numero": clause.numero,
                "titre": clause.titre,
                "reponse": reponse.reponse if reponse else None,
                "commentaire": reponse.commentaire if reponse else None,
                "ecart": ecart,
                "departement": clause.departement_suggere,
            })

        chapter_data.append({
            "numero": chapitre.numero,
            "titre": chapitre.titre,
            "clauses": clause_info,
        })

    db_risks = db.query(Risk).filter(Risk.evaluation_id == evaluation_id).all()

    risk_data = []
    for r in db_risks:
        db_actions = db.query(CorrectiveAction).filter(CorrectiveAction.risque_id == r.id).all()
        action_info = [{
            "titre": a.titre,
            "description": a.description,
            "date_echeance": a.due_date.strftime('%d/%m/%Y') if a.due_date else "Not defined",
            "statut": a.statut,
        } for a in db_actions]

        risk_data.append({
            "titre": r.titre,
            "description": r.description,
            "categorie": r.categorie,
            "impact": r.impact,
            "probabilite": r.probabilite,
            "niveau_risque": r.risk_level,
            "statut": r.statut,
            "actions": action_info,
        })

    high_risk_count = sum(1 for r in db_risks if r.risk_level == "Élevé")
    open_risk_count = sum(1 for r in db_risks if r.statut == "Ouvert")

    # Configure the organization risk matrix
    config_matrice = None
    if real_organization_id:
        config_matrice = db.query(RiskConfiguration).filter(
            RiskConfiguration.organisation_id == real_organization_id
        ).first()

    impact_levels = config_matrice.impact_levels if config_matrice else ["Faible", "Moyen", "Élevé"]
    probability_levels = config_matrice.probability_levels if config_matrice else ["Faible", "Moyen", "Élevée"]

    return {
        "evaluation_id": str(evaluation_id),
        "organisation_nom": organisation.nom if organisation else "Unknown organization",
        "organisation_secteur": organisation.secteur if organisation else None,
        "organisation_pays": organisation.pays if organisation else None,
        "systeme_ia_nom": ai_system_name,
        "systeme_ia_description": ai_system_description,
        "systeme_ia_criticite": ai_system_criticality,
        "referentiel_nom": referentiel.nom if referentiel else "Unknown framework",
        "score": float(evaluation.score) if evaluation.score is not None else 0,
        "chapitres": chapter_data,
        "risques": risk_data,
        "nb_risques_eleves": high_risk_count,
        "nb_risques_ouverts": open_risk_count,
        "nb_clauses_non_conformes": non_compliant_clause_count,
        "nb_clauses_totales": total_clause_count,
        "type_evaluation": evaluation.evaluation_type,
        "niveaux_impact": impact_levels,
        "niveaux_probabilite": probability_levels,
    }

@router.post("/generer/{evaluation_id}", response_model=ReportOut)
def generate_report(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donnees = gather_report_data(evaluation_id, db)

    # Implementation note.
    try:
        synthese_ia = generate_report_summary(
            target_name=donnees['systeme_ia_nom'] or donnees['organisation_nom'],
            evaluation_type=donnees['type_evaluation'],
            score=donnees['score'],
            high_risk_count=donnees['nb_risques_eleves'],
            open_risk_count=donnees['nb_risques_ouverts'],
            non_compliant_clause_count=donnees['nb_clauses_non_conformes'],
            total_clause_count=donnees['nb_clauses_totales'],
        )
    except Exception:
        synthese_ia = None

    donnees['synthese_ia'] = synthese_ia

    file_path = generate_report_pdf(donnees)

    new_report = Report(
        evaluation_id=evaluation_id,
        global_score=donnees['score'],
        file_path=file_path,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


@router.get("/", response_model=List[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Report).order_by(Report.generation_date.desc()).all()


@router.get("/{rapport_id}/telecharger")
def download_report(
    rapport_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rapport = db.query(Report).filter(Report.id == rapport_id).first()
    if not rapport:
        raise HTTPException(status_code=404, detail="Report not found")

    if not os.path.exists(rapport.file_path):
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable sur le serveur")

    return FileResponse(rapport.file_path, filename=f"rapport_conformite_{rapport_id}.pdf", media_type="application/pdf")