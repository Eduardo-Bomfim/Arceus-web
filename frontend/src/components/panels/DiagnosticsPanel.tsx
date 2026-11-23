import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import type { ErrorItem } from '../../types';

interface DiagnosticsPanelProps {
  errors: ErrorItem[];
  onSelectError?: (line: number, column?: number) => void;
}

function getErrorSuggestion(message: string, phase: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('esperado') && lower.includes('fim')) {
    return "Quick Fix: Ensure all '{ }' blocks are closed and program ends with 'fim.'";
  }
  if (lower.includes(';') || lower.includes("esperado ';'")) {
    return "Quick Fix: Insert missing semicolon ';' at the end of statement.";
  }
  if (lower.includes('não declarada') || lower.includes('nao declarada')) {
    return "Quick Fix: Declare the variable with 'var <name> inteiro;' or 'var <name> booleano;' before use.";
  }
  if (lower.includes('tipo incompatível') || lower.includes('tipo')) {
    return "Quick Fix: Verify type compatibility (inteiro vs booleano).";
  }
  if (phase === 'Léxico') {
    return "Quick Fix: Character not recognized by MiniLang grammar. Check spelling.";
  }
  return null;
}

export const DiagnosticsPanel = React.memo(function DiagnosticsPanel({
  errors,
  onSelectError,
}: DiagnosticsPanelProps) {
  const phaseBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const err of errors) {
      counts[err.phase] = (counts[err.phase] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([phase, count]) => `${count} ${phase}`)
      .join(', ');
  }, [errors]);

  if (errors.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-[#868a91] p-6 text-xs text-center select-none font-sans bg-[#1e1f22]">
        <CheckCircle2 className="w-8 h-8 text-[#59a869] mb-2 opacity-80" />
        <span className="font-semibold text-[#dfe1e5] text-sm">No Problems Found</span>
        <span className="text-[#868a91] text-xs mt-1">
          MiniLang compiler validated your program with zero lexical, syntactic, or semantic errors.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#dfe1e5] font-sans text-xs overflow-hidden select-text">
      {/* JetBrains Problems Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#2b2d30] border-b border-[#393b40] select-none shrink-0">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#f75464]" />
          <span className="font-semibold text-[#dfe1e5]">
            Problems ({errors.length})
          </span>
          {phaseBreakdown && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e1f22] text-[#868a91] border border-[#393b40]">
              {phaseBreakdown}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#868a91]">
          Click to navigate to source line
        </span>
      </div>

      {/* Lista de Erros estilo JetBrains Problems View */}
      <div className="flex-1 overflow-auto divide-y divide-[#2b2d30] font-sans">
        {errors.map((err, idx) => {
          const suggestion = getErrorSuggestion(err.message, err.phase);

          return (
            <div
              key={idx}
              onClick={() => onSelectError?.(err.line, err.column)}
              className="px-3.5 py-2 hover:bg-[#2b2d30] cursor-pointer transition flex items-start gap-2.5 group"
            >
              {/* Ícone de Erro JetBrains */}
              <AlertCircle className="w-3.5 h-3.5 text-[#f75464] shrink-0 mt-0.5" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-[#dfe1e5] group-hover:text-white transition">
                    {err.message}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2b2d30] text-[#868a91] font-mono border border-[#393b40]">
                    {err.phase}
                  </span>
                  <span className="text-[11px] font-mono text-[#868a91]">
                    line {err.line}, col {err.column}
                  </span>
                </div>

                {/* Quick Fix / Sugestão */}
                {suggestion && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#e5a83b] italic mt-1 bg-[#1e1f22] px-2 py-0.5 rounded border border-[#393b40]">
                    <Lightbulb className="w-3 h-3 text-[#e5a83b] shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
