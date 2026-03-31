import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
    print(f"[DB] Usando PostgreSQL en producción.")
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "voluntared.db")
    engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
    print(f"[DB] Usando SQLite local en: {DB_PATH}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _run_migrations():
    with engine.connect() as conn:
        for col, tipo in [("city", "TEXT"), ("hours_logged", "INTEGER DEFAULT 0"),
                          ("media_url", "TEXT"), ("media_type", "VARCHAR(20)")]:
            table = "opportunities" if col == "city" else \
                    "applications" if col == "hours_logged" else "posts"
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {tipo}"))
            except Exception:
                pass
        conn.commit()

def init_db():
    from backend import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    print("[DB] Tablas creadas / verificadas.")
