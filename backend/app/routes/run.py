from __future__ import annotations
from fastapi import APIRouter
from app.schemas import RunRequest, RunResponse
from app.services.runner import run_sync

router = APIRouter(prefix="/api", tags=["Execution"])


@router.post("/run", response_model=RunResponse)
def run_program(request: RunRequest) -> RunResponse:
    """Executa o programa de forma não-interativa consumindo a lista de inputs sequencialmente."""
    return run_sync(
        source=request.source,
        inputs=request.inputs,
        optimize=request.optimize,
        max_steps=request.max_steps,
    )
