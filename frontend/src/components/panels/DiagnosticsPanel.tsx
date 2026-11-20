import React, { useMemo } from 'react';
import { AlertOctagon, CheckCircle2, Lightbulb } from 'lucide-react';
import type { ErrorItem } from '../../types';

interface DiagnosticsPanelProps {
  errors: ErrorItem[];
  onSelectError?: (line: number, column?: number) => void;
}

function getErrorSuggestion(message: string, phase: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('esperado') && lower.includes('fim')) {
    return "Dica: Verifique se fechou todas as chaves '{ }' e se o programa termina com 'fim.'";
  }
  if (lower.includes(';') || lower.includes("esperado ';'")) {
    return "Dica: Adicione ';' ao final do comando anterior.";
  }
  if (lower.includes('não declarada') || lower.includes('nao declarada')) {
    return "Dica: Declare a variável com 'var <nome> inteiro;' ou 'var <nome> booleano;' antes de usá-la.";
  }
  if (lower.includes('tipo incompatível') || lower.includes('tipo')) {
    return "Dica: Verifique se os tipos de dados conferem (inteiro com inteiro, booleano com booleano).";
  }
  if (phase === 'Léxico') {
    return "Dica: Caractere não reconhecido pela gramática da MiniLang. Verifique a digitação.";
  }
  return null;
}

export const DiagnosticsPanel = React.memo(function DiagnosticsPanel({
  errors,
  onSelectError,
}: DiagnosticsPanelProps) {
  // Quick Win #6: Contagem por fase
  const phaseBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const err of errors) {
      counts[err.phase] = (counts[err.phase] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([phase, count]) => `${count} ${phase}${count > 1 ? 's' : ''}`)
      .join(', ');
  }, [errors]);

  if (errors.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400 p-6 text-xs text-center select-none">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
        <span className="font-semibold text-slate-200 text-sm">Nenhum problema encontrado</span>
        <span className="text-[var(--text-muted)] text-xs mt-1">
          O código MiniLang foi validado pelo compilador sem erros léxicos, sintáticos ou semânticos.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] text-[var(--text-main)] font-mono text-xs overflow-hidden select-text">
      {/* Header com breakdown de erros por fase (Quick Win #6) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] select-none">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-rose-300">
            Problemas & Diagnósticos ({errors.length})
          </span>
          {phaseBreakdown && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
              {phaseBreakdown}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">
          Clique no erro para ir até a linha no editor
        </span>
      </div>

      {/* Lista de erros com sugestões didáticas (Quick Win #7) */}
      <div className="flex-1 overflow-auto divide-y divide-[var(--border-color)]">
        {errors.map((err, idx) => {
          const phaseColor =
            err.phase === 'Léxico'
              ? 'bg-purple-950 text-purple-300 border-purple-800/40'
              : err.phase === 'Sintático'
              ? 'bg-amber-950 text-amber-300 border-amber-800/40'
              : err.phase === 'Semântico'
              ? 'bg-blue-950 text-blue-300 border-blue-800/40'
              : 'bg-rose-950 text-rose-300 border-rose-800/40';

          const suggestion = getErrorSuggestion(err.message, err.phase);

          return (
            <div
              key={idx}
              onClick={() => onSelectError?.(err.line, err.column)}
              className="p-3 hover:bg-[var(--bg-surface)] cursor-pointer transition flex items-start gap-3 group"
            >
              <div className="flex flex-col items-center gap-1 min-w-16">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${phaseColor}`}
                >
                  {err.phase}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  L{err.line}:C{err.column}
                </span>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-slate-200 group-hover:text-amber-300 transition leading-snug">
                  {err.message}
                </p>

                {/* Sugestão de Correção Didática (Quick Win #7) */}
                {suggestion && (
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-400/90 font-sans italic bg-sky-950/20 px-2 py-1 rounded border border-sky-900/30">
                    <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
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
