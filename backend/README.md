# ⚡ Arceus Web API

Back-end em **FastAPI** + **Uvicorn** para a **Web IDE / Playground Online da MiniLang (Arceus)**.

Conecta a interface web diretamente ao núcleo do compilador e interpretador **Arceus**, fornecendo análise estática em tempo real (tokens, AST antes/depois, tabela de símbolos, diagnósticos estruturados) e execução de programas via **WebSocket interativo** ou endpoint **HTTP de fallback**.

---

## 🚀 Tecnologias

- **Python 3.13**
- **FastAPI** (REST & WebSocket)
- **Uvicorn** (Servidor ASGI)
- **Pydantic v2** (Validação e contratos de dados)
- **Arceus** (Compilador & Interpretador MiniLang)
- **uv** (Gerenciador de pacotes rápido)
- **pytest** + **httpx** (Testes automatizados)

---

## 📡 Endpoints da API

### 1. `GET /health`
Endpoint de verificação de integridade e warm-up do container no Render.
- **Resposta `200 OK`:**
  ```json
  {
    "status": "ok",
    "compiler": "arceus",
    "python": "3.13.12"
  }
  ```

---

### 2. `POST /api/analyze`
Executa a análise estática completa sem rodar o código (Léxico -> Sintático -> Semântico -> Otimizador por Constant Folding).
- **Requisição:**
  ```json
  {
    "source": "programa exemplo {\n  var x inteiro;\n  x = 10 + 20;\n  escreva x;\n} fim.",
    "optimize": true
  }
  ```
- **Resposta `200 OK`:**
  ```json
  {
    "success": true,
    "tokens": [
      { "type": "KEYWORD", "value": "programa", "line": 1, "column": 1 },
      { "type": "ID", "value": "exemplo", "line": 1, "column": 10 }
    ],
    "ast_raw": "Program(name='exemplo')\n  Block\n    ...",
    "ast_optimized": "Program(name='exemplo')\n  Block\n    ...",
    "symbol_table": [
      {
        "name": "x",
        "type": "INTEIRO",
        "scope": "global",
        "line": 2,
        "column": 7,
        "initialized": true
      }
    ],
    "errors": []
  }
  ```

---

### 3. `POST /api/run` (Fallback HTTP)
Execução não-interativa do código com suporte a array sequencial de entradas.
- **Requisição:**
  ```json
  {
    "source": "programa dobro {\n  var n inteiro;\n  leia n;\n  escreva n * 2;\n} fim.",
    "inputs": ["21"],
    "optimize": false,
    "max_steps": 100000
  }
  ```
- **Resposta `200 OK`:**
  ```json
  {
    "success": true,
    "exit_code": 0,
    "stdout": "42\n",
    "errors": [],
    "duration_ms": 15
  }
  ```

---

### 4. `WS /api/ws/run` (Execução Interativa via WebSocket)
Sessão interativa streaming para execução com comandos `leia` e `escreva` em tempo real.

#### Protocolo de Mensagens:
1. **Cliente envia `start`:**
   ```json
   { "type": "start", "source": "...", "optimize": false, "max_steps": 100000 }
   ```
2. **Servidor envia saídas `stdout`:**
   ```json
   { "type": "stdout", "text": "Digite sua idade:\n" }
   ```
3. **Servidor pausa em `leia` e envia `waiting_input`:**
   ```json
   { "type": "waiting_input", "var": "idade", "expected_type": "INTEIRO", "line": 3, "column": 5 }
   ```
4. **Cliente responde com `stdin`:**
   ```json
   { "type": "stdin", "value": "25" }
   ```
5. **Cliente pode cancelar a qualquer momento enviando `abort`:**
   ```json
   { "type": "abort" }
   ```
6. **Ao finalizar:**
   - Sucesso:
     ```json
     { "type": "finished", "exit_code": 0, "duration_ms": 45 }
     ```
   - Erro (léxico, sintático, semântico ou runtime):
     ```json
     {
       "type": "errors",
       "items": [
         { "phase": "Execução", "line": 4, "column": 10, "message": "divisão por zero" }
       ]
     }
     { "type": "finished", "exit_code": 1, "duration_ms": 12 }
     ```

---

## 🛡️ Travas de Segurança em Runtime

- **Limite de passos (`max_steps`):** padrão de 100.000 passos para abortar laços infinitos como `enquanto (verdadeiro)`.
- **Timeout global:** 10 segundos por padrão configurável via `EXECUTION_TIMEOUT_SECONDS`.
- **Thread worker isolada:** I/O síncrono do interpretador é isolado do loop assíncrono do FastAPI/WebSocket.

---

## 🛠️ Comandos de Desenvolvimento

### Instalar dependências
```bash
uv sync
```

### Executar a suíte de testes
```bash
uv run pytest
```

### Iniciar servidor de desenvolvimento
```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
