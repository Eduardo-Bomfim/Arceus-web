import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  AnalyzeResponse,
  ErrorItem,
  HealthStatus,
  RunnerStatus,
  WaitingInputState,
} from '../types';
import {
  analyzeCode,
  checkHealth,
  getWsUrl,
  runProgramHttp,
} from '../api/client';

export interface TerminalMessage {
  id: string;
  type: 'stdout' | 'stdin' | 'system' | 'error';
  text: string;
  time?: string;
}

export function useArceusRunner() {
  const [status, setStatus] = useState<RunnerStatus>('IDLE');
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [waitingInput, setWaitingInput] = useState<WaitingInputState | null>(null);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [health, setHealth] = useState<HealthStatus>({
    state: 'checking',
    progress: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const healthPollRef = useRef<number | null>(null);
  const statusRef = useRef<RunnerStatus>(status);
  statusRef.current = status;

  // Race condition prevention na análise
  const analysisAbortRef = useRef<AbortController | null>(null);

  // Execution timeout (30s)
  const executionTimeoutRef = useRef<number | null>(null);

  const clearExecutionTimeout = () => {
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current);
      executionTimeoutRef.current = null;
    }
  };

  // Helper para adicionar mensagens no terminal com timestamp
  const appendMessage = useCallback(
    (type: 'stdout' | 'stdin' | 'system' | 'error', text: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages((prev) => [...prev, { id, type, text, time }]);
    },
    []
  );

  // Monitoramento de saúde e Cold Start do Render (#20: 4s em sleeping, 30s após online)
  const probeHealth = useCallback(async () => {
    const res = await checkHealth();
    if (res.ok) {
      setHealth((prev) => {
        if (prev.state !== 'online') {
          // Ajusta polling para 30s após ficar online
          if (healthPollRef.current) clearInterval(healthPollRef.current);
          healthPollRef.current = window.setInterval(probeHealth, 30000);
        }
        return {
          state: 'online',
          compiler: res.compiler,
          python: res.python,
          progress: 100,
        };
      });
    } else {
      setHealth((prev) => ({
        state: 'sleeping',
        progress: Math.min((prev.progress || 0) + 12, 95),
      }));
    }
  }, []);

  useEffect(() => {
    probeHealth();
    healthPollRef.current = window.setInterval(probeHealth, 4000);

    return () => {
      if (healthPollRef.current) clearInterval(healthPollRef.current);
      if (wsRef.current) wsRef.current.close();
      clearExecutionTimeout();
    };
  }, [probeHealth]);

  // Limpeza de console
  const clearConsole = useCallback(() => {
    setMessages([]);
    setErrors([]);
    setExitCode(null);
    setDurationMs(null);
    setWaitingInput(null);
    clearExecutionTimeout();
  }, []);

  // Análise Estática (#19: com AbortController para prevenir race condition)
  const runAnalysis = useCallback(
    async (source: string, optimize = false) => {
      if (analysisAbortRef.current) {
        analysisAbortRef.current.abort();
      }
      const controller = new AbortController();
      analysisAbortRef.current = controller;

      setIsAnalyzing(true);
      try {
        const res = await analyzeCode(source, optimize, controller.signal);
        setAnalysisData(res);
        setErrors(res.errors);
        return res;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Requisição cancelada por nova digitação
          return null;
        }
        const errMsg = err instanceof Error ? err.message : String(err);
        const errObj: ErrorItem = {
          phase: 'API',
          line: 1,
          column: 1,
          message: `Falha ao conectar com a API: ${errMsg}`,
        };
        setErrors([errObj]);
        return null;
      } finally {
        if (analysisAbortRef.current === controller) {
          setIsAnalyzing(false);
          analysisAbortRef.current = null;
        }
      }
    },
    []
  );

  // Execução não-interativa (Fallback HTTP) (#18: useCallback estável sem stale closures)
  const executeHttpFallback = useCallback(
    async (source: string, optimize = false) => {
      setStatus('RUNNING');
      appendMessage('system', 'Conectando via fallback HTTP...');

      try {
        const res = await runProgramHttp(source, [], optimize);
        if (res.stdout) {
          appendMessage('stdout', res.stdout);
        }
        setErrors(res.errors);
        setExitCode(res.exit_code);
        setDurationMs(res.duration_ms);
        setStatus(res.success ? 'FINISHED' : 'ERROR');
        clearExecutionTimeout();
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const errorItem: ErrorItem = {
          phase: 'Execução',
          line: 1,
          column: 1,
          message: `Falha na execução: ${errMsg}`,
        };
        setErrors([errorItem]);
        appendMessage('error', `[Erro] ${errMsg}`);
        setStatus('ERROR');
        setExitCode(1);
        clearExecutionTimeout();
      }
    },
    [appendMessage]
  );

  // Envio de entrada para comando leia
  const sendStdin = useCallback(
    (value: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }
      appendMessage('stdin', `> ${value}\n`);
      wsRef.current.send(JSON.stringify({ type: 'stdin', value }));
      setWaitingInput(null);
      setStatus('RUNNING');
    },
    [appendMessage]
  );

  // Interrupção de execução
  const abortExecution = useCallback(() => {
    clearExecutionTimeout();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'abort' }));
      wsRef.current.close();
    }
    setStatus('FINISHED');
    setExitCode(1);
    setWaitingInput(null);
    appendMessage('system', '[Execução interrompida pelo usuário]');
  }, [appendMessage]);

  // Execução Interativa via WebSocket com reconnect exponencial (#16) e timeout 30s (#17)
  const runProgram = useCallback(
    async (source: string, optimize = false) => {
      clearConsole();
      setStatus('CONNECTING');
      appendMessage('system', 'Iniciando compilação e execução...');

      // 1. Pré-validação estática rápida
      const quickCheck = await runAnalysis(source, optimize);
      if (quickCheck && !quickCheck.success) {
        setStatus('FINISHED');
        setExitCode(1);
        appendMessage('error', 'Execução cancelada devido a erros de compilação.');
        return;
      }

      // 2. Timeout global do cliente (#17: 30 segundos)
      clearExecutionTimeout();
      executionTimeoutRef.current = window.setTimeout(() => {
        if (statusRef.current === 'RUNNING') {
          abortExecution();
          appendMessage(
            'error',
            '[Tempo Limite] Execução interrompida: excedeu 30 segundos sem resposta.'
          );
        }
      }, 30000);

      // 3. Conexão WebSocket com Retry / Backoff Exponencial (#16)
      const wsUrl = getWsUrl();
      let retryCount = 0;
      const MAX_RETRIES = 3;

      const attemptConnect = () => {
        let socket: WebSocket;
        try {
          socket = new WebSocket(wsUrl);
          wsRef.current = socket;
        } catch {
          executeHttpFallback(source, optimize);
          return;
        }

        const connectionTimeout = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            socket.close();
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              const delay = Math.pow(2, retryCount) * 400; // 800ms, 1600ms, 3200ms
              appendMessage(
                'system',
                `Reconectando WebSocket (tentativa ${retryCount}/${MAX_RETRIES} em ${delay}ms)...`
              );
              setTimeout(attemptConnect, delay);
            } else {
              executeHttpFallback(source, optimize);
            }
          }
        }, 3000);

        socket.onopen = () => {
          clearTimeout(connectionTimeout);
          setStatus('RUNNING');
          socket.send(
            JSON.stringify({
              type: 'start',
              source,
              optimize,
            })
          );
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'stdout') {
              appendMessage('stdout', msg.text);
            } else if (msg.type === 'waiting_input') {
              setStatus('WAITING_INPUT');
              setWaitingInput({
                varName: msg.var,
                expectedType: msg.expected_type,
                line: msg.line,
                column: msg.column,
              });
            } else if (msg.type === 'errors') {
              setErrors((prev) => [...prev, ...msg.items]);
              msg.items.forEach((err: ErrorItem) => {
                appendMessage('error', `[${err.phase}] Linha ${err.line}, Coluna ${err.column}: ${err.message}`);
              });
            } else if (msg.type === 'finished') {
              setStatus('FINISHED');
              setExitCode(msg.exit_code);
              setDurationMs(msg.duration_ms);
              clearExecutionTimeout();
              socket.close();
            }
          } catch (e) {
            console.error('Erro ao processar mensagem WebSocket:', e);
          }
        };

        socket.onerror = () => {
          clearTimeout(connectionTimeout);
          if (statusRef.current === 'CONNECTING') {
            socket.close();
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              const delay = Math.pow(2, retryCount) * 400;
              setTimeout(attemptConnect, delay);
            } else {
              executeHttpFallback(source, optimize);
            }
          } else {
            setStatus('ERROR');
            clearExecutionTimeout();
          }
        };

        socket.onclose = () => {
          clearTimeout(connectionTimeout);
        };
      };

      attemptConnect();
    },
    [clearConsole, appendMessage, runAnalysis, executeHttpFallback, abortExecution]
  );

  return {
    status,
    messages,
    waitingInput,
    errors,
    exitCode,
    durationMs,
    analysisData,
    isAnalyzing,
    health,
    runProgram,
    runAnalysis,
    sendStdin,
    abortExecution,
    clearConsole,
  };
}
