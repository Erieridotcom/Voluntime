"""
VoluntaRed - Backend Python (FastAPI)
======================================
Starts automatically with SQLite for local development.
Set DATABASE_URL env var to use PostgreSQL in production.

To run locally:
  pip install -r requirements.txt
  python main.py
  → API at http://localhost:8080/api/
  → Docs at http://localhost:8080/api/docs
"""

import os
import sys

# Allow running as `python main.py` from the backend/ directory OR from the project root
if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.routes.auth import router as auth_router
from backend.routes.users import router as users_router
from backend.routes.opportunities import router as opp_router
from backend.routes.matching_routes import router as matching_router
from backend.routes.locations import router as locations_router
from backend.routes.posts import router as posts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _seed_if_empty()
    yield


app = FastAPI(
    title="VoluntaRed API",
    description="Sistema de matching de voluntariado juvenil en Mexico",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ---------------------------------------------------------------------------
# Error format — return {"error": "..."} to match what the frontend expects
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Extract first human-readable error message from Pydantic validation errors
    errors = exc.errors()
    if errors:
        first = errors[0]
        msg = first.get("msg", "Datos inválidos")
        # Strip "Value error, " prefix that Pydantic adds
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
    else:
        msg = "Datos inválidos"
    return JSONResponse(status_code=422, content={"error": msg})


# ---------------------------------------------------------------------------
# Security headers — added to every response
# ---------------------------------------------------------------------------
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    return response


# ---------------------------------------------------------------------------
# CORS — allow local dev origins; add ALLOWED_ORIGIN env var for production
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
]

# Optional: set ALLOWED_ORIGIN in production to allow your deployed frontend
PROD_ORIGIN = os.getenv("ALLOWED_ORIGIN")
if PROD_ORIGIN:
    ALLOWED_ORIGINS.append(PROD_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Mount all routers
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(opp_router, prefix="/api")
app.include_router(matching_router, prefix="/api")
app.include_router(locations_router, prefix="/api")
app.include_router(posts_router, prefix="/api")


@app.get("/api/healthz")
def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Serve built React frontend as static files (for VS Code / standalone use)
# ---------------------------------------------------------------------------
FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "artifacts", "voluntariado", "dist", "public"
)

if os.path.isdir(FRONTEND_DIST):
    from fastapi.responses import FileResponse

    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        """Serve React SPA for all non-API routes."""
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    print(f"[Static] Serving React app from {FRONTEND_DIST}")
else:
    print(f"[Static] No built frontend found at {FRONTEND_DIST}.")
    print("[Static] Run the frontend separately: cd artifacts/voluntariado && npm run dev")


