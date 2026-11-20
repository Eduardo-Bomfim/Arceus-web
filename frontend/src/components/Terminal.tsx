import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import {
  Terminal as TerminalIcon,
  Trash2,
  StopCircle,
  CornerDownLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { RunnerStatus, WaitingInputState } from '../types';
import type { TerminalMessage } from '../hooks/useArceusRunner';

interface TerminalProps {
  messages: TerminalMessage[];
  status: RunnerStatus;
  waitingInput: WaitingInputState | null;
  exitCode: number | null;
  durationMs: number | null;
  onSendStdin: (val: string) => void;
  onClear: () => void;
  onAbort?: () => void;
}

export function Terminal({
  messages,
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

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, waitingInput, status, exitCode]);

  // Foco no input
  useEffect(() => {
    if (waitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingInput]);

  // Quick Win #5: Ctrl+L para limpar terminal
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (waitingInput) {
      onSendStdin(inputValue.trim());
      setInputValue('');
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] text-[var(--text-main)] font-mono text-xs select-text">
      {/* Barra de título do terminal */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] select-none text-xs">
        <div className="flex items-center gap-2">
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
            title="Limpar console (Ctrl + L)"
            className="flex items-center gap-1 p-1 px-2 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-subtle)] transition text-[11px]"
          >
            <Trash2 className="w-3 h-3" />
            <kbd className="hidden sm:inline text-[9px] text-slate-500 bg-[var(--bg-panel)] px-1 rounded">
              Ctrl+L
            </kbd>
          </button>
        </div>
      </div>

      {/* Área de saída do terminal (#6: formatada com cores e tipos de mensagem) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 leading-relaxed font-mono select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {messages.length === 0 && !waitingInput && status === 'IDLE' && (
          <div className="text-[var(--text-muted)] italic py-2">
            Pressione <kbd className="px-1.5 py-0.5 bg-[var(--bg-header)] rounded text-[var(--text-main)] font-sans text-xs">F9</kbd> ou{' '}
            <kbd className="px-1.5 py-0.5 bg-[var(--bg-header)] rounded text-[var(--text-main)] font-sans text-xs">Ctrl + Enter</kbd> para executar o programa MiniLang.
          </div>
        )}

        {/* Linhas de mensagem com cores distintas */}
        {messages.map((msg) => {
          if (msg.type === 'stdout') {
            return (
              <div key={msg.id} className="whitespace-pre-wrap text-emerald-300 flex items-start gap-2">
                <span className="text-[10px] text-emerald-600/70 select-none">▶</span>
                <span className="flex-1 font-semibold">{msg.text}</span>
              </div>
            );
          }
          if (msg.type === 'stdin') {
            return (
              <div key={msg.id} className="whitespace-pre-wrap text-amber-300/90 flex items-start gap-2 italic">
                <span className="text-[10px] text-amber-500 select-none">⌨</span>
                <span className="flex-1">{msg.text}</span>
              </div>
            );
          }
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="text-slate-400 text-xs flex items-center gap-1.5 py-0.5 select-none">
                <Info className="w-3 h-3 text-sky-400/80" />
                <span className="italic">{msg.text}</span>
              </div>
            );
          }
          if (msg.type === 'error') {
            return (
              <div key={msg.id} className="text-rose-400 text-xs flex items-start gap-1.5 py-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium whitespace-pre-wrap">{msg.text}</span>
              </div>
            );
          }
          return null;
        })}

        {/* Prompt interativo do comando leia */}
        {waitingInput && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 mt-2 py-1.5 text-amber-300 bg-amber-950/25 px-2.5 rounded border border-amber-800/40"
          >
            <span className="font-semibold text-amber-400">
              Digite um valor para <span className="underline">{waitingInput.varName}</span> ({waitingInput.expectedType}):
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-amber-700/60 focus:ring-0 text-xs"
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
