from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from routers import organisation, auth, systeme_ia, referentiel, evaluation, risque, preuve, dashboard, configuration_risque, assistant, rapport, gestion_utilisateurs, journal_audit

app = FastAPI(title="Plateforme GRC - ISO/IEC 42001")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(organisation.router)
app.include_router(auth.router)
app.include_router(systeme_ia.router)
app.include_router(referentiel.router)
app.include_router(evaluation.router)
app.include_router(risque.router)
app.include_router(preuve.router)
app.include_router(dashboard.router)
app.include_router(configuration_risque.router)
app.include_router(assistant.router)
app.include_router(rapport.router)
app.include_router(gestion_utilisateurs.router)
app.include_router(journal_audit.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur la plateforme GRC ISO/IEC 42001"}

@app.get("/health")
def health_check():
    try:
        connection = engine.connect()
        connection.close()
        return {"status": "ok", "database": "connectée ✅"}
    except Exception as e:
        return {"status": "erreur", "détail": str(e)}