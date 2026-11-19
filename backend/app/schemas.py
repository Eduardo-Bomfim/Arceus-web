from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field

PhaseType = Literal["Léxico", "Sintático", "Semântico", "Execução"]


class HealthResponse(BaseModel):
    status: str = "ok"
    compiler: str = "arceus"
    python: str


class TokenInfo(BaseModel):
    type: str
    value: str
    line: int
    column: int


class SymbolInfo(BaseModel):
    name: str
    type: str
    scope: str
    line: int
    column: int
    initialized: bool


class ErrorItem(BaseModel):
    phase: PhaseType | str
    line: int
    column: int
    message: str


class AnalyzeRequest(BaseModel):
    source: str = Field(..., description="Código fonte MiniLang")
    optimize: bool = Field(False, description="Ativar pass de Constant Folding")


class AnalyzeResponse(BaseModel):
    success: bool
    tokens: list[TokenInfo] = Field(default_factory=list)
    ast_raw: str | None = None
    ast_optimized: str | None = None
    symbol_table: list[SymbolInfo] = Field(default_factory=list)
    errors: list[ErrorItem] = Field(default_factory=list)


class RunRequest(BaseModel):
    source: str = Field(..., description="Código fonte MiniLang")
    inputs: list[str] = Field(default_factory=list, description="Valores fornecidos para comandos leia")
    optimize: bool = Field(False, description="Ativar pass de Constant Folding")
    max_steps: int | None = Field(None, description="Limite máximo de passos de execução")


class RunResponse(BaseModel):
    success: bool
    exit_code: int
    stdout: str
    errors: list[ErrorItem] = Field(default_factory=list)
    duration_ms: int
