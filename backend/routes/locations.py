from fastapi import APIRouter, Query

from backend.location_data import get_cities, get_all_states

router = APIRouter(tags=["locations"])


@router.get("/locations/states")
def list_states():
    return get_all_states()


@router.get("/locations/cities")
def list_cities(state: str = Query(..., description="Nombre del estado")):
    cities = get_cities(state)
    return cities
