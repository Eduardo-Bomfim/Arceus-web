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
    return "Dica: verifique se todos os blocos '{ }' foram fechados e o programa termina com 'fim.'";
  }
  if (lower.includes(';') || lower.includes("esperado ';'")) {
    return "Dica: insira o ponto e vírgula ';' ausente ao final da instrução.";
  }
  if (lower.includes('não declarada') || lower.includes('nao declarada')) {
    return "Dica: declare a variável com 'var <nome> inteiro;' ou 'var <nome> booleano;' antes de utilizá-la.";
  }
  if (lower.includes('tipo incompatível') || lower.includes('tipo')) {
    return 'Dica: verifique a compatibilidade entre tipos (inteiro vs booleano).';
  }
  if (phase === 'Léxico') {
    return 'Dica: caractere não reconhecido pela gramática da MiniLang.';
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
      .join(' • ');
  }, [errors]);

  if (errors.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-[var(--text-muted)] p-6 text-xs text-center select-none bg-[var(--bg-surface)]">
        <CheckCircle2 className="w-7 h-7 text-[var(--accent-secondary)] mb-2 opacity-85" />
        <span className="font-semibold text-[var(--text-main)] text-sm">
          Nenhum problema encontrado
        </span>
        <span className="text-[var(--text-muted)] text-xs mt-1 max-w-md">
          O compilador validou o código sem erros léxicos, sintáticos ou semânticos.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-main)] text-xs overflow-hidden select-text transition-colors">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-panel-soft)] border-b border-[var(--border-faint)] select-none shrink-0">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-[var(--text-main)]">
            {errors.length} {errors.length === 1 ? 'problema' : 'problemas'}
          </span>
          {phaseBreakdown && (
            <span className="text-[10.5px] px-2 py-0.2 rounded-[var(--ui-radius)] bg-[var(--bg-subtle-soft)] text-[var(--text-muted)]">
              {phaseBreakdown}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
          Clique em um item para ir à linha
        </span>
      </div>

      <div className="flex-1 overflow-auto divide-y divide-[var(--border-faint)]">
        {errors.map((err, idx) => {
          const suggestion = getErrorSuggestion(err.message, err.phase);

          return (
            <div
              key={idx}
              onClick={() => onSelectError?.(err.line, err.column)}
              className="px-4 py-2.5 hover:bg-[var(--bg-subtle-soft)] cursor-pointer transition flex items-start gap-2.5 group"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition">
                    {err.message}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-[var(--ui-radius)] bg-[var(--bg-panel)] text-[var(--text-muted)] font-mono border border-[var(--border-subtle)]">
                    {err.phase}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    linha {err.line}, col {err.column}
                  </span>
                </div>

                {suggestion && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400/95 mt-1.5 bg-amber-500/8 px-2.5 py-1 rounded-[var(--ui-radius)] border border-amber-500/20">
                    <Lightbulb className="w-3 h-3 shrink-0" />
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
