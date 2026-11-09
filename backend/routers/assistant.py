from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import User
from models.systeme_ia import AISystem
from models.evaluation import Evaluation
from models.risque import Risk
from models.action_corrective import CorrectiveAction
from schemas.assistant import ChatRequest, ChatResponse
from security import get_current_user
from groq_service import repondre_assistant_ia
from sqlalchemy import func
from datetime import date

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


def build_organization_context(organisation_id, db: Session):
    system_ids = [s.id for s in db.query(AISystem.id).filter(AISystem.organisation_id == organisation_id).all()]

    evaluations = db.query(Evaluation).filter(
        (Evaluation.organisation_id == organisation_id) |
        (Evaluation.systeme_ia_id.in_(system_ids))
    ).all()
    evaluation_ids = [e.id for e in evaluations]

    ai_system_count = len(system_ids)
    evaluation_count = len(evaluations)

    scores = [float(e.score) for e in evaluations if e.statut == "Terminée" and e.score is not None]
    average_score = round(sum(scores) / len(scores), 2) if scores else 0

    open_risk_count = db.query(Risk).filter(
        Risk.evaluation_id.in_(evaluation_ids),
        Risk.statut == "Ouvert"
    ).count()

    risk_ids = [r.id for r in db.query(Risk.id).filter(Risk.evaluation_id.in_(evaluation_ids)).all()]
    overdue_action_count = db.query(CorrectiveAction).filter(
        CorrectiveAction.risque_id.in_(risk_ids),
        CorrectiveAction.statut != "Terminée",
        CorrectiveAction.due_date != None,
        CorrectiveAction.due_date < date.today()
    ).count()

    return {
        "nb_systemes_ia": ai_system_count,
        "nb_evaluations": evaluation_count,
        "score_moyen_conformite": average_score,
        "nb_risques_ouverts": open_risk_count,
        "nb_actions_en_retard": overdue_action_count,
    }


@router.post("/chat", response_model=ChatResponse)
def chat_avec_assistant(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contexte = None
    if data.organisation_id:
        contexte = build_organization_context(data.organisation_id, db)

    messages_historique = [{"role": m.role, "content": m.content} for m in data.messages]

    reponse = repondre_assistant_ia(messages_historique, contexte)

    return {"reponse": reponse}