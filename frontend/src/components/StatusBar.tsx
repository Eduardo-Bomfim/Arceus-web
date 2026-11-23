import { CheckCircle2, AlertTriangle, GitBranch, Layers } from 'lucide-react';
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
    <footer className="h-6 px-3 bg-[#2b2d30] border-t border-[#393b40] text-[11px] text-[#868a91] flex items-center justify-between select-none font-sans z-20 shrink-0">
      {/* 1. Lado Esquerdo: Git Branch + Inspeção de Código (JetBrains Problems Widget) + MiniLang */}
      <div className="flex items-center gap-2.5">
        {/* Git Branch */}
        <div
          title="Git Branch: main"
          className="flex items-center gap-1 hover:text-[#dfe1e5] cursor-pointer transition"
        >
          <GitBranch className="w-3 h-3 text-[#868a91]" />
          <span className="font-mono text-[10.5px]">main</span>
        </div>

        <span className="text-[#393b40]">|</span>

        {/* Inspeção de Código / Problemas */}
        {errorsCount === 0 ? (
          <span className="flex items-center gap-1 text-[#59a869] font-medium cursor-pointer" title="Inspection: No problems found">
            <CheckCircle2 className="w-3 h-3" />
            <span className="hidden sm:inline">No problems</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[#f75464] font-medium cursor-pointer" title="Inspection: Errors detected">
            <AlertTriangle className="w-3 h-3" />
            <span>
              {errorsCount} {errorsCount === 1 ? 'problem' : 'problems'}
            </span>
          </span>
        )}

        <span className="text-[#393b40] hidden sm:inline">|</span>

        <span className="hidden sm:inline text-[#868a91]">
          MiniLang (Arceus 0.1.0)
        </span>
      </div>

      {/* 2. Lado Direito: Posição do Cursor, Indentação, Encoding, Linhas e Conexão */}
      <div className="flex items-center gap-2.5">
        <span className="hidden md:inline text-[#868a91]">
          {lineCount} lines, {charCount} chars
        </span>

        <span className="text-[#393b40] hidden md:inline">|</span>

        {/* Posição do Cursor (Ln X, Col Y) */}
        <span className="text-[#dfe1e5] font-mono hover:text-white cursor-pointer transition">
          {cursorLine}:{cursorCol}
        </span>

        <span className="text-[#393b40]">|</span>

        <span className="hover:text-[#dfe1e5] cursor-pointer transition">2 spaces</span>

        <span className="text-[#393b40]">|</span>

        <span className="hover:text-[#dfe1e5] cursor-pointer transition">UTF-8</span>

        <span className="text-[#393b40]">|</span>

        <span className="hover:text-[#dfe1e5] cursor-pointer transition">CRLF</span>

        <span className="text-[#393b40] hidden sm:inline">|</span>

        {/* Tema Ativo */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="hidden sm:flex items-center gap-1 hover:text-[#dfe1e5] transition"
          title={`Theme: ${themeConfig.name} (Click to open Settings)`}
        >
          <Layers className="w-3 h-3 text-[#3574f0]" />
          <span>{themeConfig.name}</span>
        </button>

        <span className="text-[#393b40] hidden sm:inline">|</span>

        {/* Status da Conexão */}
        <span className="hidden sm:inline">
          {health.state === 'online' ? (
            <span className="text-[#59a869] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#59a869]" />
              Connected
            </span>
          ) : health.state === 'sleeping' ? (
            <span className="text-[#f5a623] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
              Waking API
            </span>
          ) : (
            <span className="text-[#f75464] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f75464]" />
              Disconnected
            </span>
          )}
        </span>
      </div>
    </footer>
  );
}
