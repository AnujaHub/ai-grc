from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import Utilisateur
from models.systeme_ia import SystemeIA
from models.evaluation import Evaluation
from models.risque import Risque
from models.action_corrective import ActionCorrective
from schemas.assistant import ChatRequest, ChatResponse
from security import get_current_user
from groq_service import repondre_assistant_ia
from sqlalchemy import func
from datetime import date

router = APIRouter(prefix="/assistant", tags=["Assistant IA"])


def construire_contexte_organisation(organisation_id, db: Session):
    ids_systemes = [s.id for s in db.query(SystemeIA.id).filter(SystemeIA.organisation_id == organisation_id).all()]

    evaluations = db.query(Evaluation).filter(
        (Evaluation.organisation_id == organisation_id) |
        (Evaluation.systeme_ia_id.in_(ids_systemes))
    ).all()
    ids_evaluations = [e.id for e in evaluations]

    nb_systemes_ia = len(ids_systemes)
    nb_evaluations = len(evaluations)

    scores = [float(e.score) for e in evaluations if e.statut == "Terminée" and e.score is not None]
    score_moyen = round(sum(scores) / len(scores), 2) if scores else 0

    nb_risques_ouverts = db.query(Risque).filter(
        Risque.evaluation_id.in_(ids_evaluations),
        Risque.statut == "Ouvert"
    ).count()

    ids_risques = [r.id for r in db.query(Risque.id).filter(Risque.evaluation_id.in_(ids_evaluations)).all()]
    nb_actions_en_retard = db.query(ActionCorrective).filter(
        ActionCorrective.risque_id.in_(ids_risques),
        ActionCorrective.statut != "Terminée",
        ActionCorrective.date_echeance != None,
        ActionCorrective.date_echeance < date.today()
    ).count()

    return {
        "nb_systemes_ia": nb_systemes_ia,
        "nb_evaluations": nb_evaluations,
        "score_moyen_conformite": score_moyen,
        "nb_risques_ouverts": nb_risques_ouverts,
        "nb_actions_en_retard": nb_actions_en_retard,
    }


@router.post("/chat", response_model=ChatResponse)
def chat_avec_assistant(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    contexte = None
    if data.organisation_id:
        contexte = construire_contexte_organisation(data.organisation_id, db)

    messages_historique = [{"role": m.role, "content": m.content} for m in data.messages]

    reponse = repondre_assistant_ia(messages_historique, contexte)

    return {"reponse": reponse}