from __future__ import annotations
import asyncio
import queue
import threading
import time
from typing import Callable

from fastapi import WebSocket, WebSocketDisconnect

from src.classes.ast_nodes import ReadNode
from src.classes.interpreter import ExecutionError, Interpreter
from src.classes.optimizer import ConstantFolder
from src.classes.parser import Parser
from src.classes.scanner import Scanner
from src.enum.data_type import DataType

from app.config import DEFAULT_MAX_STEPS, DEFAULT_TIMEOUT_SECONDS
from app.schemas import ErrorItem, RunResponse
from app.services.compiler import analyze_code, parse_error_string


class InteractiveInterpreter(Interpreter):
    """Interpretador customizado com hooks para I/O interativo e captura estruturada de erros."""

    def __init__(
        self,
        input_fn: Callable[[str], str] | None = None,
        output_fn: Callable[[str], None] | None = None,
        on_waiting_input: Callable[[str, str, int, int], None] | None = None,
        max_steps: int | None = None,
    ) -> None:
        super().__init__(
            input_fn=input_fn,
            output_fn=output_fn,
            max_steps=max_steps,
            emit_errors=False,
        )
        self.on_waiting_input = on_waiting_input
        self.last_execution_error: ExecutionError | None = None
        self.current_read_node: ReadNode | None = None

    def visit_read(self, node: ReadNode) -> None:
        self.current_read_node = node
        if self.on_waiting_input is not None:
            var_type = self.get_variable_type(node.name)
            type_str = "INTEIRO" if var_type == DataType.INTEIRO else "BOOLEANO"
            self.on_waiting_input(node.name, type_str, node.line, node.column)
        super().visit_read(node)

    def interpret(self, program) -> bool:
        self.last_execution_error = None
        self.environments = []
        self.type_environments = []
        self.output_history = []
        self.errors = []
        self.step_count = 0

        try:
            program.accept(self)
            return True
        except ExecutionError as err:
            self.last_execution_error = err
            self.errors.append(str(err))
            return False


def run_sync(
    source: str,
    inputs: list[str] | None = None,
    optimize: bool = False,
    max_steps: int | None = None,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
) -> RunResponse:
    """Executa o código MiniLang de forma não-interativa (HTTP fallback)."""
    start_time = time.perf_counter()
    input_values = list(inputs) if inputs is not None else []
    steps_limit = max_steps if max_steps is not None else DEFAULT_MAX_STEPS

    # 1. Análise estática prévia
    analysis = analyze_code(source, optimize=optimize)
    if not analysis.success:
        elapsed = int((time.perf_counter() - start_time) * 1000)
        return RunResponse(
            success=False,
            exit_code=1,
            stdout="",
            errors=analysis.errors,
            duration_ms=elapsed,
        )

    # 2. Obtenção da AST (e otimização se solicitada)
    ast = Parser(Scanner(source), emit_errors=False).parse()
    if ast is None:
        elapsed = int((time.perf_counter() - start_time) * 1000)
        return RunResponse(
            success=False,
            exit_code=1,
            stdout="",
            errors=[ErrorItem(phase="Sintático", line=1, column=1, message="falha ao gerar AST")],
            duration_ms=elapsed,
        )

    if optimize:
        ast = ConstantFolder().optimize(ast)

    # 3. Preparação dos canais de entrada e saída
    outputs: list[str] = []
    input_index = 0

    def sync_input(prompt: str = "") -> str:
        nonlocal input_index
        if input_index < len(input_values):
            val = input_values[input_index]
            input_index += 1
            return str(val)
        raise EOFError("fim inesperado da entrada (EOF)")

    def sync_output(text: str) -> None:
        outputs.append(text)

    interpreter = InteractiveInterpreter(
        input_fn=sync_input,
        output_fn=sync_output,
        max_steps=steps_limit,
    )

    exec_result: dict[str, bool] = {"success": False}
    exec_exception: list[Exception] = []

    def target():
        try:
            exec_result["success"] = interpreter.interpret(ast)
        except Exception as e:
            exec_exception.append(e)

    thread = threading.Thread(target=target, daemon=True)
    thread.start()
    thread.join(timeout=timeout_seconds)

    elapsed = int((time.perf_counter() - start_time) * 1000)
    stdout_text = ("\n".join(outputs) + "\n") if outputs else ""

    if thread.is_alive():
        return RunResponse(
            success=False,
            exit_code=1,
            stdout=stdout_text,
            errors=[
                ErrorItem(
                    phase="Execução",
                    line=1,
                    column=1,
                    message=f"limite de tempo de execução ({timeout_seconds}s) excedido",
                )
            ],
            duration_ms=elapsed,
        )

    if exec_exception:
        exc = exec_exception[0]
        return RunResponse(
            success=False,
            exit_code=1,
            stdout=stdout_text,
            errors=[ErrorItem(phase="Execução", line=1, column=1, message=str(exc))],
            duration_ms=elapsed,
        )

    if not exec_result["success"]:
        errors: list[ErrorItem] = []
        if interpreter.last_execution_error:
            err = interpreter.last_execution_error
            errors.append(
                ErrorItem(
                    phase="Execução",
                    line=err.line,
                    column=err.column,
                    message=err.message,
                )
            )
        else:
            for raw_err in interpreter.errors:
                errors.append(parse_error_string("Execução", raw_err))

        return RunResponse(
            success=False,
            exit_code=1,
            stdout=stdout_text,
            errors=errors,
            duration_ms=elapsed,
        )

    return RunResponse(
        success=True,
        exit_code=0,
        stdout=stdout_text,
        errors=[],
        duration_ms=elapsed,
    )


