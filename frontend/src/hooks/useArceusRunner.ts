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

export type TerminalMessageType =
  | 'command'
  | 'stdout'
  | 'stdin'
  | 'info'
  | 'system'
  | 'success'
  | 'warn'
  | 'error'
  | 'code'
  | 'muted';

export interface TerminalMessage {
  id: string;
  type: TerminalMessageType;
  text: string;
  time?: string;
  meta?: {
    prompt?: string;
    file?: string;
    line?: number;
    column?: number;
  };
}

export interface RunProgramOptions {
  clear?: boolean;
  commandLabel?: string;
  maxSteps?: number;
  fileName?: string;
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
  const analysisAbortRef = useRef<AbortController | null>(null);
  const executionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearExecutionTimeout = () => {
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current);
      executionTimeoutRef.current = null;
    }
  };

  const appendMessage = useCallback(
    (
      type: TerminalMessageType,
      text: string,
      meta?: TerminalMessage['meta']
    ) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setMessages((prev) => [...prev, { id, type, text, time, meta }]);
    },
    []
  );

  // Monitoramento de saúde da API e Cold Start
  const probeHealth = useCallback(async () => {
    const res = await checkHealth();
    if (res.ok) {
      setHealth((prev) => {
        if (prev.state !== 'online') {
          if (healthPollRef.current) clearInterval(healthPollRef.current);
          healthPollRef.current = window.setInterval(() => {
            void probeHealth();
          }, 30000);
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
    void probeHealth();
    healthPollRef.current = window.setInterval(() => {
      void probeHealth();
    }, 4000);

    return () => {
      if (healthPollRef.current) clearInterval(healthPollRef.current);
      if (wsRef.current) wsRef.current.close();
      clearExecutionTimeout();
    };
  }, [probeHealth]);

  const clearConsole = useCallback(() => {
    setMessages([]);
    setExitCode(null);
    setDurationMs(null);
    setWaitingInput(null);
    clearExecutionTimeout();
  }, []);

  // Análise Estática com AbortController para evitar race condition
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

  const executeHttpFallback = useCallback(
    async (source: string, optimize = false, maxSteps = 100000, fileName?: string) => {
      setStatus('RUNNING');
      appendMessage('system', 'Conectando via HTTP de contingência...');

      try {
        const res = await runProgramHttp(source, [], optimize, undefined, maxSteps);
        if (res.stdout) {
          appendMessage('stdout', res.stdout.replace(/\n$/, ''));
        }
        if (res.errors.length > 0) {
          setErrors(res.errors);
          res.errors.forEach((err) => {
            appendMessage(
              'error',
              `[${err.phase}] Linha ${err.line}, Coluna ${err.column}: ${err.message}`,
              { file: fileName, line: err.line, column: err.column }
            );
          });
        }
        setExitCode(res.exit_code);
        setDurationMs(res.duration_ms);
        setStatus(res.success ? 'FINISHED' : 'ERROR');
        appendMessage(
          res.success ? 'success' : 'error',
          res.success
            ? `Finalizado com código 0 (${res.duration_ms} ms)`
            : `Finalizado com código ${res.exit_code} (${res.duration_ms} ms)`
        );
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

  const sendStdin = useCallback(
    (value: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }
      appendMessage('stdin', value);
      wsRef.current.send(JSON.stringify({ type: 'stdin', value }));
      setWaitingInput(null);
      setStatus('RUNNING');
    },
    [appendMessage]
  );

  const abortExecution = useCallback(() => {
    clearExecutionTimeout();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'abort' }));
      wsRef.current.close();
    }
    setStatus('FINISHED');
    setExitCode(1);
    setWaitingInput(null);
    appendMessage('warn', '^C Execução interrompida pelo usuário.');
  }, [appendMessage]);

  const runProgram = useCallback(
    async (source: string, optimize = false, options: RunProgramOptions = {}) => {
      const { clear = false, commandLabel, maxSteps = 100000, fileName } = options;

      if (clear) {
        clearConsole();
      }

      if (commandLabel) {
        appendMessage('command', commandLabel);
      }

      setStatus('CONNECTING');
      setExitCode(null);
      setDurationMs(null);
      setWaitingInput(null);

      // Pré-validação estática rápida
      const quickCheck = await runAnalysis(source, optimize);
      if (quickCheck && !quickCheck.success) {
        setStatus('FINISHED');
        setExitCode(1);
        quickCheck.errors.forEach((err) => {
          appendMessage(
            'error',
            `[${err.phase}] Linha ${err.line}, Coluna ${err.column}: ${err.message}`,
            { file: fileName, line: err.line, column: err.column }
          );
        });
        appendMessage('error', 'Execução cancelada devido a erros de compilação.');
        return;
      }

      clearExecutionTimeout();
      executionTimeoutRef.current = window.setTimeout(() => {
        if (statusRef.current === 'RUNNING' || statusRef.current === 'WAITING_INPUT') {
          abortExecution();
          appendMessage(
            'error',
            '[Tempo Limite] Execução interrompida após 30 segundos sem resposta.'
          );
        }
      }, 30000);

      const wsUrl = getWsUrl();
      let retryCount = 0;
      const MAX_RETRIES = 2;

      const attemptConnect = () => {
        let socket: WebSocket;
        try {
          socket = new WebSocket(wsUrl);
          wsRef.current = socket;
        } catch {
          void executeHttpFallback(source, optimize, maxSteps, fileName);
          return;
        }

        const connectionTimeout = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            socket.close();
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              const delay = Math.pow(2, retryCount) * 350;
              appendMessage(
                'system',
                `Reconectando ao servidor (${retryCount}/${MAX_RETRIES})...`
              );
              setTimeout(attemptConnect, delay);
            } else {
              void executeHttpFallback(source, optimize, maxSteps, fileName);
            }
          }
        }, 2500);

        socket.onopen = () => {
          clearTimeout(connectionTimeout);
          setStatus('RUNNING');
          socket.send(
            JSON.stringify({
              type: 'start',
              source,
              optimize,
              max_steps: maxSteps,
            })
          );
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'stdout') {
              const cleaned = String(msg.text || '').replace(/\n$/, '');
              appendMessage('stdout', cleaned);
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
                appendMessage(
                  'error',
                  `[${err.phase}] Linha ${err.line}, Coluna ${err.column}: ${err.message}`,
                  { file: fileName, line: err.line, column: err.column }
                );
              });
            } else if (msg.type === 'finished') {
              setStatus('FINISHED');
              setExitCode(msg.exit_code);
              setDurationMs(msg.duration_ms);
              appendMessage(
                msg.exit_code === 0 ? 'success' : 'error',
                msg.exit_code === 0
                  ? `Finalizado com código 0 (${msg.duration_ms ?? 0} ms)`
                  : `Finalizado com código ${msg.exit_code} (${msg.duration_ms ?? 0} ms)`
              );
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
              const delay = Math.pow(2, retryCount) * 350;
              setTimeout(attemptConnect, delay);
            } else {
              void executeHttpFallback(source, optimize, maxSteps, fileName);
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
    appendMessage,
    runProgram,
    runAnalysis,
    sendStdin,
    abortExecution,
    clearConsole,
  };
}
