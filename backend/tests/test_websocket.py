from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_ws_simple_program():
    code = """
    programa ola {
        escreva 123;
    } fim.
    """
    with client.websocket_connect("/api/ws/run") as ws:
        ws.send_json({"type": "start", "source": code})
        msg1 = ws.receive_json()
        assert msg1["type"] == "stdout"
        assert msg1["text"].strip() == "123"

        msg2 = ws.receive_json()
        assert msg2["type"] == "finished"
        assert msg2["exit_code"] == 0


def test_ws_interactive_leia():
    code = """
    programa interativo {
        var a inteiro;
        var b inteiro;
        leia a;
        leia b;
        escreva a + b;
    } fim.
    """
    with client.websocket_connect("/api/ws/run") as ws:
        ws.send_json({"type": "start", "source": code})

        # Primeiro leia
        msg1 = ws.receive_json()
        assert msg1["type"] == "waiting_input"
        assert msg1["var"] == "a"
        assert msg1["expected_type"] == "INTEIRO"
        ws.send_json({"type": "stdin", "value": "20"})

        # Segundo leia
        msg2 = ws.receive_json()
        assert msg2["type"] == "waiting_input"
        assert msg2["var"] == "b"
        assert msg2["expected_type"] == "INTEIRO"
        ws.send_json({"type": "stdin", "value": "22"})

        # Saída escreva
        msg3 = ws.receive_json()
        assert msg3["type"] == "stdout"
        assert msg3["text"].strip() == "42"

        # Conclusão
        msg4 = ws.receive_json()
        assert msg4["type"] == "finished"
        assert msg4["exit_code"] == 0


def test_ws_abort_during_execution():
    code = """
    programa abortar {
        var x inteiro;
        leia x;
        escreva x;
    } fim.
    """
    with client.websocket_connect("/api/ws/run") as ws:
        ws.send_json({"type": "start", "source": code})
        msg1 = ws.receive_json()
        assert msg1["type"] == "waiting_input"

        ws.send_json({"type": "abort"})
        msg2 = ws.receive_json()
        assert msg2["type"] == "errors"

        msg3 = ws.receive_json()
        assert msg3["type"] == "finished"
        assert msg3["exit_code"] == 1


def test_ws_syntax_error_before_run():
    code = "programa quebrado { x = "
    with client.websocket_connect("/api/ws/run") as ws:
        ws.send_json({"type": "start", "source": code})
        msg1 = ws.receive_json()
        assert msg1["type"] == "errors"
        assert len(msg1["items"]) > 0

        msg2 = ws.receive_json()
        assert msg2["type"] == "finished"
        assert msg2["exit_code"] == 1


def test_ws_runtime_error():
    code = """
    programa erro_runtime {
        var x inteiro;
        x = 5 / 0;
    } fim.
    """
    with client.websocket_connect("/api/ws/run") as ws:
        ws.send_json({"type": "start", "source": code})
        msg1 = ws.receive_json()
        assert msg1["type"] == "errors"
        assert msg1["items"][0]["phase"] == "Execução"
        assert "divisão por zero" in msg1["items"][0]["message"]

        msg2 = ws.receive_json()
        assert msg2["type"] == "finished"
        assert msg2["exit_code"] == 1
