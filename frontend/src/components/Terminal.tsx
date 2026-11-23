import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import {
  Trash2,
  CornerDownLeft,
  Loader2,
  RotateCw,
  Square,
  ArrowDownToLine,
  WrapText,
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
  onRerun?: () => void;
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
  onRerun,
}: TerminalProps) {
  const [inputValue, setInputValue] = useState('');
  const [softWrap, setSoftWrap] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, waitingInput, status, exitCode]);

  // Foco no input quando aguardando entrada
  useEffect(() => {
    if (waitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingInput]);

  // Atalho Ctrl+L para limpar terminal
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

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const isRunning = status === 'RUNNING' || status === 'WAITING_INPUT' || status === 'CONNECTING';

  return (
    <div className="flex h-full bg-[var(--bg-surface)] text-[var(--text-main)] font-mono text-xs select-text overflow-hidden transition-colors">
      {/* 1. Barra de Ações Vertical Esquerda (A icônica Left Toolbar da janela Run do JetBrains) */}
      <div className="w-8 bg-[var(--bg-header)] border-r border-[var(--border-color)] flex flex-col items-center py-1.5 gap-1 shrink-0 select-none z-10">
        {/* Botão Rerun (Executar novamente) */}
        <button
          onClick={onRerun}
          disabled={isRunning}
          title="Rerun 'main.ml' (F9 ou Ctrl+F5)"
          className={`p-1 rounded-[4px] transition ${
            !isRunning
              ? 'text-[var(--accent-secondary)] hover:bg-[var(--bg-subtle)]'
              : 'text-[var(--text-muted)]/40 cursor-not-allowed'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Botão Stop (Parar) */}
        <button
          onClick={onAbort}
          disabled={!isRunning}
          title="Stop Process (Ctrl+F2 ou Escape)"
          className={`p-1 rounded-[4px] transition ${
            isRunning
              ? 'text-red-400 hover:bg-red-500/20 animate-pulse'
              : 'text-[var(--text-muted)]/40 cursor-not-allowed'
          }`}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        <div className="w-4 h-[1px] bg-[var(--border-color)] my-0.5" />

        {/* Botão Limpar Console */}
        <button
          onClick={onClear}
          title="Clear All (Ctrl+L)"
          className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Botão Soft-wrap (Quebra de Linha) */}
        <button
          onClick={() => setSoftWrap(!softWrap)}
          title={softWrap ? 'Disable Soft-Wrap' : 'Use Soft-Wrap'}
          className={`p-1 rounded-[4px] transition ${
            softWrap ? 'text-[var(--accent-primary)] bg-[var(--bg-subtle)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <WrapText className="w-3.5 h-3.5" />
        </button>

        {/* Botão Scroll to the end */}
        <button
          onClick={scrollToBottom}
          title="Scroll to the End"
          className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Área do Console JetBrains */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-3 font-mono leading-relaxed select-text space-y-1 ${
          softWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Linha de Comando de Invocação Estilo JetBrains */}
        <div className="text-[var(--text-muted)] text-[11px] select-none pb-1 border-b border-[var(--border-color)]">
          <span className="opacity-70">&quot;C:\MiniLang\bin\arceus.exe&quot;</span> run src\main.ml
        </div>

        {/* Mensagem Inicial quando Ocioso */}
        {messages.length === 0 && !waitingInput && status === 'IDLE' && (
          <div className="text-[var(--text-muted)] py-2 text-[11px]">
            Press <kbd className="px-1 py-0.5 bg-[var(--bg-header)] border border-[var(--border-color)] rounded text-[var(--text-main)]">F9</kbd> or click the green <span className="text-[var(--accent-secondary)] font-semibold">Run</span> button to execute MiniLang.
          </div>
        )}

        {/* Mensagens de Execução */}
        {messages.map((msg) => {
          if (msg.type === 'stdout') {
            return (
              <div key={msg.id} className="text-[var(--text-main)] text-xs">
                {msg.text}
              </div>
            );
          }
          if (msg.type === 'stdin') {
            return (
              <div key={msg.id} className="text-amber-400 text-xs font-semibold">
                {msg.text}
              </div>
            );
          }
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="text-[var(--text-muted)] text-[11px] flex items-center gap-1.5 py-0.5">
                <Info className="w-3 h-3 text-[var(--accent-primary)]" />
                <span>{msg.text}</span>
              </div>
            );
          }
          if (msg.type === 'error') {
            return (
              <div key={msg.id} className="text-red-400 text-xs flex items-start gap-1.5 py-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="font-medium">{msg.text}</span>
              </div>
            );
          }
          return null;
        })}

        {/* Prompt Interativo do Comando leia (JetBrains Stdin) */}
        {waitingInput && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 mt-2 py-1 px-2 rounded-[4px] bg-[var(--bg-header)] border border-[var(--accent-primary)]/50"
          >
            <span className="text-amber-400 font-semibold text-xs">
              input &apos;{waitingInput.varName}&apos; ({waitingInput.expectedType}):
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] font-mono text-xs focus:ring-0"
              placeholder={waitingInput.expectedType === 'INTEIRO' ? 'Ex.: 42' : 'verdadeiro / falso'}
              autoFocus
            />
            <button
              type="submit"
              className="p-1 text-[var(--accent-primary)] hover:text-white rounded transition"
              title="Send Input (Enter)"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Indicador de Status de Processo do JetBrains (Process finished with exit code X) */}
        {status === 'RUNNING' && (
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px] pt-1">
            <Loader2 className="w-3 h-3 animate-spin text-[var(--accent-primary)]" />
            <span>Running...</span>
          </div>
        )}

        {status === 'FINISHED' && exitCode === 0 && (
          <div className="text-[var(--accent-secondary)] text-[11px] pt-2 select-none border-t border-[var(--border-color)] mt-2">
            Process finished with exit code 0 ({durationMs ?? 0} ms)
          </div>
        )}

        {status === 'FINISHED' && exitCode !== 0 && (
          <div className="text-red-400 text-[11px] pt-2 select-none border-t border-[var(--border-color)] mt-2">
            Process finished with exit code {exitCode}
          </div>
        )}
      </div>
    </div>
  );
}
