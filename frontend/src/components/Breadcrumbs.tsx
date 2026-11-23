import React, { useMemo } from 'react';
import {
  Folder,
  FileCode,
  Zap,
  Split,
  Repeat,
  ChevronRight,
} from 'lucide-react';

interface BreadcrumbsProps {
  fileName: string;
  sourceCode: string;
  cursorLine: number;
  onNavigateToLine?: (line: number) => void;
}

interface ScopeItem {
  id: string;
  label: string;
  line: number;
  iconType: 'program' | 'condition' | 'loop' | 'block';
}

function computeActiveScopes(source: string, cursorLine: number): ScopeItem[] {
  if (!source) return [];

  const lines = source.split('\n');
  const stack: ScopeItem[] = [];

  for (let i = 0; i < Math.min(cursorLine, lines.length); i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();

    if (!line || line.startsWith('#')) continue;

    // Detecta programa
    if (line.startsWith('programa ')) {
      const progName = line.replace('programa', '').replace(/\{.*/, '').trim() || 'meu_programa';
      stack.push({
        id: `scope_prog_${lineNum}`,
        label: `programa ${progName}`,
        line: lineNum,
        iconType: 'program',
      });
    }
    // Detecta se / senão
    else if (line.startsWith('se ') || line.startsWith('se(')) {
      const cond = line.replace(/\{.*/, '').trim();
      stack.push({
        id: `scope_if_${lineNum}`,
        label: cond.length > 25 ? `${cond.substring(0, 22)}...` : cond,
        line: lineNum,
        iconType: 'condition',
      });
    } else if (line.startsWith('senão') || line.startsWith('senao')) {
      stack.push({
        id: `scope_else_${lineNum}`,
        label: 'senão',
        line: lineNum,
        iconType: 'condition',
      });
    }
    // Detecta laços
    else if (
      line.startsWith('enquanto ') ||
      line.startsWith('enquanto(') ||
      line.startsWith('para ') ||
      line.startsWith('repita')
    ) {
      const loopExpr = line.replace(/\{.*/, '').trim();
      stack.push({
        id: `scope_loop_${lineNum}`,
        label: loopExpr.length > 25 ? `${loopExpr.substring(0, 22)}...` : loopExpr,
        line: lineNum,
        iconType: 'loop',
      });
    }

    // Fecha escopo quando encontra '}' e não é senão
    if (line.includes('}') && !line.includes('{') && stack.length > 1) {
      stack.pop();
    }
  }

  return stack;
}

export const Breadcrumbs = React.memo(function Breadcrumbs({
  fileName,
  sourceCode,
  cursorLine,
  onNavigateToLine,
}: BreadcrumbsProps) {
  const scopes = useMemo(
    () => computeActiveScopes(sourceCode, cursorLine),
    [sourceCode, cursorLine]
  );

  return (
    <nav
      aria-label="Trilha de navegação de escopo do arquivo"
      className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-header)]/60 border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)] select-none overflow-x-auto whitespace-nowrap font-mono"
    >
      {/* Pasta Raiz */}
      <div className="flex items-center gap-1 opacity-70">
        <Folder className="w-3 h-3 text-[var(--accent-primary)]" />
        <span>src</span>
      </div>

      <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

      {/* Arquivo Ativo */}
      <div className="flex items-center gap-1 font-semibold text-[var(--text-main)]">
        <FileCode className="w-3 h-3 text-sky-400" />
        <span>{fileName}</span>
      </div>

      {/* Escopos Internos */}
      {scopes.map((scope) => (
        <React.Fragment key={scope.id}>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          <button
            onClick={() => onNavigateToLine?.(scope.line)}
            className="flex items-center gap-1 hover:text-[var(--accent-primary)] transition text-[var(--text-muted)] hover:underline rounded px-1 -mx-1"
            title={`Ir para linha ${scope.line}`}
          >
            {scope.iconType === 'program' && <Zap className="w-3 h-3 text-amber-400" />}
            {scope.iconType === 'condition' && <Split className="w-3 h-3 text-rose-400" />}
            {scope.iconType === 'loop' && <Repeat className="w-3 h-3 text-indigo-400" />}
            <span>{scope.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
});