# ---------------------------------------------------------------------------
# Seed initial data (only if DB is empty)
# ---------------------------------------------------------------------------
def _seed_if_empty():
    from backend.database import SessionLocal
    from backend.models import User, Opportunity
    from backend.auth_utils import hash_password

    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return  # Already seeded

        print("[Seed] Adding initial data...")

        orgs = [
            User(email="greenwave@org.mx", password_hash=hash_password("password123"),
                 name="GreenWave Mexico", user_type="organization",
                 organization_name="GreenWave Mexico",
                 organization_description="Organizacion dedicada a la conservacion del medio ambiente y ecosistemas mexicanos.",
                 skills=[], interests=[], accessibility_needs=[]),
            User(email="educatodos@org.mx", password_hash=hash_password("password123"),
                 name="EducaTodos AC", user_type="organization",
                 organization_name="EducaTodos AC",
                 organization_description="Llevamos educacion de calidad a comunidades rurales. Mas de 10,000 ninos beneficiados.",
                 skills=[], interests=[], accessibility_needs=[]),
            User(email="salud4all@org.mx", password_hash=hash_password("password123"),
                 name="Salud Para Todos", user_type="organization",
                 organization_name="Salud Para Todos",
                 organization_description="Brigadas medicas y de salud mental para comunidades sin acceso a servicios basicos.",
                 skills=[], interests=[], accessibility_needs=[]),
            User(email="artecomunidad@org.mx", password_hash=hash_password("password123"),
                 name="Arte Comunidad", user_type="organization",
                 organization_name="Arte Comunidad MX",
                 organization_description="Usamos el arte urbano y la cultura para transformar comunidades.",
                 skills=[], interests=[], accessibility_needs=[]),
            User(email="patitas@org.mx", password_hash=hash_password("password123"),
                 name="Patitas Felices", user_type="organization",
                 organization_name="Patitas Felices AC",
                 organization_description="Rescate, rehabilitacion y adopcion responsable de animales en situacion de calle.",
                 skills=[], interests=[], accessibility_needs=[]),
        ]
        for org in orgs:
            db.add(org)
        db.flush()

        green, educa, salud, arte, patitas = orgs

        opportunities = [
            Opportunity(title="Reforestacion Sierra Madre Occidental",
                        description="Plantaremos mas de 500 arboles nativos en zonas afectadas por incendios.",
                        requirements="Disponibilidad de fin de semana, ropa comoda",
                        organization_id=green.id, category="Medio Ambiente",
                        skills=["Trabajo en equipo"], interests=["Medio ambiente", "Sustentabilidad"],
                        accessibility_features=["Sin barreras fisicas"],
                        effort_level="medium", location="Sierra Madre Occidental", state="Jalisco",
                        start_date="2026-04-15", end_date="2026-04-16", spots_available=30, is_active=True),
            Opportunity(title="Taller de Lectura para Primaria",
                        description="Facilita talleres de lectura y escritura creativa para ninos de 6 a 12 anos.",
                        requirements="Paciencia, habilidades comunicativas",
                        organization_id=educa.id, category="Educacion",
                        skills=["Comunicacion", "Enseñanza"],
                        interests=["Educacion", "Niñez"],
                        accessibility_features=["Acceso en silla de ruedas", "Sin barreras fisicas"],
                        effort_level="low", location="Toluca", state="Estado de Mexico",
                        start_date="2026-04-01", end_date="2026-06-30", spots_available=15, is_active=True),
            Opportunity(title="Brigada Dental Comunitaria",
                        description="Atencion dental gratuita en comunidades de Oaxaca.",
                        organization_id=salud.id, category="Salud",
                        skills=["Primeros auxilios"],
                        interests=["Salud", "Comunidad"],
                        accessibility_features=["Sin barreras fisicas"],
                        effort_level="high", location="Oaxaca de Juarez", state="Oaxaca",
                        start_date="2026-05-10", end_date="2026-05-12", spots_available=20, is_active=True),
            Opportunity(title="Murales de Identidad en CDMX",
                        description="Crea murales colectivos con jovenes de colonias populares.",
                        requirements="Actitud creativa, apertura al trabajo colaborativo",
                        organization_id=arte.id, category="Arte y Cultura",
                        skills=["Arte y pintura", "Trabajo en equipo"],
                        interests=["Arte y Cultura", "Comunidad"],
                        accessibility_features=["Acceso en silla de ruedas", "Lenguaje de señas"],
                        effort_level="low", location="Colonia Doctores", state="Ciudad de Mexico",
                        start_date="2026-04-20", end_date="2026-05-20", spots_available=25, is_active=True),
            Opportunity(title="Jornada de Adopcion Responsable",
                        description="Apoya jornadas de adopcion de perros y gatos rescatados.",
                        organization_id=patitas.id, category="Animales",
                        skills=["Fotografia", "Redes sociales", "Comunicacion"],
                        interests=["Animales"],
                        accessibility_features=["Acceso en silla de ruedas", "Sin barreras fisicas"],
                        effort_level="low", location="Guadalajara", state="Jalisco",
                        start_date="2026-04-05", spots_available=40, is_active=True),
            Opportunity(title="Clases de Codigo para Chicos",
                        description="Ensena programacion basica a ninos y jovenes de 10 a 17 anos.",
                        requirements="Conocimientos de programacion basica",
                        organization_id=educa.id, category="Tecnologia",
                        skills=["Programacion", "Enseñanza", "Comunicacion"],
                        interests=["Tecnologia", "Educacion", "Niñez"],
                        accessibility_features=["Acceso en silla de ruedas", "Trabajo remoto"],
                        effort_level="low", location="Monterrey", state="Nuevo Leon",
                        start_date="2026-04-12", end_date="2026-07-05", spots_available=12, is_active=True),
            Opportunity(title="Campana de Salud Mental Juvenil",
                        description="Desarrolla contenido digital y talleres sobre salud mental en preparatorias.",
                        organization_id=salud.id, category="Salud",
                        skills=["Redes sociales", "Comunicacion", "Psicologia"],
                        interests=["Salud", "Comunidad"],
                        accessibility_features=["Trabajo remoto", "Lenguaje de señas"],
                        effort_level="medium", location="Puebla de Zaragoza", state="Puebla",
                        start_date="2026-04-15", end_date="2026-09-15", spots_available=18, is_active=True),
        ]
        for opp in opportunities:
            db.add(opp)
        db.commit()
        print("[Seed] Done! Added 5 organizations and 7 opportunities.")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
