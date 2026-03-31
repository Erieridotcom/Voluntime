"""
Database connection — SQLite para desarrollo local.
La base de datos se crea automáticamente en backend/voluntared.db
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DB_PATH = os.path.join(os.path.dirname(__file__), "voluntared.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
print(f"[DB] Base de datos en: {DB_PATH}")

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
    """
    Agrega columnas nuevas si aún no existen.
    SQLAlchemy's create_all() solo crea tablas nuevas, no columnas nuevas.
    """
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
    """Crea todas las tablas si no existen y ejecuta migraciones de columnas."""
    from backend import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    print("[DB] Tablas creadas / verificadas.")
