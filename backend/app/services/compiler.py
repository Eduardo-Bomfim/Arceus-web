from __future__ import annotations
import io
import re
import sys
from typing import Tuple

from src.classes.optimizer import ConstantFolder
from src.classes.parser import Parser
from src.classes.scanner import Scanner
from src.classes.semantic import SemanticAnalyzer
from src.classes.visitors.printer import PrintAstVisitor
from src.enum.token_type import TokenType

from app.schemas import (
    AnalyzeResponse,
    ErrorItem,
    SymbolInfo,
    TokenInfo,
)

ERROR_PATTERN = re.compile(
    r"\[Erro (?:Léxico|Sintático|Semântico|de Execução)\]\s+Linha\s+(\d+),\s+Coluna\s+(\d+):\s+(.+)"
)


def parse_error_string(phase: str, error_msg: str) -> ErrorItem:
    """Extrai linha, coluna e descrição de mensagens de erro formatadas pelo Arceus."""
    match = ERROR_PATTERN.match(error_msg.strip())
    if match:
        return ErrorItem(
            phase=phase,
            line=int(match.group(1)),
            column=int(match.group(2)),
            message=match.group(3).strip(),
        )
    return ErrorItem(
        phase=phase,
        line=1,
        column=1,
        message=error_msg.strip(),
    )


def analyze_code(source: str, optimize: bool = False) -> AnalyzeResponse:
    """Executa a análise estática completa da MiniLang (Léxico -> Sintático -> Semântico -> Otimizador).

    Não executa o código, apenas inspeciona tokens, AST, tabela de símbolos e diagnósticos.
    """
    tokens: list[TokenInfo] = []
    errors: list[ErrorItem] = []

    # 1. Análise Léxica (coleta de tokens e erros léxicos)
    old_stderr = sys.stderr
    sys.stderr = io.StringIO()
    try:
        scanner = Scanner(source)
        while True:
            tok = scanner.get_next_token()
            tokens.append(
                TokenInfo(
                    type=tok.type.name,
                    value=tok.value,
                    line=tok.line,
                    column=tok.column,
                )
            )
            if tok.type == TokenType.ERROR:
                errors.append(
                    ErrorItem(
                        phase="Léxico",
                        line=tok.line,
                        column=tok.column,
                        message=f"caractere inválido ou inesperado '{tok.value}'",
                    )
                )
            if tok.type == TokenType.EOF:
                break
    finally:
        sys.stderr = old_stderr

    # 2. Análise Sintática
    parser_scanner = Scanner(source)
    parser = Parser(parser_scanner, emit_errors=False)
    ast = parser.parse()

    if parser.errors:
        for err in parser.errors:
            errors.append(parse_error_string("Sintático", err))

    ast_raw_str: str | None = None
    ast_opt_str: str | None = None
    symbol_table: list[SymbolInfo] = []

    # 3. Análise Semântica (apenas se o parser produziu uma AST)
    if ast is not None:
        semantic = SemanticAnalyzer(emit_errors=False)
        semantic.analyze(ast)

        if semantic.errors:
            for err in semantic.errors:
                errors.append(parse_error_string("Semântico", err))

        # Tabela de símbolos
        for sym in semantic.symbol_table.all_symbols:
            scope_desc = "global" if sym.scope_level == 0 else f"escopo_{sym.scope_level}"
            symbol_table.append(
                SymbolInfo(
                    name=sym.name,
                    type=sym.data_type.name,
                    scope=scope_desc,
                    line=sym.line,
                    column=sym.column,
                    initialized=sym.initialized,
                )
            )

        # Formatação da AST
        printer = PrintAstVisitor()
        ast_raw_str = printer.format(ast)

        # 4. Pass de Otimização (Constant Folding)
        if optimize:
            optimizer = ConstantFolder()
            optimized_ast = optimizer.optimize(ast)
            ast_opt_str = printer.format(optimized_ast)

    success = len(errors) == 0
    return AnalyzeResponse(
        success=success,
        tokens=tokens,
        ast_raw=ast_raw_str,
        ast_optimized=ast_opt_str,
        symbol_table=symbol_table,
        errors=errors,
    )
