import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import {
  Trash2,
  CornerDownLeft,
  Loader2,
  Square,
  WrapText,
  Copy,
  Check,
} from 'lucide-react';
import type { AnalyzeResponse, RunResponse, RunnerStatus, WaitingInputState } from '../types';
import type { TerminalMessage, TerminalMessageType } from '../hooks/useArceusRunner';
import type { EditorFile } from '../hooks/useFiles';
import type { TabType } from '../hooks/useTabs';
import { useTheme } from '../context/ThemeContext';
import {
  executeTerminalCommandLine,
  getAutocompleteResult,
} from '../terminal/commandEngine';
import type { VirtualCwd } from '../terminal/commandEngine';

const HISTORY_STORAGE_KEY = 'arceus_terminal_history_v1';

interface TerminalProps {
  messages: TerminalMessage[];
  status: RunnerStatus;
  waitingInput: WaitingInputState | null;
  onSendStdin: (val: string) => void;
  onClear: () => void;
  onAbort?: () => void;
  onAppendMessage: (
    type: TerminalMessageType,
    text: string,
    meta?: TerminalMessage['meta']
  ) => void;
  // Dependências para comandos do terminal
  files: EditorFile[];
  activeFile: EditorFile;
  selectFile: (id: string) => void;
  createFile: (name?: string, content?: string) => EditorFile;
  upsertFile: (name: string, content: string, append?: boolean) => EditorFile;
  closeFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  updateFileContentById: (id: string, content: string) => void;
  optimize: boolean;
  onRunFile: (source: string, opt: boolean, fileName: string) => Promise<void>;
  onAnalyzeSource: (source: string, opt: boolean) => Promise<AnalyzeResponse | null>;
  onRunHttp: (source: string, opt: boolean) => Promise<RunResponse>;
  onCheckHealth: () => Promise<{ ok: boolean; compiler?: string; python?: string }>;
  onFormatSource: (code: string) => string;
  onShare: () => void;
  onGoToLine: (line: number, column?: number) => void;
  onSwitchTab: (tab: TabType) => void;
}

