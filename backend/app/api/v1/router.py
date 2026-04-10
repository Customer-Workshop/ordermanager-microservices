from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    locations,
    practice_units,
    roles,
    candidates,
    staffing_requests,
    rubrics,
    sla,
    interviews,
    dashboard,
    ai,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(locations.router)
api_router.include_router(practice_units.router)
api_router.include_router(roles.router)
api_router.include_router(candidates.router)
api_router.include_router(staffing_requests.router)
api_router.include_router(rubrics.router)
api_router.include_router(sla.router)
api_router.include_router(interviews.router)
api_router.include_router(dashboard.router)
api_router.include_router(ai.router)
