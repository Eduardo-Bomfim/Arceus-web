import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ListTree,
  FileText,
} from 'lucide-react';

interface AstPanelProps {
  rawAst: string | null;
  optimizedAst: string | null;
  optimizeEnabled: boolean;
  isLoading?: boolean;
  onSelectLine?: (line: number) => void;
}

interface AstNodeItem {
  id: string;
  depth: number;
  text: string;
  typeBadge?: string;
  isFolded?: boolean;
  line?: number;
}

function parseAstLines(astText: string | null): AstNodeItem[] {
  if (!astText) return [];
  const lines = astText.split('\n').filter((l) => l.trim().length > 0);

  return lines.map((line, idx) => {
    const leadingSpaces = line.search(/\S|$/);
    const depth = Math.floor(leadingSpaces / 2);
    const text = line.trim();

    let typeBadge: string | undefined;
    if (text.startsWith('Program')) typeBadge = 'PROGRAM';
    else if (text.startsWith('Block')) typeBadge = 'BLOCK';
    else if (text.startsWith('VarDecl')) typeBadge = 'DECL';
    else if (text.startsWith('Assign')) typeBadge = 'ASSIGN';
    else if (text.startsWith('BinOp')) typeBadge = 'BIN_OP';
    else if (text.startsWith('Literal')) typeBadge = 'LITERAL';
    else if (text.startsWith('Var(')) typeBadge = 'VAR';
    else if (text.startsWith('If')) typeBadge = 'IF';
    else if (text.startsWith('While')) typeBadge = 'WHILE';
    else if (text.startsWith('For')) typeBadge = 'FOR';
    else if (text.startsWith('Repeat')) typeBadge = 'REPEAT';
    else if (text.startsWith('Write')) typeBadge = 'WRITE';
    else if (text.startsWith('Read')) typeBadge = 'READ';

    const isFolded = text.startsWith('Literal') && (text.includes('INTEIRO') || text.includes('BOOLEANO'));

    const lineMatch = text.match(/(?:line|linha)[=:\s]+(\d+)/i);
    const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

    return {
      id: `ast_node_${idx}`,
      depth,
      text,
      typeBadge,
      isFolded,
      line: lineNum,
    };
  });
}

export const AstPanel = React.memo(function AstPanel({
  rawAst,
  optimizedAst,
  optimizeEnabled,
  isLoading,
  onSelectLine,
}: AstPanelProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'tree'>('split');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rawNodes = useMemo(() => parseAstLines(rawAst), [rawAst]);
  const optNodes = useMemo(() => parseAstLines(optimizedAst), [optimizedAst]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3 bg-[var(--bg-surface)]">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        <span className="text-xs text-[var(--text-muted)]">Compilando e gerando AST...</span>
      </div>
    );
  }

  if (!rawAst) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-muted)] p-6 text-xs text-center bg-[var(--bg-surface)]">
        Execute a análise estática ou rode o programa (F9) para visualizar a Árvore Sintática Abstrata.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-main)] text-xs overflow-hidden select-text transition-colors">
      {/* Header limpo com modo de visualização e copiar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[var(--bg-panel-soft)] border-b border-[var(--border-faint)] select-none shrink-0">
        <div className="flex items-center gap-2">
          <GitCompare className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
          <span className="font-semibold text-[var(--text-main)]">
            {optimizeEnabled
              ? 'Comparação da AST: Original vs Otimizada (Constant Folding)'
              : 'Árvore Sintática Abstrata (AST)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-[var(--ui-radius)] bg-[var(--bg-app)] p-0.5 border border-[var(--border-subtle)]">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[var(--ui-radius)] text-[11px] transition ${
                viewMode === 'split'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-medium shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Visualização lado a lado"
            >
              <FileText className="w-3 h-3" />
              <span>Texto</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[var(--ui-radius)] text-[11px] transition ${
                viewMode === 'tree'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-medium shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Árvore interativa"
            >
              <ListTree className="w-3 h-3" />
              <span>Árvore</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(optimizedAst || rawAst)}
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--ui-radius)] text-[11px] bg-[var(--bg-app)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] transition border border-[var(--border-subtle)]"
          >
            {copied ? <Check className="w-3 h-3 text-[var(--accent-secondary)]" /> : <Copy className="w-3 h-3 text-[var(--text-muted)]" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Conteúdo: Modo Split View */}
      {viewMode === 'split' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-faint)] overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3.5 py-1.5 bg-[var(--bg-panel-soft)] border-b border-[var(--border-faint)] text-[var(--accent-primary)] font-semibold text-[11px] flex items-center justify-between shrink-0">
              <span>AST Original (Tipos Anotados)</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">Pós-Semântico</span>
            </div>
            <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono text-[11.5px] bg-[var(--bg-surface)]">
              {rawAst}
            </div>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3.5 py-1.5 bg-[var(--bg-panel-soft)] border-b border-[var(--border-faint)] text-[var(--accent-secondary)] font-semibold text-[11px] flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                AST Otimizada (Constant Folding)
              </span>
              {!optimizeEnabled && (
                <span className="text-[var(--text-muted)] font-normal italic text-[10px]">
                  Ative em Configurações (Ctrl+,)
                </span>
              )}
            </div>
            <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono text-[11.5px] bg-[var(--bg-surface)]">
              {optimizedAst || (
                <span className="text-[var(--text-muted)] italic font-sans text-xs">
                  Ative o Constant Folding (--opt) em Configurações &gt; Compilador (ou execute{' '}
                  <code className="font-mono text-[var(--accent-primary)]">opt on</code> no terminal) para dobrar expressões constantes.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo: Modo Árvore Interativa */}
      {viewMode === 'tree' && (
        <div className="flex-1 overflow-auto p-3 space-y-0.5 select-text font-mono text-xs bg-[var(--bg-surface)]">
          {(optimizeEnabled && optNodes.length > 0 ? optNodes : rawNodes).map((node) => {
            const isCollapsed = collapsedNodes[node.id];

            return (
              <div
                key={node.id}
                style={{ paddingLeft: `${node.depth * 20}px` }}
                onClick={() => node.line && onSelectLine?.(node.line)}
                className={`flex items-center gap-1.5 py-0.5 px-2 rounded-[3px] hover:bg-[var(--bg-subtle)] transition ${
                  node.line ? 'cursor-pointer hover:border-l-2 hover:border-[var(--accent-primary)]' : ''
                }`}
              >
                {node.depth > 0 && (
                  <button
                    onClick={() => toggleCollapse(node.id)}
                    className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {node.typeBadge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                      node.typeBadge === 'PROGRAM'
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)] border border-[var(--accent-border)]'
                        : node.typeBadge === 'BLOCK'
                        ? 'bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        : node.typeBadge === 'DECL'
                        ? 'bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)] border border-[var(--accent-secondary-border)]'
                        : node.typeBadge === 'ASSIGN'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : node.typeBadge === 'LITERAL'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    }`}
                  >
                    {node.typeBadge}
                  </span>
                )}

                <span className="text-[var(--text-main)] font-mono text-[11px]">
                  {node.text}
                </span>

                {optimizeEnabled && node.isFolded && (
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-semibold">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    Folded
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
