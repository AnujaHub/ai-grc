from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models.preuve import Evidence
from models.reponse import Response
from models.utilisateur import User
from schemas.preuve import EvidenceOut
from security import get_current_user
from typing import List, Optional
from uuid import UUID
import os
import shutil
from security import require_roles

router = APIRouter(prefix="/preuves", tags=["Documentary Evidence"])

DOSSIER_UPLOADS = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".png", ".jpg", ".jpeg"}
MAX_SIZE_MB = 10  # 10 Mo max par fichier


@router.post("/", response_model=EvidenceOut)
def upload_evidence(
    reponse_id: UUID = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    # Implementation note.
    reponse = db.query(Response).filter(Response.id == reponse_id).first()
    if not reponse:
        raise HTTPException(status_code=404, detail="Response not found")

    # Implementation note.
    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {extension}")

    # Implementation note.
    unique_name = f"{uuid_str()}{extension}"
    full_path = os.path.join(DOSSIER_UPLOADS, unique_name)

    # Implementation note.
    os.makedirs(DOSSIER_UPLOADS, exist_ok=True)

    # Save the file to disk
    with open(full_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(full_path)

    # Implementation note.
    if file_size > MAX_SIZE_MB * 1024 * 1024:
        os.remove(full_path)
        raise HTTPException(status_code=400, detail=f"Fichier trop volumineux (max {TAILLE_MAX_MO} Mo)")

    new_evidence = Evidence(
        reponse_id=reponse_id,
        file_name=file.filename,
        file_path=full_path,
        file_type=extension.replace(".", ""),
        taille=file_size,
        description=description,
        uploaded_by=current_user.id,
    )
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)
    return new_evidence


@router.get("/reponse/{reponse_id}", response_model=List[EvidenceOut])
def list_evidence_for_response(
    reponse_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Evidence).filter(Evidence.reponse_id == reponse_id).all()


@router.get("/{preuve_id}/telecharger")
def download_evidence(
    preuve_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preuve = db.query(Evidence).filter(Evidence.id == preuve_id).first()
    if not preuve:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if not os.path.exists(preuve.file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur")

    return FileResponse(preuve.file_path, filename=preuve.file_name)


@router.delete("/{preuve_id}")
def delete_evidence(
    preuve_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    preuve = db.query(Evidence).filter(Evidence.id == preuve_id).first()
    if not preuve:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if os.path.exists(preuve.file_path):
        os.remove(preuve.file_path)

    db.delete(preuve)
    db.commit()
    return {"message": "Evidence deleted successfully"}


def uuid_str():
    import uuid
    return str(uuid.uuid4())

from pypdf import PdfReader
from models.clause import Clause
from groq_service import analyze_evidence_text, analyze_evidence_image
from datetime import datetime


def extraire_texte_pdf(file_path):
    lecteur = PdfReader(file_path)
    texte = ""
    for page in lecteur.pages:
        texte += page.extract_text() or ""
    return texte


@router.post("/{preuve_id}/analyser")
def analyze_evidence(
    preuve_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preuve = db.query(Evidence).filter(Evidence.id == preuve_id).first()
    if not preuve:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if not os.path.exists(preuve.file_path):
        raise HTTPException(status_code=404, detail="File not found on the server")

    # Implementation note.
    reponse = db.query(Response).filter(Response.id == preuve.reponse_id).first()
    if not reponse:
        raise HTTPException(status_code=404, detail="Associated response not found")

    clause = db.query(Clause).filter(Clause.id == reponse.clause_id).first()
    if not clause:
        raise HTTPException(status_code=404, detail="Associated clause not found")

    try:
        if preuve.file_type == "pdf":
            texte = extraire_texte_pdf(preuve.file_path)
            if not texte.strip():
                raise HTTPException(status_code=400, detail="Unable to extract text from this PDF (it may be scanned or image-based)")
            resultat = analyze_evidence_text(texte, clause.titre, clause.description, reponse.reponse)

        elif preuve.file_type in ["png", "jpg", "jpeg"]:
            resultat = analyze_evidence_image(preuve.file_path, clause.titre, clause.description, reponse.reponse)

        else:
            raise HTTPException(status_code=400, detail="AI analysis is available only for PDFs and images")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    preuve.analyse_verdict = resultat.get("verdict")
    preuve.analysis_details = resultat.get("explication")
    preuve.analysis_date = datetime.utcnow()
    db.commit()
    db.refresh(preuve)

    return {
        "verdict": preuve.analyse_verdict,
        "explication": preuve.analysis_details,
    }