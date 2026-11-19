from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, VERSION
from app.routes.analyze import router as analyze_router
from app.routes.health import router as health_router
from app.routes.run import router as run_router
from app.routes.ws_run import router as ws_run_router

app = FastAPI(
    title="Arceus Web API",
    version=VERSION,
    description="API REST e WebSocket para o compilador e playground MiniLang (Arceus)",
)

# Configuração de CORS para permitir acesso a partir da Web IDE
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if "*" not in CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de rotas
app.include_router(health_router)
app.include_router(analyze_router)
app.include_router(run_router)
app.include_router(ws_run_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
