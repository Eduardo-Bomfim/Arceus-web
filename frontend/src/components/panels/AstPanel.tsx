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
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3 bg-[#1e1f22]">
        <div className="w-6 h-6 rounded-full border-2 border-[#3574f0] border-t-transparent animate-spin" />
        <span className="text-xs text-[#868a91]">Compiling & Generating AST...</span>
      </div>
    );
  }

  if (!rawAst) {
    return (
      <div className="flex h-full items-center justify-center text-[#868a91] p-6 text-xs text-center font-sans bg-[#1e1f22]">
        Run static inspection or execute (F9) to inspect the Abstract Syntax Tree (AST).
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#dfe1e5] font-sans text-xs overflow-hidden select-text">
      {/* Header com modo de visualização e copiar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#2b2d30] border-b border-[#393b40] select-none shrink-0">
        <div className="flex items-center gap-2">
          <GitCompare className="w-3.5 h-3.5 text-[#59a869]" />
          <span className="font-semibold text-[#dfe1e5]">
            {optimizeEnabled
              ? 'AST Compare: Original vs Optimized (Constant Folding)'
              : 'Abstract Syntax Tree (AST)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Alternador de Modo: Split vs Árvore Visual */}
          <div className="flex items-center rounded-[4px] bg-[#1e1f22] p-0.5 border border-[#393b40]">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] transition ${
                viewMode === 'split'
                  ? 'bg-[#2b2d30] text-white font-medium shadow-sm'
                  : 'text-[#868a91] hover:text-[#dfe1e5]'
              }`}
              title="Split Text View"
            >
              <FileText className="w-3 h-3" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] transition ${
                viewMode === 'tree'
                  ? 'bg-[#2b2d30] text-white font-medium shadow-sm'
                  : 'text-[#868a91] hover:text-[#dfe1e5]'
              }`}
              title="Visual Tree View"
            >
              <ListTree className="w-3 h-3" />
              <span>Tree View</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(optimizedAst || rawAst)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] bg-[#1e1f22] hover:bg-[#35373c] text-[#dfe1e5] transition border border-[#393b40]"
          >
            {copied ? <Check className="w-3 h-3 text-[#59a869]" /> : <Copy className="w-3 h-3 text-[#868a91]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Conteúdo: Modo Split View */}
      {viewMode === 'split' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#393b40] overflow-hidden">
          {/* Coluna 1: AST Bruta */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3 py-1 bg-[#2b2d30] border-b border-[#393b40] text-[#56a8f5] font-semibold text-[11px] flex items-center justify-between shrink-0">
              <span>Original AST (Annotated Types)</span>
              <span className="text-[10px] text-[#868a91] font-normal">Post-Semantic</span>
            </div>
            <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono text-[11.5px] bg-[#1e1f22]">
              {rawAst}
            </div>
          </div>

          {/* Coluna 2: AST Otimizada */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3 py-1 bg-[#2b2d30] border-b border-[#393b40] text-[#59a869] font-semibold text-[11px] flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#e5a83b]" />
                Optimized AST (Constant Folding)
              </span>
              {!optimizeEnabled && (
                <span className="text-[#868a91] font-normal italic text-[10px]">
                  Enable --opt on toolbar
                </span>
              )}
            </div>
            <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono text-[11.5px] bg-[#1e1f22]">
              {optimizedAst || (
                <span className="text-[#868a91] italic font-sans text-xs">
                  Enable the &quot;--opt (Constant Folding)&quot; toggle on the main toolbar to fold constant expressions at compile-time.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo: Modo Árvore Interativa */}
      {viewMode === 'tree' && (
        <div className="flex-1 overflow-auto p-3 space-y-0.5 select-text font-mono text-xs bg-[#1e1f22]">
          {(optimizeEnabled && optNodes.length > 0 ? optNodes : rawNodes).map((node) => {
            const isCollapsed = collapsedNodes[node.id];

            return (
              <div
                key={node.id}
                style={{ paddingLeft: `${node.depth * 20}px` }}
                onClick={() => node.line && onSelectLine?.(node.line)}
                className={`flex items-center gap-1.5 py-0.5 px-2 rounded-[3px] hover:bg-[#2b2d30] transition ${
                  node.line ? 'cursor-pointer hover:border-l-2 hover:border-[#3574f0]' : ''
                }`}
              >
                {node.depth > 0 && (
                  <button
                    onClick={() => toggleCollapse(node.id)}
                    className="p-0.5 text-[#868a91] hover:text-white"
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
                        ? 'bg-[#3574f0]/20 text-[#56a8f5] border border-[#3574f0]/40'
                        : node.typeBadge === 'BLOCK'
                        ? 'bg-[#2b2d30] text-[#bcbec4] border border-[#393b40]'
                        : node.typeBadge === 'DECL'
                        ? 'bg-[#59a869]/20 text-[#59a869] border border-[#59a869]/40'
                        : node.typeBadge === 'ASSIGN'
                        ? 'bg-[#cf8e6d]/20 text-[#cf8e6d] border border-[#cf8e6d]/40'
                        : node.typeBadge === 'LITERAL'
                        ? 'bg-[#2aacb8]/20 text-[#2aacb8] border border-[#2aacb8]/40'
                        : 'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/40'
                    }`}
                  >
                    {node.typeBadge}
                  </span>
                )}

                <span className="text-[#dfe1e5] font-mono text-[11px]">
                  {node.text}
                </span>

                {optimizeEnabled && node.isFolded && (
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#e5a83b]/20 text-[#e5a83b] border border-[#e5a83b]/40 text-[9px] font-semibold">
                    <Sparkles className="w-2.5 h-2.5 text-[#e5a83b]" />
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
