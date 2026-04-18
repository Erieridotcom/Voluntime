from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import User, Opportunity, Application
from backend.auth_utils import get_current_user_id, get_optional_user_id

router = APIRouter(tags=["opportunities"])

CATEGORIES = [
    {"id": "medio-ambiente", "name": "Medio Ambiente", "icon": "Leaf"},
    {"id": "educacion", "name": "Educacion", "icon": "BookOpen"},
    {"id": "salud", "name": "Salud", "icon": "Heart"},
    {"id": "arte", "name": "Arte y Cultura", "icon": "Palette"},
    {"id": "animales", "name": "Animales", "icon": "PawPrint"},
    {"id": "comunidad", "name": "Comunidad", "icon": "Users"},
    {"id": "derechos-humanos", "name": "Derechos Humanos", "icon": "Scale"},
    {"id": "tecnologia", "name": "Tecnologia", "icon": "Cpu"},
]


class CreateOpportunityBody(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    category: str
    skills: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    accessibilityFeatures: Optional[list[str]] = None
    effortLevel: str = "medium"
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    spotsAvailable: Optional[int] = None
    isRemote: bool = False



class UpdateOpportunityBody(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    category: Optional[str] = None
    skills: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    accessibilityFeatures: Optional[list[str]] = None
    effortLevel: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    isRemote: Optional[bool] = None
    spotsAvailable: Optional[int] = None
    isActive: Optional[bool] = None
    

class ApplyBody(BaseModel):
    message: str


def _opp_dict(opp: Opportunity, org: Optional[User]) -> dict:
    return {
        "id": opp.id,
        "title": opp.title,
        "description": opp.description,
        "organizationId": opp.organization_id,
        "organizationName": (org.organization_name or org.name) if org else "Organizacion",
        "category": opp.category,
        "skills": opp.skills or [],
        "interests": opp.interests or [],
        "accessibilityFeatures": opp.accessibility_features or [],
        "effortLevel": opp.effort_level,
        "location": opp.location,
        "city": opp.city,
        "state": opp.state,
        "startDate": opp.start_date,
        "endDate": opp.end_date,
        "spotsAvailable": opp.spots_available,
        "isRemote": opp.is_remote,
        "isActive": opp.is_active,
        "imageUrl": opp.image_url,
        "createdAt": opp.created_at.isoformat(),
    }


@router.get("/opportunities/categories/list")
def list_categories():
    return CATEGORIES


@router.get("/opportunities")
def list_opportunities(
    category: Optional[str] = Query(None),
    accessibility: Optional[str] = Query(None),
    effort: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Opportunity).filter(Opportunity.is_active == True)

    if category:
        query = query.filter(Opportunity.category == category)
    if effort:
        query = query.filter(Opportunity.effort_level == effort)
    if state:
        query = query.filter(func.lower(Opportunity.state) == state.lower())

    opportunities = query.all()

    # Filter by accessibility (JSON array search)
    if accessibility:
        acc_lower = accessibility.lower()
        opportunities = [
            o for o in opportunities
            if any(acc_lower in f.lower() for f in (o.accessibility_features or []))
        ]

    # Full-text search in title, description, skills, interests
    if search:
        q = search.lower()
        opportunities = [
            o for o in opportunities
            if (q in o.title.lower()
                or q in o.description.lower()
                or any(q in s.lower() for s in (o.skills or []))
                or any(q in i.lower() for i in (o.interests or [])))
        ]

    result = []
    for opp in opportunities:
        org = db.query(User).filter(User.id == opp.organization_id).first()
        result.append(_opp_dict(opp, org))
    return result


@router.post("/opportunities", status_code=201)
def create_opportunity(
    body: CreateOpportunityBody,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.user_type != "organization":
        raise HTTPException(403, "Solo las organizaciones pueden publicar oportunidades")

    opp = Opportunity(
        title=body.title,
        description=body.description,
        requirements=body.requirements,
        organization_id=user_id,
        category=body.category,
        skills=body.skills or [],
        interests=body.interests or [],
        accessibility_features=body.accessibilityFeatures or [],
        effort_level=body.effortLevel,
        location=body.location,
        state=body.state,
        is_remote=body.isRemote,
        start_date=body.startDate,
        end_date=body.endDate,
        spots_available=body.spotsAvailable,
        is_active=True,
        image_url=None,
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return _opp_dict(opp, user)


@router.get("/opportunities/{opp_id}")
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(404, "Oportunidad no encontrada")

    org = db.query(User).filter(User.id == opp.organization_id).first()
    applicants_count = db.query(Application).filter(Application.opportunity_id == opp_id).count()

    d = _opp_dict(opp, org)
    d["requirements"] = opp.requirements
    d["organizationDescription"] = org.organization_description if org else None
    d["applicantsCount"] = applicants_count
    return d


@router.patch("/opportunities/{opp_id}")
def update_opportunity(
    opp_id: int,
    body: UpdateOpportunityBody,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(404, "Oportunidad no encontrada")
    if opp.organization_id != user_id:
        raise HTTPException(403, "No tienes permiso")

    if body.title is not None:
        opp.title = body.title
    if body.description is not None:
        opp.description = body.description
    if body.requirements is not None:
        opp.requirements = body.requirements
    if body.category is not None:
        opp.category = body.category
    if body.skills is not None:
        opp.skills = body.skills
    if body.interests is not None:
        opp.interests = body.interests
    if body.accessibilityFeatures is not None:
        opp.accessibility_features = body.accessibilityFeatures
    if body.effortLevel is not None:
        opp.effort_level = body.effortLevel
    if body.location is not None:
        opp.location = body.location
    if body.state is not None:
        opp.state = body.state
    if body.startDate is not None:
        opp.start_date = body.startDate
    if body.endDate is not None:
    if body.isRemote is not None:
        opp.is_remote = body.isRemote    
        opp.end_date = body.endDate
    if body.spotsAvailable is not None:
        opp.spots_available = body.spotsAvailable
    if body.isActive is not None:
        opp.is_active = body.isActive

    db.commit()
    db.refresh(opp)
    org = db.query(User).filter(User.id == opp.organization_id).first()
    return _opp_dict(opp, org)


class UpdateApplicationBody(BaseModel):
    status: Optional[str] = None
    hoursLogged: Optional[int] = None


@router.patch("/opportunities/{opp_id}/applications/{app_id}")
def update_application(
    opp_id: int,
    app_id: int,
    body: UpdateApplicationBody,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(404, "Oportunidad no encontrada")
    if opp.organization_id != user_id:
        raise HTTPException(403, "No tienes permiso")

    app = db.query(Application).filter(Application.id == app_id, Application.opportunity_id == opp_id).first()
    if not app:
        raise HTTPException(404, "Postulación no encontrada")

    if body.status is not None:
        if body.status not in ("pending", "accepted", "rejected"):
            raise HTTPException(400, "Estado inválido")
        app.status = body.status
    if body.hoursLogged is not None:
        app.hours_logged = body.hoursLogged

    db.commit()
    db.refresh(app)
    applicant = db.query(User).filter(User.id == app.user_id).first()
    return {
        "id": app.id,
        "opportunityId": app.opportunity_id,
        "opportunityTitle": opp.title,
        "userId": app.user_id,
        "userName": applicant.name if applicant else "Usuario",
        "message": app.message,
        "status": app.status,
        "hoursLogged": app.hours_logged or 0,
        "createdAt": app.created_at.isoformat(),
    }


@router.get("/organizations/dashboard")
def org_dashboard(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.user_type != "organization":
        raise HTTPException(403, "Solo disponible para organizaciones")

    my_opps = db.query(Opportunity).filter(Opportunity.organization_id == user_id).all()

    opp_stats = []
    total_pending = 0
    total_accepted = 0
    total_rejected = 0
    total_hours = 0

    for opp in my_opps:
        apps = db.query(Application).filter(Application.opportunity_id == opp.id).all()
        pending = sum(1 for a in apps if a.status == "pending")
        accepted = sum(1 for a in apps if a.status == "accepted")
        rejected = sum(1 for a in apps if a.status == "rejected")
        hours = sum(a.hours_logged or 0 for a in apps if a.status == "accepted")

        total_pending += pending
        total_accepted += accepted
        total_rejected += rejected
        total_hours += hours

        opp_stats.append({
            "opportunityId": opp.id,
            "title": opp.title[:40] + ("..." if len(opp.title) > 40 else ""),
            "category": opp.category,
            "pending": pending,
            "accepted": accepted,
            "rejected": rejected,
            "totalApplications": len(apps),
            "hoursLogged": hours,
            "isActive": opp.is_active,
        })

    return {
        "totalOpportunities": len(my_opps),
        "totalApplications": total_pending + total_accepted + total_rejected,
        "totalPending": total_pending,
        "totalAccepted": total_accepted,
        "totalRejected": total_rejected,
        "totalHoursLogged": total_hours,
        "opportunityStats": opp_stats,
    }


@router.delete("/opportunities/{opp_id}", status_code=204)
def delete_opportunity(
    opp_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(404, "Oportunidad no encontrada")
    if opp.organization_id != user_id:
        raise HTTPException(403, "No tienes permiso")
    db.delete(opp)
    db.commit()


@router.post("/opportunities/{opp_id}/apply", status_code=201)
def apply_to_opportunity(
    opp_id: int,
    body: ApplyBody,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(404, "Oportunidad no encontrada")
    if not body.message:
        raise HTTPException(400, "Se requiere un mensaje de motivacion")

    user = db.query(User).filter(User.id == user_id).first()
    app = Application(opportunity_id=opp_id, user_id=user_id, message=body.message, status="pending")
    db.add(app)
    db.commit()
    db.refresh(app)

    return {
        "id": app.id,
        "opportunityId": app.opportunity_id,
        "opportunityTitle": opp.title,
        "userId": app.user_id,
        "userName": user.name if user else "Usuario",
        "message": app.message,
        "status": app.status,
        "createdAt": app.created_at.isoformat(),
    }


@router.get("/stats/summary")
def stats_summary(db: Session = Depends(get_db)):
    total_opportunities = db.query(Opportunity).filter(Opportunity.is_active == True).count()
    total_volunteers = db.query(User).filter(User.user_type == "volunteer").count()
    total_organizations = db.query(User).filter(User.user_type == "organization").count()
    total_applications = db.query(Application).count()

    opps = db.query(Opportunity.category).filter(Opportunity.is_active == True).all()
    cat_map: dict[str, int] = {}
    for (cat,) in opps:
        cat_map[cat] = cat_map.get(cat, 0) + 1

    return {
        "totalOpportunities": total_opportunities,
        "totalVolunteers": total_volunteers,
        "totalOrganizations": total_organizations,
        "totalApplications": total_applications,
        "categoryCounts": [{"category": k, "count": v} for k, v in cat_map.items()],
    }
