from __future__ import annotations
from fastapi import APIRouter
from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.compiler import analyze_code

router = APIRouter(prefix="/api", tags=["Compiler"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """Executa a análise estática completa da MiniLang (tokens, AST, tabela de símbolos e diagnósticos)."""
    return analyze_code(source=request.source, optimize=request.optimize)
