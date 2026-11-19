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

export function useArceusRunner() {
  const [status, setStatus] = useState<RunnerStatus>('IDLE');
  const [stdout, setStdout] = useState<string[]>([]);
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

  // Monitoramento de saúde e Cold Start do Render
  const probeHealth = useCallback(async () => {
    const res = await checkHealth();
    if (res.ok) {
      setHealth({
        state: 'online',
        compiler: res.compiler,
        python: res.python,
        progress: 100,
      });
      if (healthPollRef.current) {
        clearInterval(healthPollRef.current);
        healthPollRef.current = null;
      }
    } else {
      setHealth((prev) => ({
        state: 'sleeping',
        progress: Math.min((prev.progress || 0) + 15, 95),
      }));
    }
  }, []);

  useEffect(() => {
    probeHealth();
    healthPollRef.current = window.setInterval(probeHealth, 4000);

    return () => {
      if (healthPollRef.current) clearInterval(healthPollRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [probeHealth]);

  // Limpeza de console
  const clearConsole = useCallback(() => {
    setStdout([]);
    setErrors([]);
    setExitCode(null);
    setDurationMs(null);
    setWaitingInput(null);
  }, []);

  // Análise Estática
  const runAnalysis = useCallback(
    async (source: string, optimize = false) => {
      setIsAnalyzing(true);
      try {
        const res = await analyzeCode(source, optimize);
        setAnalysisData(res);
        setErrors(res.errors);
        return res;
      } catch (err: unknown) {
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
        setIsAnalyzing(false);
      }
    },
    []
  );

  // Envio de entrada para comando leia
  const sendStdin = useCallback((value: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    setStdout((prev) => [...prev, `${value}\n`]);
    wsRef.current.send(JSON.stringify({ type: 'stdin', value }));
    setWaitingInput(null);
    setStatus('RUNNING');
  }, []);

  // Interrupção de execução
  const abortExecution = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'abort' }));
      wsRef.current.close();
    }
    setStatus('FINISHED');
    setExitCode(1);
    setWaitingInput(null);
    setStdout((prev) => [...prev, '\n[Execução interrompida pelo usuário]\n']);
  }, []);

  // Execução Interativa via WebSocket (com fallback automático para HTTP)
  const runProgram = useCallback(
    async (source: string, optimize = false) => {
      clearConsole();
      setStatus('CONNECTING');

      // Pré-validação estática rápida
      const quickCheck = await runAnalysis(source, optimize);
      if (quickCheck && !quickCheck.success) {
        setStatus('FINISHED');
        setExitCode(1);
        return;
      }

      const wsUrl = getWsUrl();
      let socket: WebSocket;

      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;
      } catch (err) {
        console.warn('Falha ao abrir WebSocket, tentando fallback HTTP...', err);
        executeHttpFallback(source, optimize);
        return;
      }

      const connectionTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          console.warn('Timeout na conexão WebSocket. Usando fallback HTTP...');
          socket.close();
          executeHttpFallback(source, optimize);
        }
      }, 3500);

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
            setStdout((prev) => [...prev, msg.text]);
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
          } else if (msg.type === 'finished') {
            setStatus('FINISHED');
            setExitCode(msg.exit_code);
            setDurationMs(msg.duration_ms);
            socket.close();
          }
        } catch (e) {
          console.error('Erro ao processar mensagem WebSocket:', e);
        }
      };

      socket.onerror = () => {
        clearTimeout(connectionTimeout);
        if (status === 'CONNECTING') {
          socket.close();
          executeHttpFallback(source, optimize);
        } else {
          setStatus('ERROR');
        }
      };

      socket.onclose = () => {
        clearTimeout(connectionTimeout);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearConsole, runAnalysis]
  );

  // Execução não-interativa (Fallback HTTP)
  const executeHttpFallback = async (source: string, optimize = false) => {
    setStatus('RUNNING');
    try {
      const res = await runProgramHttp(source, [], optimize);
      if (res.stdout) {
        setStdout([res.stdout]);
      }
      setErrors(res.errors);
      setExitCode(res.exit_code);
      setDurationMs(res.duration_ms);
      setStatus(res.success ? 'FINISHED' : 'ERROR');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrors([
        {
          phase: 'Execução',
          line: 1,
          column: 1,
          message: `Falha na execução: ${errMsg}`,
        },
      ]);
      setStatus('ERROR');
      setExitCode(1);
    }
  };

  return {
    status,
    stdout,
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
