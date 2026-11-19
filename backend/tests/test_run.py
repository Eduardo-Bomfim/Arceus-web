from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_run_success_output():
    code = """
    programa teste {
        var a inteiro;
        var b inteiro;
        a = 15;
        b = 27;
        escreva a + b;
    } fim.
    """
    response = client.post("/api/run", json={"source": code})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["exit_code"] == 0
    assert data["stdout"].strip() == "42"
    assert data["errors"] == []


def test_run_with_inputs():
    code = """
    programa interativo {
        var n inteiro;
        leia n;
        escreva n * 2;
    } fim.
    """
    response = client.post("/api/run", json={"source": code, "inputs": ["21"]})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["exit_code"] == 0
    assert data["stdout"].strip() == "42"


def test_run_syntax_error():
    code = "programa teste { var x inteiro; x = 10"
    response = client.post("/api/run", json={"source": code})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    assert data["exit_code"] == 1
    assert len(data["errors"]) > 0


def test_run_division_by_zero():
    code = """
    programa divzero {
        var x inteiro;
        x = 10 / 0;
    } fim.
    """
    response = client.post("/api/run", json={"source": code})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    assert data["exit_code"] == 1
    assert len(data["errors"]) > 0
    assert data["errors"][0]["phase"] == "Execução"
    assert "divisão por zero" in data["errors"][0]["message"]


def test_run_max_steps_exceeded():
    code = """
    programa loop_infinito {
        enquanto (verdadeiro) {
        }
    } fim.
    """
    response = client.post("/api/run", json={"source": code, "max_steps": 200})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    assert data["exit_code"] == 1
    assert len(data["errors"]) > 0
    assert "passos" in data["errors"][0]["message"]


def test_run_eof_error():
    code = """
    programa precisa_input {
        var x inteiro;
        leia x;
    } fim.
    """
    response = client.post("/api/run", json={"source": code, "inputs": []})
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    assert data["exit_code"] == 1
    assert "EOF" in data["errors"][0]["message"]
