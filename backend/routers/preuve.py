from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models.preuve import Preuve
from models.reponse import Reponse
from models.utilisateur import Utilisateur
from schemas.preuve import PreuveOut
from security import get_current_user
from typing import List, Optional
from uuid import UUID
import os
import shutil
from security import require_roles

router = APIRouter(prefix="/preuves", tags=["Preuves documentaires"])

DOSSIER_UPLOADS = "uploads"
EXTENSIONS_AUTORISEES = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".png", ".jpg", ".jpeg"}
TAILLE_MAX_MO = 10  # 10 Mo max par fichier


@router.post("/", response_model=PreuveOut)
def upload_preuve(
    reponse_id: UUID = Form(...),
    description: Optional[str] = Form(None),
    fichier: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    # Vérifie que la réponse existe
    reponse = db.query(Reponse).filter(Reponse.id == reponse_id).first()
    if not reponse:
        raise HTTPException(status_code=404, detail="Réponse non trouvée")

    # Vérifie l'extension du fichier
    extension = os.path.splitext(fichier.filename)[1].lower()
    if extension not in EXTENSIONS_AUTORISEES:
        raise HTTPException(status_code=400, detail=f"Format non autorisé : {extension}")

    # Crée un nom de fichier unique pour éviter les conflits
    nom_unique = f"{uuid_str()}{extension}"
    chemin_complet = os.path.join(DOSSIER_UPLOADS, nom_unique)

    # Crée le dossier uploads s'il n'existe pas
    os.makedirs(DOSSIER_UPLOADS, exist_ok=True)

    # Sauvegarde le fichier physiquement sur le disque
    with open(chemin_complet, "wb") as buffer:
        shutil.copyfileobj(fichier.file, buffer)

    taille_fichier = os.path.getsize(chemin_complet)

    # Vérifie la taille après sauvegarde
    if taille_fichier > TAILLE_MAX_MO * 1024 * 1024:
        os.remove(chemin_complet)
        raise HTTPException(status_code=400, detail=f"Fichier trop volumineux (max {TAILLE_MAX_MO} Mo)")

    nouvelle_preuve = Preuve(
        reponse_id=reponse_id,
        nom_fichier=fichier.filename,
        chemin_fichier=chemin_complet,
        type_fichier=extension.replace(".", ""),
        taille=taille_fichier,
        description=description,
        uploaded_by=current_user.id,
    )
    db.add(nouvelle_preuve)
    db.commit()
    db.refresh(nouvelle_preuve)
    return nouvelle_preuve


@router.get("/reponse/{reponse_id}", response_model=List[PreuveOut])
def list_preuves_pour_reponse(
    reponse_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    return db.query(Preuve).filter(Preuve.reponse_id == reponse_id).all()


@router.get("/{preuve_id}/telecharger")
def telecharger_preuve(
    preuve_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    preuve = db.query(Preuve).filter(Preuve.id == preuve_id).first()
    if not preuve:
        raise HTTPException(status_code=404, detail="Preuve non trouvée")

    if not os.path.exists(preuve.chemin_fichier):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur")

    return FileResponse(preuve.chemin_fichier, filename=preuve.nom_fichier)


@router.delete("/{preuve_id}")
def supprimer_preuve(
    preuve_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    preuve = db.query(Preuve).filter(Preuve.id == preuve_id).first()
    if not preuve:
        raise HTTPException(status_code=404, detail="Preuve non trouvée")

    if os.path.exists(preuve.chemin_fichier):
        os.remove(preuve.chemin_fichier)

    db.delete(preuve)
    db.commit()
    return {"message": "Preuve supprimée avec succès"}


def uuid_str():
    import uuid
    return str(uuid.uuid4())

from pypdf import PdfReader
from models.clause import Clause
from groq_service import analyser_preuve_texte, analyser_preuve_image
from datetime import datetime


def extraire_texte_pdf(chemin_fichier):
    lecteur = PdfReader(chemin_fichier)
    texte = ""
    for page in lecteur.pages:
        texte += page.extract_text() or ""
    return texte


@router.post("/{preuve_id}/analyser")
def analyser_preuve(
    preuve_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    preuve = db.query(Preuve).filter(Preuve.id == preuve_id).first()
    if not preuve:
        raise HTTPException(status_code=404, detail="Preuve non trouvée")

    if not os.path.exists(preuve.chemin_fichier):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur")

    # Récupère le contexte de la clause via la réponse liée
    reponse = db.query(Reponse).filter(Reponse.id == preuve.reponse_id).first()
    if not reponse:
        raise HTTPException(status_code=404, detail="Réponse associée introuvable")

    clause = db.query(Clause).filter(Clause.id == reponse.clause_id).first()
    if not clause:
        raise HTTPException(status_code=404, detail="Clause associée introuvable")

    try:
        if preuve.type_fichier == "pdf":
            texte = extraire_texte_pdf(preuve.chemin_fichier)
            if not texte.strip():
                raise HTTPException(status_code=400, detail="Impossible d'extraire du texte de ce PDF (probablement scanné/image)")
            resultat = analyser_preuve_texte(texte, clause.titre, clause.description, reponse.reponse)

        elif preuve.type_fichier in ["png", "jpg", "jpeg"]:
            resultat = analyser_preuve_image(preuve.chemin_fichier, clause.titre, clause.description, reponse.reponse)

        else:
            raise HTTPException(status_code=400, detail="Analyse IA disponible uniquement pour les PDF et images")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse IA : {str(e)}")

    preuve.analyse_verdict = resultat.get("verdict")
    preuve.analyse_details = resultat.get("explication")
    preuve.analyse_date = datetime.utcnow()
    db.commit()
    db.refresh(preuve)

    return {
        "verdict": preuve.analyse_verdict,
        "explication": preuve.analyse_details,
    }