from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional
from uuid import UUID
from database import get_db
from models.organisation import Organization
from models.systeme_ia import AISystem
from models.evaluation import Evaluation
from models.reponse import Response
from models.clause import Clause
from models.risque import Risk
from models.action_corrective import CorrectiveAction
from models.utilisateur import User
from security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
EMPTY_SCOPE = UUID(int=0)


def get_evaluation_ids_for_organization(db: Session, organization_id: Optional[UUID]):
    """
    Return evaluation IDs associated with an organization, whether the evaluation
    targets an Organisation or Systeme_IA. If organization_id is None, return
    None (no filter; include everything).
    """
    if organization_id is None:
        return []

    system_ids = [
        s.id for s in db.query(AISystem.id).filter(AISystem.organization_id == organization_id).all()
    ]

    evaluations = db.query(Evaluation.id).filter(
        (Evaluation.organization_id == organization_id) |
        (Evaluation.ai_system_id.in_(system_ids))
    ).all()

    return [e.id for e in evaluations]


def get_dashboard_organization_id(current_user: User, organization_id: Optional[UUID]):
    if current_user.role == "super_admin":
        return organization_id
    return current_user.organization_id or EMPTY_SCOPE


@router.get("/stats")
def get_dashboard_stats(
    organization_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    organization_id = get_dashboard_organization_id(current_user, organization_id)
    evaluation_ids = get_evaluation_ids_for_organization(db, organization_id)

    query_systemes = db.query(AISystem)
    query_evaluations = db.query(Evaluation)
    query_risques = db.query(Risk)

    if organization_id is not None:
        query_systemes = query_systemes.filter(AISystem.organization_id == organization_id)
        query_evaluations = query_evaluations.filter(Evaluation.id.in_(evaluation_ids))
        query_risques = query_risques.filter(Risk.evaluation_id.in_(evaluation_ids))

    organization_count = db.query(Organization).count() if organization_id is None else (
        1 if organization_id != EMPTY_SCOPE else 0
    )
    ai_system_count = query_systemes.count()
    evaluation_count = query_evaluations.count()
    completed_evaluation_count = query_evaluations.filter(Evaluation.status == "Terminée").count()
    ongoing_evaluation_count = query_evaluations.filter(Evaluation.status == "En cours").count()

    average_score = query_evaluations.filter(Evaluation.status == "Terminée").with_entities(
        func.avg(Evaluation.score)
    ).scalar()
    average_score = round(float(average_score), 2) if average_score is not None else 0

    high_risk_count = query_risques.filter(Risk.risk_level == "Élevé").count()
    medium_risk_count = query_risques.filter(Risk.risk_level == "Moyen").count()
    low_risk_count = query_risques.filter(Risk.risk_level == "Faible").count()
    open_risk_count = query_risques.filter(Risk.status == "Ouvert").count()

    risk_ids = [r.id for r in query_risques.with_entities(Risk.id).all()]
    query_actions = db.query(CorrectiveAction)
    organization_id = get_dashboard_organization_id(current_user, organization_id)
    if organization_id is not None:
        query_actions = query_actions.filter(CorrectiveAction.risk_id.in_(risk_ids))

    open_action_count = query_actions.filter(CorrectiveAction.status != "Terminée").count()
    completed_action_count = query_actions.filter(CorrectiveAction.status == "Terminée").count()

    overdue_action_count = query_actions.filter(
        CorrectiveAction.status != "Terminée",
        CorrectiveAction.due_date != None,
        CorrectiveAction.due_date < date.today()
    ).count()

    return {
        "nb_organisations": organization_count,
        "nb_systemes_ia": ai_system_count,
        "nb_evaluations": evaluation_count,
        "nb_evaluations_terminees": completed_evaluation_count,
        "nb_evaluations_en_cours": ongoing_evaluation_count,
        "score_moyen_conformite": average_score,
        "risks": {
            "eleve": high_risk_count,
            "moyen": medium_risk_count,
            "faible": low_risk_count,
            "ouverts": open_risk_count,
        },
        "corrective_actions": {
            "ouvertes": open_action_count,
            "terminees": completed_action_count,
            "en_retard": overdue_action_count,
        },
    }


@router.get("/scores-par-systeme")
def get_scores_by_system(
    organization_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Evaluation).filter(
        Evaluation.evaluation_type == "Systeme_IA",
        Evaluation.status == "Terminée"
    )

    organization_id = get_dashboard_organization_id(current_user, organization_id)
    if organization_id is not None:
        system_ids = [
            s.id for s in db.query(AISystem.id).filter(AISystem.organization_id == organization_id).all()
        ]
        query = query.filter(Evaluation.ai_system_id.in_(system_ids))

    evaluations = query.all()

    # Implementation note.
    latest_by_system = {}
    for ev in evaluations:
        cle = ev.ai_system_id
        if cle not in latest_by_system or (ev.end_date and latest_by_system[cle].end_date and ev.end_date > latest_by_system[cle].end_date):
            latest_by_system[cle] = ev

    resultats = []
    for systeme_id, evaluation in latest_by_system.items():
        systeme = db.query(AISystem).filter(AISystem.id == systeme_id).first()
        resultats.append({
            "systeme_nom": systeme.name if systeme else "Inconnu",
            "score": float(evaluation.score) if evaluation.score is not None else 0,
        })

    return resultats


@router.get("/non-conformites-par-departement")
def get_non_conformites_par_departement(
    organization_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Response, Clause).join(Clause, Response.clause_id == Clause.id).filter(
        Response.response.in_(["Non conforme", "Partiellement conforme"])
    )

    organization_id = get_dashboard_organization_id(current_user, organization_id)
    evaluation_ids = get_evaluation_ids_for_organization(db, organization_id)
    if organization_id is not None:
        query = query.filter(Response.evaluation_id.in_(evaluation_ids))

    resultats_bruts = query.all()

    compteur = {}
    for response, clause in resultats_bruts:
        departement = clause.suggested_department or "Not specified"
        compteur[departement] = compteur.get(departement, 0) + 1

    return [{"departement": dep, "nombre": nb} for dep, nb in compteur.items()]


from models.action_corrective import CorrectiveAction
from datetime import date


@router.get("/actions-prioritaires")
def get_priority_actions(
    organization_id: Optional[UUID] = None,
    limite: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CorrectiveAction, Risk).join(Risk, CorrectiveAction.risk_id == Risk.id).filter(
        CorrectiveAction.status != "Terminée"
    )

    if organization_id is not None:
        evaluation_ids = get_evaluation_ids_for_organization(db, organization_id)
        query = query.filter(Risk.evaluation_id.in_(evaluation_ids))

    resultats = query.all()

    # Implementation note.
    level_weight = {"Élevé": 3, "Moyen": 2, "Faible": 1}

    actions_with_score = []
    for action, risque in resultats:
        score = level_weight.get(risque.risk_level, 1) * 10

        overdue = False
        if action.due_date:
            jours_restants = (action.due_date - date.today()).days
            if jours_restants < 0:
                score += 50  # Implementation note.
                overdue = True
            elif jours_restants <= 7:
                score += 20  # Implementation note.

        actions_with_score.append({
            "id": str(action.id),
            "title": action.title,
            "risque_titre": risque.title,
            "risk_level": risque.risk_level,
            "due_date": action.due_date.isoformat() if action.due_date else None,
            "en_retard": overdue,
            "score_priorite": score,
        })

    actions_with_score.sort(key=lambda a: a["score_priorite"], reverse=True)

    return actions_with_score[:limite]