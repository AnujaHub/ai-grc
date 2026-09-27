from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional
from uuid import UUID
from database import get_db
from models.organisation import Organisation
from models.systeme_ia import SystemeIA
from models.evaluation import Evaluation
from models.reponse import Reponse
from models.clause import Clause
from models.risque import Risque
from models.action_corrective import ActionCorrective
from models.utilisateur import Utilisateur
from security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Tableau de bord"])


def get_ids_evaluations_pour_organisation(db: Session, organisation_id: Optional[UUID]):
    """
    Retourne la liste des IDs d'évaluations concernant une organisation donnée,
    que l'évaluation soit de type Organisation ou Systeme_IA.
    Si organisation_id est None, retourne None (= pas de filtre, tout est inclus).
    """
    if organisation_id is None:
        return None

    ids_systemes = [
        s.id for s in db.query(SystemeIA.id).filter(SystemeIA.organisation_id == organisation_id).all()
    ]

    evaluations = db.query(Evaluation.id).filter(
        (Evaluation.organisation_id == organisation_id) |
        (Evaluation.systeme_ia_id.in_(ids_systemes))
    ).all()

    return [e.id for e in evaluations]


@router.get("/stats")
def get_dashboard_stats(
    organisation_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    ids_evaluations = get_ids_evaluations_pour_organisation(db, organisation_id)

    query_systemes = db.query(SystemeIA)
    query_evaluations = db.query(Evaluation)
    query_risques = db.query(Risque)

    if organisation_id is not None:
        query_systemes = query_systemes.filter(SystemeIA.organisation_id == organisation_id)
        query_evaluations = query_evaluations.filter(Evaluation.id.in_(ids_evaluations))
        query_risques = query_risques.filter(Risque.evaluation_id.in_(ids_evaluations))

    nb_organisations = db.query(Organisation).count() if organisation_id is None else 1
    nb_systemes_ia = query_systemes.count()
    nb_evaluations = query_evaluations.count()
    nb_evaluations_terminees = query_evaluations.filter(Evaluation.statut == "Terminée").count()
    nb_evaluations_en_cours = query_evaluations.filter(Evaluation.statut == "En cours").count()

    score_moyen = query_evaluations.filter(Evaluation.statut == "Terminée").with_entities(
        func.avg(Evaluation.score)
    ).scalar()
    score_moyen = round(float(score_moyen), 2) if score_moyen is not None else 0

    nb_risques_eleves = query_risques.filter(Risque.niveau_risque == "Élevé").count()
    nb_risques_moyens = query_risques.filter(Risque.niveau_risque == "Moyen").count()
    nb_risques_faibles = query_risques.filter(Risque.niveau_risque == "Faible").count()
    nb_risques_ouverts = query_risques.filter(Risque.statut == "Ouvert").count()

    ids_risques = [r.id for r in query_risques.with_entities(Risque.id).all()]
    query_actions = db.query(ActionCorrective)
    if organisation_id is not None:
        query_actions = query_actions.filter(ActionCorrective.risque_id.in_(ids_risques))

    nb_actions_ouvertes = query_actions.filter(ActionCorrective.statut != "Terminée").count()
    nb_actions_terminees = query_actions.filter(ActionCorrective.statut == "Terminée").count()

    nb_actions_en_retard = query_actions.filter(
        ActionCorrective.statut != "Terminée",
        ActionCorrective.date_echeance != None,
        ActionCorrective.date_echeance < date.today()
    ).count()

    return {
        "nb_organisations": nb_organisations,
        "nb_systemes_ia": nb_systemes_ia,
        "nb_evaluations": nb_evaluations,
        "nb_evaluations_terminees": nb_evaluations_terminees,
        "nb_evaluations_en_cours": nb_evaluations_en_cours,
        "score_moyen_conformite": score_moyen,
        "risques": {
            "eleve": nb_risques_eleves,
            "moyen": nb_risques_moyens,
            "faible": nb_risques_faibles,
            "ouverts": nb_risques_ouverts,
        },
        "actions_correctives": {
            "ouvertes": nb_actions_ouvertes,
            "terminees": nb_actions_terminees,
            "en_retard": nb_actions_en_retard,
        },
    }


@router.get("/scores-par-systeme")
def get_scores_par_systeme(
    organisation_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    query = db.query(Evaluation).filter(
        Evaluation.type_evaluation == "Systeme_IA",
        Evaluation.statut == "Terminée"
    )

    if organisation_id is not None:
        ids_systemes = [
            s.id for s in db.query(SystemeIA.id).filter(SystemeIA.organisation_id == organisation_id).all()
        ]
        query = query.filter(Evaluation.systeme_ia_id.in_(ids_systemes))

    evaluations = query.all()

    # Garde uniquement la dernière évaluation terminée par système IA
    dernieres_par_systeme = {}
    for ev in evaluations:
        cle = ev.systeme_ia_id
        if cle not in dernieres_par_systeme or (ev.date_fin and dernieres_par_systeme[cle].date_fin and ev.date_fin > dernieres_par_systeme[cle].date_fin):
            dernieres_par_systeme[cle] = ev

    resultats = []
    for systeme_id, evaluation in dernieres_par_systeme.items():
        systeme = db.query(SystemeIA).filter(SystemeIA.id == systeme_id).first()
        resultats.append({
            "systeme_nom": systeme.nom if systeme else "Inconnu",
            "score": float(evaluation.score) if evaluation.score is not None else 0,
        })

    return resultats


@router.get("/non-conformites-par-departement")
def get_non_conformites_par_departement(
    organisation_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    ids_evaluations = get_ids_evaluations_pour_organisation(db, organisation_id)

    query = db.query(Reponse, Clause).join(Clause, Reponse.clause_id == Clause.id).filter(
        Reponse.reponse.in_(["Non conforme", "Partiellement conforme"])
    )

    if organisation_id is not None:
        query = query.filter(Reponse.evaluation_id.in_(ids_evaluations))

    resultats_bruts = query.all()

    compteur = {}
    for reponse, clause in resultats_bruts:
        departement = clause.departement_suggere or "Non spécifié"
        compteur[departement] = compteur.get(departement, 0) + 1

    return [{"departement": dep, "nombre": nb} for dep, nb in compteur.items()]


from models.action_corrective import ActionCorrective
from datetime import date


@router.get("/actions-prioritaires")
def get_actions_prioritaires(
    organisation_id: Optional[UUID] = None,
    limite: int = 5,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    query = db.query(ActionCorrective, Risque).join(Risque, ActionCorrective.risque_id == Risque.id).filter(
        ActionCorrective.statut != "Terminée"
    )

    if organisation_id is not None:
        ids_evaluations = get_ids_evaluations_pour_organisation(db, organisation_id)
        query = query.filter(Risque.evaluation_id.in_(ids_evaluations))

    resultats = query.all()

    # Calcule un score de priorité pour chaque action
    poids_niveau = {"Élevé": 3, "Moyen": 2, "Faible": 1}

    actions_avec_score = []
    for action, risque in resultats:
        score = poids_niveau.get(risque.niveau_risque, 1) * 10

        en_retard = False
        if action.date_echeance:
            jours_restants = (action.date_echeance - date.today()).days
            if jours_restants < 0:
                score += 50  # en retard = très prioritaire
                en_retard = True
            elif jours_restants <= 7:
                score += 20  # échéance proche

        actions_avec_score.append({
            "id": str(action.id),
            "titre": action.titre,
            "risque_titre": risque.titre,
            "niveau_risque": risque.niveau_risque,
            "date_echeance": action.date_echeance.isoformat() if action.date_echeance else None,
            "en_retard": en_retard,
            "score_priorite": score,
        })

    actions_avec_score.sort(key=lambda a: a["score_priorite"], reverse=True)

    return actions_avec_score[:limite]