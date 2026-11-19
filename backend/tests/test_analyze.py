from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_analyze_valid_program():
    code = """
    programa teste {
        var x inteiro;
        var ativo booleano;
        x = 42;
        ativo = verdadeiro;
        escreva x;
    } fim.
    """
    response = client.post("/api/analyze", json={"source": code, "optimize": False})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert len(data["errors"]) == 0
    assert len(data["tokens"]) > 0
    assert data["ast_raw"] is not None
    assert "Program(name='teste')" in data["ast_raw"]
    assert data["ast_optimized"] is None

    # Tabela de símbolos
    symbols = {s["name"]: s for s in data["symbol_table"]}
    assert "x" in symbols
    assert symbols["x"]["type"] == "INTEIRO"
    assert "ativo" in symbols
    assert symbols["ativo"]["type"] == "BOOLEANO"


def test_analyze_with_constant_folding():
    code = """
    programa opt {
        var res inteiro;
        res = 10 + 20 * 2;
        escreva res;
    } fim.
    """
    response = client.post("/api/analyze", json={"source": code, "optimize": True})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["ast_optimized"] is not None
    # 10 + 20 * 2 deve ser dobrado para 50
    assert "Literal(50, INTEIRO)" in data["ast_optimized"]


def test_analyze_lexical_error():
    code = "programa teste { var x inteiro; x = @; } fim."
    response = client.post("/api/analyze", json={"source": code})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    lex_errors = [e for e in data["errors"] if e["phase"] == "Léxico"]
    assert len(lex_errors) > 0
    assert lex_errors[0]["line"] == 1


def test_analyze_syntax_error():
    # Esquecendo o ponto final ou o fim
    code = "programa teste { var x inteiro; x = 10 } fim."
    response = client.post("/api/analyze", json={"source": code})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    syntax_errors = [e for e in data["errors"] if e["phase"] == "Sintático"]
    assert len(syntax_errors) > 0


def test_analyze_semantic_undeclared_variable():
    code = """
    programa teste {
        var x inteiro;
        y = 10;
    } fim.
    """
    response = client.post("/api/analyze", json={"source": code})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    sem_errors = [e for e in data["errors"] if e["phase"] == "Semântico"]
    assert len(sem_errors) > 0
    assert "não declarada" in sem_errors[0]["message"]


def test_analyze_semantic_type_mismatch():
    code = """
    programa teste {
        var x inteiro;
        x = verdadeiro;
    } fim.
    """
    response = client.post("/api/analyze", json={"source": code})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    sem_errors = [e for e in data["errors"] if e["phase"] == "Semântico"]
    assert len(sem_errors) > 0
