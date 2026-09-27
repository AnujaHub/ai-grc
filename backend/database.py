from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Charge les variables du fichier .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Crée la connexion vers PostgreSQL
engine = create_engine(DATABASE_URL)

# Crée une "session" = une conversation avec la base de données
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base dont hériteront tous nos modèles (tables)
Base = declarative_base()

# Fonction utilisée pour obtenir une session dans nos routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()