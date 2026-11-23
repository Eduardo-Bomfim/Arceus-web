import React, { useMemo } from 'react';
import {
  Folder,
  ChevronRight,
  Code2,
  GitBranch,
  Repeat,
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
      aria-label="Navigation Bar"
      className="h-6 px-3 bg-[#1e1f22] border-b border-[#2b2d30] flex items-center gap-1.5 text-[11px] text-[#868a91] select-none overflow-x-auto no-scrollbar font-mono shrink-0"
    >
      {/* Root Project Directory */}
      <div className="flex items-center gap-1 hover:text-[#dfe1e5] cursor-pointer transition">
        <Folder className="w-3 h-3 text-[#3574f0]" />
        <span>arceus-web</span>
      </div>

      <ChevronRight className="w-3 h-3 text-[#4b5059] shrink-0" />

      {/* Source Directory */}
      <div className="flex items-center gap-1 hover:text-[#dfe1e5] cursor-pointer transition">
        <Folder className="w-3 h-3 text-[#e5a83b]" />
        <span>src</span>
      </div>

      <ChevronRight className="w-3 h-3 text-[#4b5059] shrink-0" />

      {/* Current File */}
      <div className="flex items-center gap-1 text-[#dfe1e5] font-medium">
        <div className="w-2.5 h-2.5 rounded-[1px] bg-[#3574f0]/25 text-[#56a8f5] flex items-center justify-center text-[7px] font-bold">
          M
        </div>
        <span>{fileName}</span>
      </div>

      {/* Scopes in file */}
      {scopes.map((scope) => (
        <React.Fragment key={scope.id}>
          <ChevronRight className="w-3 h-3 text-[#4b5059] shrink-0" />
          <button
            onClick={() => onNavigateToLine?.(scope.line)}
            className="flex items-center gap-1 hover:text-[#3574f0] transition text-[#868a91] rounded px-1 -mx-1"
            title={`Go to line ${scope.line}`}
          >
            {scope.iconType === 'program' && <Code2 className="w-3 h-3 text-[#3574f0]" />}
            {scope.iconType === 'condition' && <GitBranch className="w-3 h-3 text-[#e5a83b]" />}
            {scope.iconType === 'loop' && <Repeat className="w-3 h-3 text-[#a855f7]" />}
            <span>{scope.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
});