class WebSocketRunner:
    """Gerencia a sessão interativa de execução sobre WebSocket."""

    def __init__(self, websocket: WebSocket) -> None:
        self.ws = websocket
        self.abort_event = threading.Event()
        self.stdin_queue: queue.Queue[str | None] = queue.Queue()

    async def run(self) -> None:
        await self.ws.accept()
        try:
            while True:
                msg = await self.ws.receive_json()
                msg_type = msg.get("type")

                if msg_type == "start":
                    source = msg.get("source", "")
                    optimize = bool(msg.get("optimize", False))
                    max_steps = msg.get("max_steps", DEFAULT_MAX_STEPS)
                    await self._execute_program(source, optimize=optimize, max_steps=max_steps)
                elif msg_type == "abort":
                    self.abort_event.set()
                    self.stdin_queue.put(None)
                # Outras mensagens recebidas fora de execução são ignoradas
        except WebSocketDisconnect:
            self.abort_event.set()
            self.stdin_queue.put(None)

    async def _execute_program(self, source: str, optimize: bool, max_steps: int) -> None:
        self.abort_event.clear()
        while not self.stdin_queue.empty():
            try:
                self.stdin_queue.get_nowait()
            except queue.Empty:
                break

        start_time = time.perf_counter()

        # 1. Análise Estática
        analysis = analyze_code(source, optimize=optimize)
        if not analysis.success:
            elapsed = int((time.perf_counter() - start_time) * 1000)
            await self.ws.send_json(
                {
                    "type": "errors",
                    "items": [err.model_dump() for err in analysis.errors],
                }
            )
            await self.ws.send_json({"type": "finished", "exit_code": 1, "duration_ms": elapsed})
            return

        # 2. Parse da AST
        ast = Parser(Scanner(source), emit_errors=False).parse()
        if ast is None:
            elapsed = int((time.perf_counter() - start_time) * 1000)
            await self.ws.send_json(
                {
                    "type": "errors",
                    "items": [
                        {
                            "phase": "Sintático",
                            "line": 1,
                            "column": 1,
                            "message": "falha ao gerar AST",
                        }
                    ],
                }
            )
            await self.ws.send_json({"type": "finished", "exit_code": 1, "duration_ms": elapsed})
            return

        if optimize:
            ast = ConstantFolder().optimize(ast)

        loop = asyncio.get_running_loop()
        to_client_queue: asyncio.Queue[dict] = asyncio.Queue()

        def ws_output(text: str) -> None:
            loop.call_soon_threadsafe(
                to_client_queue.put_nowait,
                {"type": "stdout", "text": text + "\n"},
            )

        def ws_waiting_input(var_name: str, expected_type: str, line: int, col: int) -> None:
            loop.call_soon_threadsafe(
                to_client_queue.put_nowait,
                {
                    "type": "waiting_input",
                    "var": var_name,
                    "expected_type": expected_type,
                    "line": line,
                    "column": col,
                },
            )

        def ws_input(prompt: str = "") -> str:
            # Espera valor do cliente ou abort
            deadline = time.perf_counter() + DEFAULT_TIMEOUT_SECONDS
            while not self.abort_event.is_set():
                if time.perf_counter() > deadline:
                    raise ExecutionError(
                        f"[Erro de Execução] Tempo limite de espera para entrada excedido ({DEFAULT_TIMEOUT_SECONDS}s)",
                        interpreter.current_read_node.line if interpreter.current_read_node else 1,
                        interpreter.current_read_node.column if interpreter.current_read_node else 1,
                    )
                try:
                    val = self.stdin_queue.get(timeout=0.1)
                    if val is None or self.abort_event.is_set():
                        raise ExecutionError(
                            "[Erro de Execução] Execução abortada pelo usuário",
                            interpreter.current_read_node.line if interpreter.current_read_node else 1,
                            interpreter.current_read_node.column if interpreter.current_read_node else 1,
                        )
                    return val
                except queue.Empty:
                    continue

            raise ExecutionError(
                "[Erro de Execução] Execução abortada pelo usuário",
                interpreter.current_read_node.line if interpreter.current_read_node else 1,
                interpreter.current_read_node.column if interpreter.current_read_node else 1,
            )

        interpreter = InteractiveInterpreter(
            input_fn=ws_input,
            output_fn=ws_output,
            on_waiting_input=ws_waiting_input,
            max_steps=max_steps,
        )

        exec_done = threading.Event()
        exec_success = {"ok": False}

        def run_target():
            try:
                exec_success["ok"] = interpreter.interpret(ast)
            finally:
                exec_done.set()

        worker_thread = threading.Thread(target=run_target, daemon=True)
        worker_thread.start()

        # Tasks para envio e recepção concorrentes
        async def sender():
            while not exec_done.is_set() or not to_client_queue.empty():
                try:
                    msg = await asyncio.wait_for(to_client_queue.get(), timeout=0.05)
                    await self.ws.send_json(msg)
                except asyncio.TimeoutError:
                    continue

        async def receiver():
            while not exec_done.is_set():
                try:
                    data = await asyncio.wait_for(self.ws.receive_json(), timeout=0.1)
                    dtype = data.get("type")
                    if dtype == "stdin":
                        self.stdin_queue.put(str(data.get("value", "")))
                    elif dtype == "abort":
                        self.abort_event.set()
                        self.stdin_queue.put(None)
                        break
                except asyncio.TimeoutError:
                    continue
                except WebSocketDisconnect:
                    self.abort_event.set()
                    self.stdin_queue.put(None)
                    break

        sender_task = asyncio.create_task(sender())
        receiver_task = asyncio.create_task(receiver())

        # Aguarda término da execução do interpretador ou timeout global
        deadline = time.perf_counter() + DEFAULT_TIMEOUT_SECONDS
        while not exec_done.is_set():
            if time.perf_counter() > deadline:
                self.abort_event.set()
                self.stdin_queue.put(None)
                break
            await asyncio.sleep(0.05)

        # Encerra tasks auxiliares
        await sender_task
        receiver_task.cancel()
        try:
            await receiver_task
        except asyncio.CancelledError:
            pass

        elapsed = int((time.perf_counter() - start_time) * 1000)

        # Trata erros de execução
        if not exec_success["ok"]:
            errors: list[dict] = []
            if interpreter.last_execution_error:
                err = interpreter.last_execution_error
                errors.append(
                    {
                        "phase": "Execução",
                        "line": err.line,
                        "column": err.column,
                        "message": err.message,
                    }
                )
            elif interpreter.errors:
                for raw_err in interpreter.errors:
                    parsed = parse_error_string("Execução", raw_err)
                    errors.append(parsed.model_dump())
            elif self.abort_event.is_set():
                errors.append(
                    {
                        "phase": "Execução",
                        "line": 1,
                        "column": 1,
                        "message": "Execução abortada ou tempo limite excedido",
                    }
                )

            await self.ws.send_json({"type": "errors", "items": errors})
            await self.ws.send_json({"type": "finished", "exit_code": 1, "duration_ms": elapsed})
        else:
            await self.ws.send_json({"type": "finished", "exit_code": 0, "duration_ms": elapsed})
