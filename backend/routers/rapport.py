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

router = APIRouter(prefix="/reports", tags=["Rapports"])


def gather_report_data(evaluation_id: UUID, db: Session):
    from models.action_corrective import CorrectiveAction
    from models.configuration_risque import RiskConfiguration

    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Assessment not found")

    referentiel = db.query(ReferenceFramework).filter(ReferenceFramework.id == evaluation.framework_id).first()

    if evaluation.evaluation_type == "Systeme_IA":
        systeme = db.query(AISystem).filter(AISystem.id == evaluation.ai_system_id).first()
        organisation = db.query(Organization).filter(Organization.id == systeme.organization_id).first() if systeme else None
        ai_system_name = systeme.name if systeme else None
        ai_system_description = systeme.description if systeme else None
        ai_system_criticality = systeme.criticality_level if systeme else None
        real_organization_id = systeme.organization_id if systeme else None
    else:
        organisation = db.query(Organization).filter(Organization.id == evaluation.organization_id).first()
        ai_system_name = None
        ai_system_description = None
        ai_system_criticality = None
        real_organization_id = evaluation.organization_id

    responses = db.query(Response).filter(Response.evaluation_id == evaluation_id).all()
    responses_by_clause = {r.clause_id: r for r in responses}

    db_chapters = db.query(Chapter).filter(Chapter.framework_id == evaluation.framework_id).all()

    chapter_data = []
    total_clause_count = 0
    non_compliant_clause_count = 0

    for chapitre in db_chapters:
        db_clauses = db.query(Clause).filter(
            Clause.chapter_id == chapitre.id,
            Clause.evaluation_type == evaluation.evaluation_type
        ).order_by(Clause.sort_order).all()

        if not db_clauses:
            continue

        clause_info = []
        for clause in db_clauses:
            response = responses_by_clause.get(clause.id)
            total_clause_count += 1
            ecart = None
            if response:
                if response.response == "Non conforme":
                    ecart = "Majeur"
                    non_compliant_clause_count += 1
                elif response.response == "Partiellement conforme":
                    ecart = "Modéré"
                    non_compliant_clause_count += 1
                elif response.response == "Conforme":
                    ecart = "None"

            clause_info.append({
                "number": clause.number,
                "title": clause.title,
                "response": response.response if response else None,
                "comment": response.comment if response else None,
                "ecart": ecart,
                "departement": clause.suggested_department,
            })

        chapter_data.append({
            "number": chapitre.number,
            "title": chapitre.title,
            "clauses": clause_info,
        })

    db_risks = db.query(Risk).filter(Risk.evaluation_id == evaluation_id).all()

    risk_data = []
    for r in db_risks:
        db_actions = db.query(CorrectiveAction).filter(CorrectiveAction.risk_id == r.id).all()
        action_info = [{
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.strftime('%d/%m/%Y') if a.due_date else "Not defined",
            "status": a.status,
        } for a in db_actions]

        risk_data.append({
            "title": r.title,
            "description": r.description,
            "category": r.category,
            "impact": r.impact,
            "probability": r.probability,
            "risk_level": r.risk_level,
            "status": r.status,
            "actions": action_info,
        })

    high_risk_count = sum(1 for r in db_risks if r.risk_level == "Élevé")
    open_risk_count = sum(1 for r in db_risks if r.status == "Ouvert")

    # Configure the organization risk matrix
    config_matrice = None
    if real_organization_id:
        config_matrice = db.query(RiskConfiguration).filter(
            RiskConfiguration.organization_id == real_organization_id
        ).first()

    impact_levels = config_matrice.impact_levels if config_matrice else ["Faible", "Moyen", "Élevé"]
    probability_levels = config_matrice.probability_levels if config_matrice else ["Faible", "Moyen", "Élevée"]

    return {
        "evaluation_id": str(evaluation_id),
        "organisation_nom": organisation.name if organisation else "Unknown organization",
        "organisation_secteur": organisation.sector if organisation else None,
        "organisation_pays": organisation.country if organisation else None,
        "systeme_ia_nom": ai_system_name,
        "systeme_ia_description": ai_system_description,
        "systeme_ia_criticite": ai_system_criticality,
        "referentiel_nom": referentiel.name if referentiel else "Unknown framework",
        "score": float(evaluation.score) if evaluation.score is not None else 0,
        "chapters": chapter_data,
        "risks": risk_data,
        "nb_risques_eleves": high_risk_count,
        "nb_risques_ouverts": open_risk_count,
        "nb_clauses_non_conformes": non_compliant_clause_count,
        "nb_clauses_totales": total_clause_count,
        "evaluation_type": evaluation.evaluation_type,
        "impact_levels": impact_levels,
        "probability_levels": probability_levels,
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
            evaluation_type=donnees['evaluation_type'],
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