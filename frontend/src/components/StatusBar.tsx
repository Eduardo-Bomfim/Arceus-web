import { CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
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
  const { themeConfig, setIsSettingsOpen } = useTheme();

  return (
    <footer className="h-6 px-3 bg-[var(--bg-header)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-center justify-between select-none font-sans z-20 shrink-0 transition-colors">
      {/* 1. Lado Esquerdo: Inspeção de Código (JetBrains Problems Widget) + MiniLang */}
      <div className="flex items-center gap-2.5">
        {/* Inspeção de Código / Problemas */}
        {errorsCount === 0 ? (
          <span
            className="flex items-center gap-1 text-[var(--accent-secondary)] font-medium cursor-pointer"
            title="Inspection: No problems found"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span className="hidden sm:inline">No problems</span>
          </span>
        ) : (
          <span
            className="flex items-center gap-1 text-red-400 font-medium cursor-pointer"
            title="Inspection: Errors detected"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>
              {errorsCount} {errorsCount === 1 ? 'problem' : 'problems'}
            </span>
          </span>
        )}

        <span className="text-[var(--border-color)]">|</span>

        <span className="hidden sm:inline text-[var(--text-muted)]">
          MiniLang (Arceus 0.1.0)
        </span>
      </div>

      {/* 2. Lado Direito: Posição do Cursor, Indentação, Encoding, Linhas e Conexão */}
      <div className="flex items-center gap-2.5">
        <span className="hidden md:inline text-[var(--text-muted)]">
          {lineCount} lines, {charCount} chars
        </span>

        <span className="text-[var(--border-color)] hidden md:inline">|</span>

        {/* Posição do Cursor (Ln X, Col Y) */}
        <span className="text-[var(--text-main)] font-mono hover:text-white cursor-pointer transition">
          {cursorLine}:{cursorCol}
        </span>

        <span className="text-[var(--border-color)]">|</span>

        <span className="hover:text-[var(--text-main)] cursor-pointer transition">2 spaces</span>

        <span className="text-[var(--border-color)]">|</span>

        <span className="hover:text-[var(--text-main)] cursor-pointer transition">UTF-8</span>

        <span className="text-[var(--border-color)]">|</span>

        <span className="hover:text-[var(--text-main)] cursor-pointer transition">CRLF</span>

        <span className="text-[var(--border-color)] hidden sm:inline">|</span>

        {/* Tema Ativo */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="hidden sm:flex items-center gap-1 hover:text-[var(--text-main)] transition"
          title={`Theme: ${themeConfig.name} (Click to open Settings)`}
        >
          <Layers className="w-3 h-3 text-[var(--accent-primary)]" />
          <span>{themeConfig.name}</span>
        </button>

        <span className="text-[var(--border-color)] hidden sm:inline">|</span>

        {/* Status da Conexão */}
        <span className="hidden sm:inline">
          {health.state === 'online' ? (
            <span className="text-[var(--accent-secondary)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)]" />
              Connected
            </span>
          ) : health.state === 'sleeping' ? (
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Waking API
            </span>
          ) : (
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Disconnected
            </span>
          )}
        </span>
      </div>
    </footer>
  );
}
