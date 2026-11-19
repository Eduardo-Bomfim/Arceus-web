from __future__ import annotations
from fastapi import APIRouter, WebSocket
from app.services.runner import WebSocketRunner

router = APIRouter(prefix="/api/ws", tags=["Interactive Execution"])


@router.websocket("/run")
async def websocket_run(websocket: WebSocket) -> None:
    """Endpoint WebSocket para execução interativa streaming de programas MiniLang."""
    runner = WebSocketRunner(websocket)
    await runner.run()