export function Terminal({
  messages,
  status,
  waitingInput,
  onSendStdin,
  onClear,
  onAbort,
  onAppendMessage,
  files,
  activeFile,
  selectFile,
  createFile,
  upsertFile,
  closeFile,
  renameFile,
  updateFileContentById,
  optimize,
  onRunFile,
  onAnalyzeSource,
  onRunHttp,
  onCheckHealth,
  onFormatSource,
  onShare,
  onGoToLine,
  onSwitchTab,
}: TerminalProps) {
  const { theme, setTheme, settings, updateSettings, openSettings } = useTheme();

  const [cwd, setCwd] = useState<VirtualCwd>('~/arceus-web/src');
  const [cmdInput, setCmdInput] = useState('');
  const [stdinValue, setStdinValue] = useState('');
  const [isCommandRunning, setIsCommandRunning] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [caretOffset, setCaretOffset] = useState(0);

  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const draftBeforeHistoryRef = useRef('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const stdinInputRef = useRef<HTMLInputElement>(null);

  const isProgramRunning =
    status === 'RUNNING' || status === 'WAITING_INPUT' || status === 'CONNECTING';

  // Persiste histórico de comandos
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(-100)));
    } catch {
      // ignore
    }
  }, [history]);

  // Auto-scroll ao receber novas linhas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, waitingInput, status, isCommandRunning]);

  // Foco automático ao aguardar stdin
  useEffect(() => {
    if (waitingInput && stdinInputRef.current) {
      stdinInputRef.current.focus();
    }
  }, [waitingInput]);

  // Atalho Ctrl+L quando o foco está no terminal
  const focusPrompt = useCallback(() => {
    if (waitingInput) {
      stdinInputRef.current?.focus();
    } else {
      cmdInputRef.current?.focus();
    }
  }, [waitingInput]);

  const runCommandString = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setHistory((prev) => {
        const withoutLastDup = prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed];
        return withoutLastDup.slice(-100);
      });
      setHistoryIndex(-1);
      draftBeforeHistoryRef.current = '';
      setCmdInput('');
      setCaretOffset(0);
      setIsCommandRunning(true);

      try {
        await executeTerminalCommandLine(trimmed, {
          cwd,
          setCwd,
          files,
          activeFile,
          selectFile,
          createFile,
          upsertFile,
          closeFile,
          renameFile,
          updateFileContentById,
          optimize,
          maxSteps: settings.maxSteps,
          theme,
          setTheme,
          settings,
          updateSettings,
          openSettings,
          onRunFile,
          onAnalyzeSource,
          onRunHttp,
          onCheckHealth,
          onFormatSource,
          onShare,
          onGoToLine,
          history,
          clearTerminal: onClear,
          emit: onAppendMessage,
          onSwitchTab,
        });
      } finally {
        setIsCommandRunning(false);
        setTimeout(() => cmdInputRef.current?.focus(), 20);
      }
    },
    [
      cwd,
      files,
      activeFile,
      selectFile,
      createFile,
      upsertFile,
      closeFile,
      renameFile,
      updateFileContentById,
      optimize,
      settings,
      theme,
      setTheme,
      updateSettings,
      openSettings,
      onRunFile,
      onAnalyzeSource,
      onRunHttp,
      onCheckHealth,
      onFormatSource,
      onShare,
      onGoToLine,
      history,
      onClear,
      onAppendMessage,
      onSwitchTab,
    ]
  );

  const handleCommandSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (isCommandRunning || isProgramRunning) return;
    void runCommandString(cmdInput);
  };

  const handleCommandKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      onClear();
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (isProgramRunning && onAbort) {
        onAbort();
      } else if (cmdInput.length > 0) {
        onAppendMessage('command', `${cmdInput}^C`, { prompt: cwd });
        setCmdInput('');
        setCaretOffset(0);
      }
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      setCmdInput('');
      setCaretOffset(0);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const result = getAutocompleteResult(cmdInput, files);
      if (result.completed !== cmdInput) {
        setCmdInput(result.completed);
        setCaretOffset(result.completed.length);
      } else if (result.candidates.length > 1) {
        onAppendMessage('command', cmdInput, { prompt: cwd });
        onAppendMessage('muted', result.candidates.join('   '));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === -1) {
        draftBeforeHistoryRef.current = cmdInput;
        const nextIdx = history.length - 1;
        setHistoryIndex(nextIdx);
        setCmdInput(history[nextIdx]);
        setCaretOffset(history[nextIdx].length);
      } else if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCmdInput(history[nextIdx]);
        setCaretOffset(history[nextIdx].length);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setCmdInput(history[nextIdx]);
        setCaretOffset(history[nextIdx].length);
      } else {
        setHistoryIndex(-1);
        setCmdInput(draftBeforeHistoryRef.current);
        setCaretOffset(draftBeforeHistoryRef.current.length);
      }
    }
  };

  const handleStdinSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!waitingInput) return;
    onSendStdin(stdinValue.trim());
    setStdinValue('');
  };

  const handleCopyAll = async () => {
    try {
      const text = messages.map((m) => m.text).join('\n');
      await navigator.clipboard.writeText(text);
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleMessageClick = (msg: TerminalMessage) => {
    if (!msg.meta?.line) return;
    if (msg.meta.file) {
      const found = files.find(
        (f) => f.name.toLowerCase() === msg.meta!.file!.toLowerCase()
      );
      if (found) selectFile(found.id);
    }
    onGoToLine(msg.meta.line, msg.meta.column || 1);
  };

  const promptShort = cwd.replace('~/arceus-web', '~');

  return (
    <div
      className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-main)] font-mono overflow-hidden relative"
      style={{ fontSize: settings.terminalFontSize }}
      onClick={() => {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          focusPrompt();
        }
      }}
    >
      {/* Ações sutis flutuantes no canto superior direito do terminal */}
      <div
        className="absolute top-2 right-3 z-10 flex items-center gap-1 opacity-75 hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {isProgramRunning && onAbort && (
          <button
            onClick={onAbort}
            title="Interromper execução (Ctrl+C)"
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--ui-radius)] bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-[11px] font-sans font-medium transition"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Parar</span>
          </button>
        )}

        <button
          onClick={() => updateSettings({ terminalWrap: !settings.terminalWrap })}
          title={settings.terminalWrap ? 'Desativar quebra de linha' : 'Ativar quebra de linha'}
          className={`p-1.5 rounded-[var(--ui-radius)] transition ${
            settings.terminalWrap
              ? 'text-[var(--accent-primary)] bg-[var(--bg-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <WrapText className="w-3.5 h-3.5" />
        </button>

        {messages.length > 0 && (
          <button
            onClick={() => void handleCopyAll()}
            title="Copiar saída do terminal"
            className="p-1.5 rounded-[var(--ui-radius)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
          >
            {copiedLog ? (
              <Check className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        <button
          onClick={onClear}
          title="Limpar terminal (Ctrl+L)"
          className="p-1.5 rounded-[var(--ui-radius)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Área rolável de mensagens + prompt */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 py-3 leading-relaxed select-text space-y-1 ${
          settings.terminalWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
        }`}
      >
        {/* Saudação minimalista quando o terminal está limpo */}
        {messages.length === 0 && !isProgramRunning && (
          <div className="pb-2 mb-1 space-y-2 select-none">
            <div className="text-[var(--text-muted)] text-[11.5px] font-sans">
              Terminal interativo Arceus • Digite{' '}
              <code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-main)] font-mono text-[11px]">
                help
              </code>{' '}
              para explorar comandos ou{' '}
              <code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--accent-primary)] font-mono text-[11px]">
                run
              </code>{' '}
              para executar.
            </div>
            <div
              className="flex flex-wrap items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { label: 'help', cmd: 'help' },
                { label: 'ls -l', cmd: 'ls -l' },
                { label: 'run', cmd: 'run' },
                { label: 'check', cmd: 'check' },
                { label: 'status', cmd: 'status' },
                { label: 'theme', cmd: 'theme' },
              ].map((chip) => (
                <button
                  key={chip.cmd}
                  type="button"
                  onClick={() => void runCommandString(chip.cmd)}
                  className="px-2 py-0.5 rounded-[var(--ui-radius)] bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-mono text-[11px] transition"
                >
                  $ {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Histórico renderizado */}
        {messages.map((msg) => {
          const timeBadge = settings.terminalTimestamps && msg.time && (
            <span className="text-[10px] text-[var(--text-faint)] mr-2 select-none">
              [{msg.time}]
            </span>
          );

          if (msg.type === 'command') {
            const p = (msg.meta?.prompt || '~/arceus-web/src').replace('~/arceus-web', '~');
            return (
              <div key={msg.id} className="pt-1 flex items-baseline gap-1.5 font-medium">
                {timeBadge}
                <span className="text-[var(--accent-primary)] select-none shrink-0">
                  {p} $
                </span>
                <span className="text-[var(--text-main)]">{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'stdout') {
            return (
              <div key={msg.id} className="text-[var(--text-main)]">
                {timeBadge}
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'stdin') {
            return (
              <div key={msg.id} className="text-[var(--accent-secondary)] font-medium">
                {timeBadge}
                <span className="opacity-70 select-none">‹ </span>
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'success') {
            return (
              <div key={msg.id} className="text-[var(--accent-secondary)]">
                {timeBadge}
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'warn') {
            return (
              <div key={msg.id} className="text-amber-400">
                {timeBadge}
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'error') {
            const clickable = Boolean(msg.meta?.line);
            return (
              <div
                key={msg.id}
                onClick={clickable ? () => handleMessageClick(msg) : undefined}
                title={clickable ? 'Clique para ir para a linha no editor' : undefined}
                className={`text-rose-400 ${
                  clickable ? 'cursor-pointer hover:underline' : ''
                }`}
              >
                {timeBadge}
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'code') {
            const clickable = Boolean(msg.meta?.line);
            return (
              <div
                key={msg.id}
                onClick={clickable ? () => handleMessageClick(msg) : undefined}
                className={`text-[var(--text-main)] ${
                  clickable ? 'cursor-pointer hover:text-[var(--accent-primary)]' : ''
                }`}
              >
                {timeBadge}
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'system' || msg.type === 'info') {
            return (
              <div key={msg.id} className="text-[var(--accent-primary)]">
                {timeBadge}
                {msg.text}
              </div>
            );
          }

          return (
            <div key={msg.id} className="text-[var(--text-muted)]">
              {timeBadge}
              {msg.text}
            </div>
          );
        })}

        {/* Indicador durante execução de comando ou compilação */}
        {(status === 'RUNNING' || status === 'CONNECTING' || isCommandRunning) &&
          !waitingInput && (
            <div className="flex items-center gap-2 text-[var(--text-muted)] py-0.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
              <span>Executando...</span>
            </div>
          )}

        {/* Entrada interativa `leia` durante execução MiniLang */}
        {waitingInput && (
          <form
            onSubmit={handleStdinSubmit}
            className="flex items-center gap-2 mt-1.5 py-1.5 px-2.5 rounded-[var(--ui-radius)] bg-[var(--bg-panel)] border border-[var(--accent-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-amber-400 font-semibold shrink-0">
              leia &apos;{waitingInput.varName}&apos; ({waitingInput.expectedType}) ›
            </span>
            <input
              ref={stdinInputRef}
              type="text"
              value={stdinValue}
              onChange={(e) => setStdinValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key.toLowerCase() === 'c' && onAbort) {
                  e.preventDefault();
                  onAbort();
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] font-mono focus:ring-0"
              style={{ fontSize: settings.terminalFontSize }}
              placeholder={
                waitingInput.expectedType === 'INTEIRO' ? 'Digite um inteiro...' : 'verdadeiro / falso'
              }
              autoFocus
            />
            <button
              type="submit"
              className="p-1 text-[var(--accent-primary)] hover:opacity-80 rounded transition"
              title="Enviar entrada (Enter)"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Prompt interativo do shell quando ocioso */}
        {!waitingInput && !isProgramRunning && !isCommandRunning && (
          <form
            onSubmit={handleCommandSubmit}
            className="flex items-center gap-1.5 pt-1"
          >
            <span className="text-[var(--accent-primary)] font-semibold select-none shrink-0 flex items-center gap-1">
              <span>{promptShort}</span>
              {optimize && (
                <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 font-normal">
                  opt
                </span>
              )}
              <span>$</span>
            </span>

            <div className="relative flex-1 min-w-0 flex items-center">
              {/* Espelho invisível para cursores 'block' e 'underline' */}
              {isFocused && settings.terminalCursorStyle !== 'bar' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center whitespace-pre overflow-hidden"
                  style={{ fontSize: settings.terminalFontSize }}
                >
                  <span className="invisible">{cmdInput.slice(0, caretOffset)}</span>
                  <span
                    className={`inline-block terminal-cursor-blink shrink-0 ${
                      settings.terminalCursorStyle === 'block'
                        ? 'w-[0.58em] h-[1.25em] bg-[var(--accent-soft)] border border-[var(--accent-border)]'
                        : 'w-[0.58em] h-[2px] self-end mb-[1px] bg-[var(--accent-primary)]'
                    }`}
                  />
                </div>
              )}

              <input
                ref={cmdInputRef}
                type="text"
                value={cmdInput}
                onChange={(e) => {
                  setCmdInput(e.target.value);
                  setCaretOffset(e.target.selectionStart ?? e.target.value.length);
                }}
                onSelect={(e) => {
                  const target = e.currentTarget;
                  setCaretOffset(target.selectionStart ?? target.value.length);
                }}
                onFocus={(e) => {
                  setIsFocused(true);
                  setCaretOffset(e.currentTarget.selectionStart ?? e.currentTarget.value.length);
                }}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleCommandKeyDown}
                spellCheck={false}
                autoComplete="off"
                aria-label="Prompt de comandos do terminal Arceus"
                placeholder={
                  messages.length === 0 ? 'Digite um comando (Tab completa, ↑↓ histórico)...' : ''
                }
                className={`w-full bg-transparent border-none outline-none text-[var(--text-main)] placeholder-[var(--text-faint)] font-mono focus:ring-0 p-0 ${
                  settings.terminalCursorStyle === 'bar'
                    ? 'caret-[var(--accent-primary)]'
                    : 'caret-transparent'
                }`}
                style={{ fontSize: settings.terminalFontSize }}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
