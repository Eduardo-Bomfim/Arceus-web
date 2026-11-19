from __future__ import annotations
import os

VERSION = "0.1.0"
COMPILER_NAME = "arceus"

# Limites de segurança
DEFAULT_MAX_STEPS = int(os.getenv("MAX_STEPS", "100000"))
DEFAULT_TIMEOUT_SECONDS = float(os.getenv("EXECUTION_TIMEOUT_SECONDS", "10.0"))

# Configuração de CORS
_raw_cors = os.getenv("CORS_ORIGINS", "")
if _raw_cors:
    CORS_ORIGINS = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://arceus-web.pages.dev",
        "*",
    ]
