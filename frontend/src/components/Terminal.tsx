import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Terminal as TerminalIcon, Trash2, StopCircle, CornerDownLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { RunnerStatus, WaitingInputState } from '../types';

interface TerminalProps {
  stdout: string[];
  status: RunnerStatus;
  waitingInput: WaitingInputState | null;
  exitCode: number | null;
  durationMs: number | null;
  onSendStdin: (val: string) => void;
  onClear: () => void;
  onAbort?: () => void;
}

export function Terminal({
  stdout,
  status,
  waitingInput,
  exitCode,
  durationMs,
  onSendStdin,
  onClear,
  onAbort,
}: TerminalProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [stdout, waitingInput, status, exitCode]);

  // Foco automático no input quando entrar em WAITING_INPUT
  useEffect(() => {
    if (waitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingInput]);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (waitingInput) {
      onSendStdin(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e14] text-slate-200 font-mono text-sm border-t border-[#1e293b]">
      {/* Barra de título do terminal */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0f1520] border-b border-[#1e293b] select-none text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold tracking-wide">Terminal / Console</span>

          {/* Badge de status */}
          {status === 'RUNNING' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              Executando...
            </span>
          )}

          {status === 'WAITING_INPUT' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse text-[11px]">
              Aguardando entrada (leia)...
            </span>
          )}

          {status === 'FINISHED' && exitCode === 0 && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              <CheckCircle2 className="w-3 h-3" />
              Finalizado com sucesso ({durationMs ?? 0}ms)
            </span>
          )}

          {status === 'FINISHED' && exitCode !== 0 && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
              <AlertCircle className="w-3 h-3" />
              Finalizado com erro (código {exitCode})
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1.5">
          {(status === 'RUNNING' || status === 'WAITING_INPUT') && onAbort && (
            <button
              onClick={onAbort}
              title="Interromper execução (Esc)"
              className="flex items-center gap-1 px-2 py-1 rounded bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 text-xs transition border border-rose-700/40"
            >
              <StopCircle className="w-3.5 h-3.5" />
              Parar
            </button>
          )}

          <button
            onClick={onClear}
            title="Limpar console"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1e293b] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área de saída do terminal */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 select-text leading-relaxed font-mono"
        onClick={() => inputRef.current?.focus()}
      >
        {stdout.length === 0 && !waitingInput && status === 'IDLE' && (
          <div className="text-slate-500 italic py-2">
            Pressione <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-slate-300 font-sans text-xs">F9</kbd> ou{' '}
            <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-slate-300 font-sans text-xs">Ctrl + Enter</kbd> para executar o programa MiniLang.
          </div>
        )}

        {/* Saídas do comando escreva */}
        {stdout.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap text-emerald-300">
            {line}
          </div>
        ))}

        {/* Prompt interativo do comando leia */}
        {waitingInput && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1 py-1 text-amber-300 bg-amber-950/20 px-2 rounded border border-amber-900/30">
            <span className="font-semibold text-amber-400">
              Digite um valor para <span className="underline">{waitingInput.varName}</span> ({waitingInput.expectedType}):
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-slate-600 focus:ring-0"
              placeholder={waitingInput.expectedType === 'INTEIRO' ? 'Ex.: 42' : 'verdadeiro / falso'}
              autoFocus
            />
            <button
              type="submit"
              className="p-1 text-amber-400 hover:text-amber-200 hover:bg-amber-900/40 rounded transition"
              title="Enviar entrada (Enter)"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
