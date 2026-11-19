import { AlertOctagon, CheckCircle2 } from 'lucide-react';
import type { ErrorItem } from '../../types';

interface DiagnosticsPanelProps {
  errors: ErrorItem[];
  onSelectError?: (line: number, column?: number) => void;
}

export function DiagnosticsPanel({
  errors,
  onSelectError,
}: DiagnosticsPanelProps) {
  if (errors.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400 p-6 text-sm text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
        <span className="font-semibold text-slate-200">Nenhum problema encontrado</span>
        <span className="text-slate-500 text-xs mt-1">
          O código MiniLang foi validado pelo compilador sem erros léxicos, sintáticos ou semânticos.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-300 font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0f1520] border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-rose-300">
            Problemas & Diagnósticos ({errors.length})
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Clique em um erro para ir até a linha no editor
        </span>
      </div>

      {/* Lista de erros */}
      <div className="flex-1 overflow-auto divide-y divide-[#1e293b]">
        {errors.map((err, idx) => {
          const phaseColor =
            err.phase === 'Léxico'
              ? 'bg-purple-950 text-purple-300 border-purple-800/40'
              : err.phase === 'Sintático'
              ? 'bg-amber-950 text-amber-300 border-amber-800/40'
              : err.phase === 'Semântico'
              ? 'bg-blue-950 text-blue-300 border-blue-800/40'
              : 'bg-rose-950 text-rose-300 border-rose-800/40';

          return (
            <div
              key={idx}
              onClick={() => onSelectError?.(err.line, err.column)}
              className="p-3 hover:bg-[#131b27] cursor-pointer transition flex items-start gap-3 group"
            >
              <div className="flex flex-col items-center gap-1 min-w-16">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${phaseColor}`}
                >
                  {err.phase}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  L{err.line}:C{err.column}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-slate-200 group-hover:text-sky-300 transition leading-snug">
                  {err.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
