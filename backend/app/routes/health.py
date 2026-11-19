from __future__ import annotations
import platform
from fastapi import APIRouter
from app.config import COMPILER_NAME
from app.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Endpoint de health check e warm-up para acordar instâncias gratuitas no Render."""
    return HealthResponse(
        status="ok",
        compiler=COMPILER_NAME,
        python=platform.python_version(),
    )
