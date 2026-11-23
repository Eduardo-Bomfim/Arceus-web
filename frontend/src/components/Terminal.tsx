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
    <div className="flex h-full bg-[#1e1f22] text-[#dfe1e5] font-mono text-xs select-text overflow-hidden">
      {/* 1. Barra de Ações Vertical Esquerda (A icônica Left Toolbar da janela Run do JetBrains) */}
      <div className="w-8 bg-[#2b2d30] border-r border-[#393b40] flex flex-col items-center py-1.5 gap-1 shrink-0 select-none z-10">
        {/* Botão Rerun (Executar novamente) */}
        <button
          onClick={onRerun}
          disabled={isRunning}
          title="Rerun 'main.ml' (F9 ou Ctrl+F5)"
          className={`p-1 rounded-[4px] transition ${
            !isRunning
              ? 'text-[#59a869] hover:bg-[#35373c]'
              : 'text-[#4b5059] cursor-not-allowed'
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
              ? 'text-[#f75464] hover:bg-[#f75464]/20 animate-pulse'
              : 'text-[#4b5059] cursor-not-allowed'
          }`}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        <div className="w-4 h-[1px] bg-[#393b40] my-0.5" />

        {/* Botão Limpar Console */}
        <button
          onClick={onClear}
          title="Clear All (Ctrl+L)"
          className="p-1 rounded-[4px] text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c] transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Botão Soft-wrap (Quebra de Linha) */}
        <button
          onClick={() => setSoftWrap(!softWrap)}
          title={softWrap ? 'Disable Soft-Wrap' : 'Use Soft-Wrap'}
          className={`p-1 rounded-[4px] transition ${
            softWrap ? 'text-[#3574f0] bg-[#35373c]' : 'text-[#868a91] hover:text-[#dfe1e5]'
          }`}
        >
          <WrapText className="w-3.5 h-3.5" />
        </button>

        {/* Botão Scroll to the end */}
        <button
          onClick={scrollToBottom}
          title="Scroll to the End"
          className="p-1 rounded-[4px] text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c] transition"
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
        <div className="text-[#868a91] text-[11px] select-none pb-1 border-b border-[#2b2d30]">
          <span className="text-[#6f737a]">&quot;C:\MiniLang\bin\arceus.exe&quot;</span> run src\main.ml
        </div>

        {/* Mensagem Inicial quando Ocioso */}
        {messages.length === 0 && !waitingInput && status === 'IDLE' && (
          <div className="text-[#868a91] py-2 text-[11px]">
            Press <kbd className="px-1 py-0.5 bg-[#2b2d30] border border-[#393b40] rounded text-[#dfe1e5]">F9</kbd> or click the green <span className="text-[#59a869] font-semibold">Run</span> button to execute MiniLang.
          </div>
        )}

        {/* Mensagens de Execução */}
        {messages.map((msg) => {
          if (msg.type === 'stdout') {
            return (
              <div key={msg.id} className="text-[#dfe1e5] text-xs">
                {msg.text}
              </div>
            );
          }
          if (msg.type === 'stdin') {
            return (
              <div key={msg.id} className="text-[#cf8e6d] text-xs font-semibold">
                {msg.text}
              </div>
            );
          }
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="text-[#868a91] text-[11px] flex items-center gap-1.5 py-0.5">
                <Info className="w-3 h-3 text-[#3574f0]" />
                <span>{msg.text}</span>
              </div>
            );
          }
          if (msg.type === 'error') {
            return (
              <div key={msg.id} className="text-[#f75464] text-xs flex items-start gap-1.5 py-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#f75464] shrink-0 mt-0.5" />
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
            className="flex items-center gap-2 mt-2 py-1 px-2 rounded-[4px] bg-[#2b2d30] border border-[#3574f0]/50"
          >
            <span className="text-[#cf8e6d] font-semibold text-xs">
              input &apos;{waitingInput.varName}&apos; ({waitingInput.expectedType}):
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[#dfe1e5] font-mono text-xs focus:ring-0"
              placeholder={waitingInput.expectedType === 'INTEIRO' ? 'Ex.: 42' : 'verdadeiro / falso'}
              autoFocus
            />
            <button
              type="submit"
              className="p-1 text-[#3574f0] hover:text-white rounded transition"
              title="Send Input (Enter)"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Indicador de Status de Processo do JetBrains (Process finished with exit code X) */}
        {status === 'RUNNING' && (
          <div className="flex items-center gap-1.5 text-[#868a91] text-[11px] pt-1">
            <Loader2 className="w-3 h-3 animate-spin text-[#3574f0]" />
            <span>Running...</span>
          </div>
        )}

        {status === 'FINISHED' && exitCode === 0 && (
          <div className="text-[#59a869] text-[11px] pt-2 select-none border-t border-[#2b2d30] mt-2">
            Process finished with exit code 0 ({durationMs ?? 0} ms)
          </div>
        )}

        {status === 'FINISHED' && exitCode !== 0 && (
          <div className="text-[#f75464] text-[11px] pt-2 select-none border-t border-[#2b2d30] mt-2">
            Process finished with exit code {exitCode}
          </div>
        )}
      </div>
    </div>
  );
}
