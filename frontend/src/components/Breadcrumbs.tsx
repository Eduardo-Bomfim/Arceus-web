import React, { useMemo } from 'react';
import {
  ChevronRight,
  Code2,
  Workflow,
  Repeat,
  FileCode2,
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
  iconType: 'program' | 'condition' | 'loop';
}

function computeActiveScopes(source: string, cursorLine: number): ScopeItem[] {
  if (!source) return [];

  const lines = source.split('\n');
  const stack: ScopeItem[] = [];

  for (let i = 0; i < Math.min(cursorLine, lines.length); i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();

    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('programa ')) {
      const progName = line.replace('programa', '').replace(/\{.*/, '').trim() || 'principal';
      stack.push({
        id: `scope_prog_${lineNum}`,
        label: `programa ${progName}`,
        line: lineNum,
        iconType: 'program',
      });
    } else if (line.startsWith('se ') || line.startsWith('se(')) {
      const cond = line.replace(/\{.*/, '').trim();
      stack.push({
        id: `scope_if_${lineNum}`,
        label: cond.length > 26 ? `${cond.substring(0, 23)}...` : cond,
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
    } else if (
      line.startsWith('enquanto ') ||
      line.startsWith('enquanto(') ||
      line.startsWith('para ') ||
      line.startsWith('repita')
    ) {
      const loopExpr = line.replace(/\{.*/, '').trim();
      stack.push({
        id: `scope_loop_${lineNum}`,
        label: loopExpr.length > 26 ? `${loopExpr.substring(0, 23)}...` : loopExpr,
        line: lineNum,
        iconType: 'loop',
      });
    }

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
      aria-label="Navegação de Escopo"
      className="h-6 px-3 bg-[var(--bg-surface)] border-b border-[var(--border-faint)] flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] select-none overflow-x-auto no-scrollbar font-mono shrink-0"
    >
      <div className="flex items-center gap-1 text-[var(--text-main)]">
        <FileCode2 className="w-3 h-3 text-[var(--accent-primary)]" />
        <span>{fileName}</span>
      </div>

      {scopes.map((scope) => (
        <React.Fragment key={scope.id}>
          <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
          <button
            onClick={() => onNavigateToLine?.(scope.line)}
            className="flex items-center gap-1 hover:text-[var(--accent-primary)] transition rounded px-1 -mx-0.5"
            title={`Ir para linha ${scope.line}`}
          >
            {scope.iconType === 'program' && (
              <Code2 className="w-3 h-3 text-[var(--accent-primary)]" />
            )}
            {scope.iconType === 'condition' && (
              <Workflow className="w-3 h-3 text-amber-400" />
            )}
            {scope.iconType === 'loop' && (
              <Repeat className="w-3 h-3 text-purple-400" />
            )}
            <span>{scope.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
});
