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
import { useTheme } from '../../context/ThemeContext';

interface AstPanelProps {
  rawAst: string | null;
  optimizedAst: string | null;
  optimizeEnabled: boolean;
  isLoading?: boolean;
}

interface AstNodeItem {
  id: string;
  depth: number;
  text: string;
  typeBadge?: string;
  isFolded?: boolean;
}

function parseAstLines(astText: string | null): AstNodeItem[] {
  if (!astText) return [];
  const lines = astText.split('\n').filter((l) => l.trim().length > 0);

  return lines.map((line, idx) => {
    const leadingSpaces = line.search(/\S|$/);
    const depth = Math.floor(leadingSpaces / 2);
    const text = line.trim();

    let typeBadge: string | undefined;
    if (text.startsWith('Program')) typeBadge = 'PROGRAMA';
    else if (text.startsWith('Block')) typeBadge = 'BLOCO';
    else if (text.startsWith('VarDecl')) typeBadge = 'DECL';
    else if (text.startsWith('Assign')) typeBadge = 'ATRIB';
    else if (text.startsWith('BinOp')) typeBadge = 'OP_BIN';
    else if (text.startsWith('Literal')) typeBadge = 'LITERAL';
    else if (text.startsWith('Var(')) typeBadge = 'VAR';
    else if (text.startsWith('If')) typeBadge = 'SE';
    else if (text.startsWith('While')) typeBadge = 'ENQUANTO';
    else if (text.startsWith('For')) typeBadge = 'PARA';
    else if (text.startsWith('Repeat')) typeBadge = 'REPITA';
    else if (text.startsWith('Write')) typeBadge = 'ESCREVA';
    else if (text.startsWith('Read')) typeBadge = 'LEIA';

    // Checa se é um literal gerado por Constant Folding
    const isFolded = text.startsWith('Literal') && (text.includes('INTEIRO') || text.includes('BOOLEANO'));

    return {
      id: `ast_node_${idx}`,
      depth,
      text,
      typeBadge,
      isFolded,
    };
  });
}

export const AstPanel = React.memo(function AstPanel({
  rawAst,
  optimizedAst,
  optimizeEnabled,
  isLoading,
}: AstPanelProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'tree'>('split');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const { themeConfig } = useTheme();

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
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400">Compilando e gerando AST...</span>
      </div>
    );
  }

  if (!rawAst) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 italic p-6 text-xs text-center">
        Execute uma análise estática (botão Analisar ou F9) para visualizar a Árvore Sintática Abstrata (AST).
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] text-[var(--text-main)] font-mono text-xs overflow-hidden">
      {/* Header com modo de visualização e copiar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] select-none">
        <div className="flex items-center gap-2">
          <GitCompare className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />
          <span className="font-semibold text-slate-200">
            {optimizeEnabled
              ? 'Comparação AST: Original vs. Otimizada (Constant Folding)'
              : 'Árvore Sintática Abstrata (AST)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de Modo: Split Texto vs Árvore Interativa (#21) */}
          <div className="flex items-center rounded-md bg-[var(--bg-surface)] p-0.5 border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition ${
                viewMode === 'split'
                  ? 'bg-[var(--bg-active-tab)] text-white font-medium'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
              title="Visualização Textual Split View"
            >
              <FileText className="w-3 h-3" />
              <span>Split Texto</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition ${
                viewMode === 'tree'
                  ? 'bg-[var(--bg-active-tab)] text-white font-medium'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
              title="Visualização em Árvore Interativa Didática"
            >
              <ListTree className="w-3 h-3" />
              <span>Árvore Visual</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(optimizedAst || rawAst)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-slate-300 transition border border-[var(--border-color)]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar AST'}
          </button>
        </div>
      </div>

      {/* Conteúdo: Modo Split View */}
      {viewMode === 'split' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)] overflow-hidden">
          {/* Coluna 1: AST Bruta */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3 py-1.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)] text-sky-400 font-semibold text-[11px] flex items-center justify-between">
              <span>AST Original (com Tipos Anotados)</span>
              <span className="text-[10px] text-slate-500 font-normal">Pós-Semântico</span>
            </div>
            <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono">
              {rawAst}
            </div>
          </div>

          {/* Coluna 2: AST Otimizada (#24 Diff Visual) */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3 py-1.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)] text-emerald-400 font-semibold text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                AST Otimizada (Constant Folding)
              </span>
              {!optimizeEnabled && (
                <span className="text-slate-500 font-normal italic text-[10px]">
                  Ative --opt na barra superior
                </span>
              )}
            </div>
            <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono">
              {optimizedAst || (
                <span className="text-slate-500 italic">
                  Ative o toggle "Constant Folding (--opt)" na barra superior e clique em Analisar para visualizar as expressões dobradas em tempo de compilação.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo: Modo Árvore Interativa (#21 Tree View) */}
      {viewMode === 'tree' && (
        <div className="flex-1 overflow-auto p-4 space-y-1 select-text">
          {(optimizeEnabled && optNodes.length > 0 ? optNodes : rawNodes).map((node) => {
            const isCollapsed = collapsedNodes[node.id];

            return (
              <div
                key={node.id}
                style={{ paddingLeft: `${node.depth * 22}px` }}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[var(--bg-surface)] transition group"
              >
                {node.depth > 0 && (
                  <button
                    onClick={() => toggleCollapse(node.id)}
                    className="p-0.5 text-slate-500 hover:text-white"
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
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider ${
                      node.typeBadge === 'PROGRAMA'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                        : node.typeBadge === 'BLOCO'
                        ? 'bg-slate-800 text-slate-300'
                        : node.typeBadge === 'DECL'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800/40'
                        : node.typeBadge === 'ATRIB'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        : node.typeBadge === 'LITERAL'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                    }`}
                  >
                    {node.typeBadge}
                  </span>
                )}

                <span className="text-slate-200 group-hover:text-white font-mono text-[11px]">
                  {node.text}
                </span>

                {/* Diff Visual tag (#24) */}
                {optimizeEnabled && node.isFolded && (
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50 text-[9px] font-semibold animate-pulse">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    Dobrado
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
