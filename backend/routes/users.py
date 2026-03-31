from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Application, Opportunity
from backend.auth_utils import get_current_user_id

router = APIRouter(tags=["users"])


class UpdateProfileBody(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    accessibilityNeeds: Optional[list[str]] = None
    state: Optional[str] = None
    city: Optional[str] = None
    age: Optional[int] = None
    organizationName: Optional[str] = None
    organizationDescription: Optional[str] = None


def _profile_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "userType": user.user_type,
        "organizationName": user.organization_name,
        "organizationDescription": user.organization_description,
        "bio": user.bio,
        "skills": user.skills or [],
        "interests": user.interests or [],
        "accessibilityNeeds": user.accessibility_needs or [],
        "state": user.state,
        "city": user.city,
        "age": user.age,
        "createdAt": user.created_at.isoformat(),
    }


BADGE_DEFINITIONS = [
    {
        "id": "primer-paso",
        "name": "Primer Paso",
        "description": "Realizaste tu primera postulación",
        "icon": "🌱",
        "color": "green",
        "condition": lambda stats: stats["totalApplications"] >= 1,
    },
    {
        "id": "primer-aceptado",
        "name": "Bienvenido al Equipo",
        "description": "Tu primera postulación fue aceptada",
        "icon": "🤝",
        "color": "blue",
        "condition": lambda stats: stats["acceptedApplications"] >= 1,
    },
    {
        "id": "explorador",
        "name": "Explorador",
        "description": "Postulaste a causas de 3 categorías distintas",
        "icon": "🧭",
        "color": "purple",
        "condition": lambda stats: stats["uniqueCategories"] >= 3,
    },
    {
        "id": "comprometido",
        "name": "Comprometido",
        "description": "Fuiste aceptado en 3 oportunidades",
        "icon": "🔥",
        "color": "orange",
        "condition": lambda stats: stats["acceptedApplications"] >= 3,
    },
    {
        "id": "veterano",
        "name": "Veterano",
        "description": "Fuiste aceptado en 5 oportunidades",
        "icon": "⭐",
        "color": "yellow",
        "condition": lambda stats: stats["acceptedApplications"] >= 5,
    },
    {
        "id": "10-horas",
        "name": "10 Horas de Impacto",
        "description": "Acumulaste 10 horas de voluntariado",
        "icon": "⏱️",
        "color": "teal",
        "condition": lambda stats: stats["totalHours"] >= 10,
    },
    {
        "id": "50-horas",
        "name": "50 Horas de Impacto",
        "description": "Acumulaste 50 horas de voluntariado",
        "icon": "🏅",
        "color": "indigo",
        "condition": lambda stats: stats["totalHours"] >= 50,
    },
    {
        "id": "100-horas",
        "name": "100 Horas de Impacto",
        "description": "Acumulaste 100 horas de voluntariado",
        "icon": "🏆",
        "color": "gold",
        "condition": lambda stats: stats["totalHours"] >= 100,
    },
]


@router.get("/users/profile")
def get_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")
    return _profile_dict(user)


@router.patch("/users/profile")
def update_profile(
    body: UpdateProfileBody,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    if body.name is not None:
        user.name = body.name
    if body.bio is not None:
        user.bio = body.bio
    if body.skills is not None:
        user.skills = body.skills
    if body.interests is not None:
        user.interests = body.interests
    if body.accessibilityNeeds is not None:
        user.accessibility_needs = body.accessibilityNeeds
    if body.state is not None:
        user.state = body.state
    if body.city is not None:
        user.city = body.city
    if body.age is not None:
        user.age = body.age
    if body.organizationName is not None:
        user.organization_name = body.organizationName
    if body.organizationDescription is not None:
        user.organization_description = body.organizationDescription

    db.commit()
    db.refresh(user)
    return _profile_dict(user)


@router.get("/users/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    if user.user_type != "volunteer":
        raise HTTPException(403, "Solo disponible para voluntarios")

    apps = db.query(Application).filter(Application.user_id == user_id).all()

    total_applications = len(apps)
    accepted_apps = [a for a in apps if a.status == "accepted"]
    accepted_count = len(accepted_apps)
    total_hours = sum(a.hours_logged or 0 for a in accepted_apps)

    categories = set()
    for app in apps:
        opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id).first()
        if opp:
            categories.add(opp.category)

    stats = {
        "totalApplications": total_applications,
        "acceptedApplications": accepted_count,
        "totalHours": total_hours,
        "uniqueCategories": len(categories),
    }

    earned_badges = []
    for badge in BADGE_DEFINITIONS:
        if badge["condition"](stats):
            earned_badges.append({
                "id": badge["id"],
                "name": badge["name"],
                "description": badge["description"],
                "icon": badge["icon"],
                "color": badge["color"],
            })

    return {
        **stats,
        "badges": earned_badges,
    }


@router.get("/users/applications")
def get_user_applications(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "Usuario no encontrado")

    if user.user_type == "volunteer":
        apps = db.query(Application).filter(Application.user_id == user_id).all()
        result = []
        for app in apps:
            opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id).first()
            result.append({
                "id": app.id,
                "opportunityId": app.opportunity_id,
                "opportunityTitle": opp.title if opp else "Oportunidad eliminada",
                "userId": app.user_id,
                "userName": user.name,
                "message": app.message,
                "status": app.status,
                "hoursLogged": app.hours_logged or 0,
                "createdAt": app.created_at.isoformat(),
            })
        return result
    else:
        my_opps = db.query(Opportunity).filter(Opportunity.organization_id == user_id).all()
        result = []
        for opp in my_opps:
            apps = db.query(Application).filter(Application.opportunity_id == opp.id).all()
            for app in apps:
                applicant = db.query(User).filter(User.id == app.user_id).first()
                result.append({
                    "id": app.id,
                    "opportunityId": app.opportunity_id,
                    "opportunityTitle": opp.title,
                    "userId": app.user_id,
                    "userName": applicant.name if applicant else "Usuario",
                    "userEmail": applicant.email if applicant else "",
                    "message": app.message,
                    "status": app.status,
                    "hoursLogged": app.hours_logged or 0,
                    "createdAt": app.created_at.isoformat(),
                })
        return result
