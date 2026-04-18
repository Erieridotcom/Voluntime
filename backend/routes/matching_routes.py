from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Opportunity
from backend.auth_utils import get_current_user_id
from backend.matching import calculate_match_score
from backend.routes.opportunities import _opp_dict

router = APIRouter(tags=["matching"])


@router.get("/matching/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    opportunities = db.query(Opportunity).filter(Opportunity.is_active == True).all()
    user_state = (user.state or "").strip().lower()
    opportunities = [
        opp for opp in opportunities
        if opp.is_remote
        or not user_state
        or (opp.state or "").strip().lower() == user_state
]

    scored = []
    for opp in opportunities:
        org = db.query(User).filter(User.id == opp.organization_id).first()
        match = calculate_match_score(user, opp)
        scored.append({
            "opportunity": _opp_dict(opp, org),
            "matchScore": match.total_score,
            "matchReasons": match.reasons,
        })

    scored.sort(key=lambda x: x["matchScore"], reverse=True)
    return scored


@router.get("/matching/score/{opportunity_id}")
def get_match_score(
    opportunity_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()

    if not user or not opp:
        raise HTTPException(404, "No encontrado")

    match = calculate_match_score(user, opp)

    return {
        "opportunityId": opportunity_id,
        "totalScore": match.total_score,
        "skillsScore": match.skills_score,
        "interestsScore": match.interests_score,
        "accessibilityScore": match.accessibility_score,
        "locationScore": match.location_score,
        "reasons": match.reasons,
    }
