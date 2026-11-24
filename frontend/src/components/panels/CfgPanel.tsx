import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Network, Maximize2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { CfgNodeData } from './cfg/types';
import { getLayoutedElements } from './cfg/layout';
import { StartNode } from './cfg/StartNode';
import { EndNode } from './cfg/EndNode';
import { BlockNode } from './cfg/BlockNode';
import { ConditionNode } from './cfg/ConditionNode';
import { LoopNode } from './cfg/LoopNode';

interface CfgPanelProps {
  sourceCode: string;
  astRaw: string | null;
  isLoading?: boolean;
  activeLine?: number;
  onNodeClick?: (startLine: number, endLine?: number) => void;
}

const nodeTypes: NodeTypes = {
  start: StartNode as unknown as React.ComponentType<any>,
  end: EndNode as unknown as React.ComponentType<any>,
  block: BlockNode as unknown as React.ComponentType<any>,
  condition: ConditionNode as unknown as React.ComponentType<any>,
  loop: LoopNode as unknown as React.ComponentType<any>,
};

/**
 * Construtor determinístico de nós e arestas do CFG para MiniLang
 */
function buildGraphModel(
  source: string,
  _ast: string | null,
  activeLine?: number,
  onNodeClick?: (startLine: number, endLine?: number) => void
): { rawNodes: Node<CfgNodeData>[]; rawEdges: Edge[] } {
  if (!source || !source.trim()) {
    return { rawNodes: [], rawEdges: [] };
  }

  const rawNodes: Node<CfgNodeData>[] = [];
  const rawEdges: Edge[] = [];

  const rawLines = source.split('\n');

  // Nó Inicial
  const startId = 'node_start';
  rawNodes.push({
    id: startId,
    type: 'start',
    position: { x: 0, y: 0 },
    data: {
      label: 'Início do Programa',
      startLine: 1,
      endLine: 1,
      isActive: activeLine === 1,
      onNodeClick,
    },
  });

  let lastNodeId = startId;
  let currentBlockLines: string[] = [];
  let blockStartLine = 1;

  const flushBlock = (endLine: number) => {
    if (currentBlockLines.length > 0) {
      const blockId = `node_block_${rawNodes.length}`;
      rawNodes.push({
        id: blockId,
        type: 'block',
        position: { x: 0, y: 0 },
        data: {
          label: 'Bloco Linear',
          instructions: [...currentBlockLines],
          startLine: blockStartLine,
          endLine: Math.max(blockStartLine, endLine),
          isActive: activeLine !== undefined && activeLine >= blockStartLine && activeLine <= endLine,
          onNodeClick,
        },
      });

      rawEdges.push({
        id: `e_${lastNodeId}_${blockId}`,
        source: lastNodeId,
        target: blockId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      });

      lastNodeId = blockId;
      currentBlockLines = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;
    const line = rawLines[i].trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    if (line.startsWith('programa ') || line === '{' || line === '}' || line.startsWith('fim.')) {
      continue;
    }

    if (line.startsWith('se ') || line.startsWith('se(')) {
      flushBlock(lineNum - 1);

      const condId = `node_cond_${rawNodes.length}`;
      const condExpr = line.replace(/\{.*/, '').trim();

      rawNodes.push({
        id: condId,
        type: 'condition',
        position: { x: 0, y: 0 },
        data: {
          label: 'Desvio (se)',
          condition: condExpr,
          startLine: lineNum,
          endLine: lineNum,
          isActive: activeLine === lineNum,
          onNodeClick,
        },
      });

      rawEdges.push({
        id: `e_${lastNodeId}_${condId}`,
        source: lastNodeId,
        target: condId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      });

      lastNodeId = condId;
    } else if (
      line.startsWith('enquanto ') ||
      line.startsWith('enquanto(') ||
      line.startsWith('para ') ||
      line.startsWith('repita')
    ) {
      flushBlock(lineNum - 1);

      const loopId = `node_loop_${rawNodes.length}`;
      const loopExpr = line.replace(/\{.*/, '').trim();

      rawNodes.push({
        id: loopId,
        type: 'loop',
        position: { x: 0, y: 0 },
        data: {
          label: line.startsWith('para')
            ? 'Laço Contado (para)'
            : line.startsWith('repita')
            ? 'Laço Pós-testado (repita)'
            : 'Laço Pré-testado (enquanto)',
          condition: loopExpr,
          startLine: lineNum,
          endLine: lineNum,
          isActive: activeLine === lineNum,
          onNodeClick,
        },
      });

      rawEdges.push({
        id: `e_${lastNodeId}_${loopId}`,
        source: lastNodeId,
        target: loopId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      });

      lastNodeId = loopId;
    } else {
      if (currentBlockLines.length === 0) {
        blockStartLine = lineNum;
      }
      currentBlockLines.push(line);
    }
  }

  flushBlock(rawLines.length);

  // Nó Final
  const endId = 'node_end';
  rawNodes.push({
    id: endId,
    type: 'end',
    position: { x: 0, y: 0 },
    data: {
      label: 'Fim do Programa',
      startLine: rawLines.length,
      endLine: rawLines.length,
      isActive: activeLine === rawLines.length,
      onNodeClick,
    },
  });

  rawEdges.push({
    id: `e_${lastNodeId}_${endId}`,
    source: lastNodeId,
    target: endId,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  });

  return { rawNodes, rawEdges };
}

/**
 * Componente interno do React Flow que gerencia a preservação de viewport
 */
function CfgFlowCanvas({
  sourceCode,
  astRaw,
  activeLine,
  onNodeClick,
}: {
  sourceCode: string;
  astRaw: string | null;
  activeLine?: number;
  onNodeClick?: (startLine: number, endLine?: number) => void;
}) {
  const { themeConfig } = useTheme();
  const { getViewport, setViewport, fitView } = useReactFlow();

  const isInitializedRef = useRef(false);
  const prevViewportRef = useRef<{ x: number; y: number; zoom: number } | null>(null);

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const { rawNodes, rawEdges } = buildGraphModel(
      sourceCode,
      astRaw,
      activeLine,
      onNodeClick
    );
    const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges, 'TB');
    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [sourceCode, astRaw, activeLine, onNodeClick]);

  // Preservação de Viewport (TASK-2.4)
  useEffect(() => {
    if (!layoutedNodes || layoutedNodes.length === 0) return;

    if (!isInitializedRef.current) {
      // Primeira inicialização: ajusta para caber todos os nós
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
        isInitializedRef.current = true;
      }, 50);
    } else if (prevViewportRef.current) {
      // Atualizações de digitação subsequentes: restaura viewport anterior sem pular a câmera
      setViewport(prevViewportRef.current, { duration: 0 });
    }
  }, [layoutedNodes, fitView, setViewport]);

  const handleViewportChange = useCallback(() => {
    if (isInitializedRef.current) {
      prevViewportRef.current = getViewport();
    }
  }, [getViewport]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  return (
    <div className="relative w-full h-full">
      {/* Botão de Fit View Rápido */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
        <button
          onClick={handleFitView}
          title="Enquadrar Grafo Completo (Fit View)"
          className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-white transition border border-[var(--border-color)] shadow-md text-xs flex items-center gap-1"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">Enquadrar</span>
        </button>
      </div>

      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={nodeTypes}
        onMoveEnd={handleViewportChange}
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--bg-panel)]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.5}
          color="rgba(148, 163, 184, 0.12)"
        />
        <Controls
          showInteractive={false}
          className="!bg-[var(--bg-surface)] !border-[var(--border-color)] !shadow-xl !rounded-lg overflow-hidden [&>button]:!bg-transparent [&>button]:!border-b [&>button]:!border-[var(--border-color)] [&>button]:!text-[var(--text-main)] hover:[&>button]:!bg-[var(--bg-subtle)]"
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            if (node.type === 'start') return '#10b981';
            if (node.type === 'end') return '#64748b';
            if (node.type === 'condition') return '#f59e0b';
            if (node.type === 'loop') return '#6366f1';
            return themeConfig.primaryColor;
          }}
          className="!bg-[var(--bg-surface)] !border-[var(--border-color)] !rounded-lg !shadow-xl"
          maskColor="rgba(0, 0, 0, 0.65)"
        />
      </ReactFlow>
    </div>
  );
}

export const CfgPanel = React.memo(function CfgPanel({
  sourceCode,
  astRaw,
  isLoading,
  activeLine,
  onNodeClick,
}: CfgPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3 bg-[var(--bg-panel)] text-[var(--text-main)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        <span className="text-xs text-[var(--text-muted)]">
          Calculando layout hierárquico com Dagre & React Flow...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-main)] text-xs overflow-hidden select-text transition-colors">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-panel-soft)] border-b border-[var(--border-faint)] select-none shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-[var(--text-main)]">
            Grafo de Fluxo de Controle (CFG)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
            Arraste, aplique zoom e clique nos blocos para navegar
          </span>
        </div>
      </div>

      {/* Área do Grafo com ReactFlowProvider */}
      <div className="flex-1 w-full h-full overflow-hidden">
        <ReactFlowProvider>
          <CfgFlowCanvas
            sourceCode={sourceCode}
            astRaw={astRaw}
            activeLine={activeLine}
            onNodeClick={onNodeClick}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
});
