from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load variables from the .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Implementation note.
engine = create_engine(DATABASE_URL)

# Implementation note.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Implementation note.
Base = declarative_base()

# Implementation note.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()