import { Layers, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { HealthStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

interface StatusBarProps {
  cursorLine: number;
  cursorCol: number;
  charCount: number;
  lineCount: number;
  health: HealthStatus;
  errorsCount: number;
}

export function StatusBar({
  cursorLine,
  cursorCol,
  charCount,
  lineCount,
  health,
  errorsCount,
}: StatusBarProps) {
  const { themeConfig } = useTheme();

  return (
    <footer className="flex items-center justify-between px-3 py-1 bg-[var(--bg-header)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] select-none font-mono z-10">
      {/* Lado Esquerdo: Diagnósticos e Status da MiniLang */}
      <div className="flex items-center gap-3">
        {errorsCount === 0 ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span className="hidden sm:inline">Código Válido</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>
              {errorsCount} {errorsCount === 1 ? 'problema' : 'problemas'}
            </span>
          </span>
        )}

        <span className="text-[var(--border-color)]">|</span>

        <span className="flex items-center gap-1 text-[var(--text-main)] font-semibold">
          <FileCode className="w-3 h-3 text-[var(--accent-primary)]" />
          <span>MiniLang (Arceus 0.1.0)</span>
        </span>
      </div>

      {/* Lado Direito: Cursor, Caracteres, Tema Ativo e API */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline">
          {lineCount} {lineCount === 1 ? 'linha' : 'linhas'}, {charCount} carac.
        </span>

        <span className="text-[var(--border-color)] hidden md:inline">|</span>

        {/* Posição do Cursor */}
        <span className="text-[var(--text-main)] font-medium">
          Ln {cursorLine}, Col {cursorCol}
        </span>

        <span className="text-[var(--border-color)]">|</span>

        <span>UTF-8</span>

        <span className="text-[var(--border-color)]">|</span>

        {/* Tema Ativo */}
        <span
          className="flex items-center gap-1 font-semibold"
          style={{ color: themeConfig.primaryColor }}
          title={themeConfig.description}
        >
          <Layers className="w-3 h-3" />
          <span className="hidden sm:inline">{themeConfig.name}</span>
        </span>

        <span className="text-[var(--border-color)] hidden sm:inline">|</span>

        {/* API Backend indicator */}
        <span className="hidden sm:inline">
          {health.state === 'online' ? (
            <span className="text-emerald-400">● Conectado</span>
          ) : health.state === 'sleeping' ? (
            <span className="text-amber-400 animate-pulse">● Acordando API</span>
          ) : (
            <span className="text-rose-400">● Desconectado</span>
          )}
        </span>
      </div>
    </footer>
  );
}
