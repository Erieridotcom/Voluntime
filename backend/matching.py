"""
Intelligent matching algorithm between volunteers and opportunities.
Score range: 0–100.
  - Skills match:        0–40 pts
  - Interests match:     0–30 pts
  - Accessibility match: 0–20 pts
  - Location match:      0–10 pts
    - Same city + same state: 10 pts
    - Same state only:          6 pts
    - No user location set:     5 pts  (neutral)
    - Different state:          0 pts
"""

from dataclasses import dataclass
from backend.models import User, Opportunity


@dataclass
class MatchResult:
    opportunity_id: int
    total_score: int
    skills_score: int
    interests_score: int
    accessibility_score: int
    location_score: int
    reasons: list[str]


def _intersect_count(a: list[str], b: list[str]) -> int:
    set_b = {s.lower() for s in b}
    return sum(1 for s in a if s.lower() in set_b)


def _normalize(s: str | None) -> str:
    return (s or "").strip().lower()


def calculate_match_score(user: User, opportunity: Opportunity) -> MatchResult:
    reasons: list[str] = []
    skills_score = 0
    interests_score = 0
    accessibility_score = 0
    location_score = 0

    user_skills = user.skills or []
    user_interests = user.interests or []
    user_accessibility = user.accessibility_needs or []

    opp_skills = opportunity.skills or []
    opp_interests = opportunity.interests or []
    opp_accessibility = opportunity.accessibility_features or []

    # --- Skills (max 40 pts) ---
    if opp_skills and user_skills:
        matched = _intersect_count(user_skills, opp_skills)
        skills_score = round((matched / len(opp_skills)) * 40)
        if matched > 0:
            reasons.append(f"{matched} de tus habilidades coinciden")
    elif not opp_skills:
        skills_score = 40
        reasons.append("No se requieren habilidades especiales")

    # --- Interests (max 30 pts) ---
    if opp_interests and user_interests:
        matched = _intersect_count(user_interests, opp_interests)
        interests_score = round((matched / len(opp_interests)) * 30)
        if matched > 0:
            reasons.append("Coincide con tus intereses")
    elif not opp_interests:
        interests_score = 30

    # --- Accessibility (max 20 pts) ---
    if user_accessibility and opp_accessibility:
        all_covered = all(
            any(
                need.lower() in feat.lower() or feat.lower() in need.lower()
                for feat in opp_accessibility
            )
            for need in user_accessibility
        )
        if all_covered:
            accessibility_score = 20
            reasons.append("Adaptado a tus necesidades de accesibilidad")
        else:
            accessibility_score = 5
    elif not user_accessibility:
        accessibility_score = 20

        # --- Location (max 10 pts) ---
    user_state = _normalize(user.state)
    user_city = _normalize(getattr(user, "city", None))
    opp_city = _normalize(getattr(opportunity, "city", None))

    if getattr(opportunity, "is_remote", False):
        location_score = 10
        reasons.append("Oportunidad remota")
    elif not user_state:
        location_score = 5
    elif opp_city and user_city and user_city == opp_city:
        location_score = 10
        reasons.append("En tu ciudad")
    else:
        location_score = 6
        reasons.append("En tu estado")

    total = min(100, skills_score + interests_score + accessibility_score + location_score)

    return MatchResult(
        opportunity_id=opportunity.id,
        total_score=total,
        skills_score=skills_score,
        interests_score=interests_score,
        accessibility_score=accessibility_score,
        location_score=location_score,
        reasons=reasons,
    )
