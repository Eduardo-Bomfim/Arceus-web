import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';
import type { CfgNodeData } from './types';

export const BlockNode = React.memo(function BlockNode({
  data,
}: {
  data: CfgNodeData;
}) {
  const isActive = data.isActive;
  const instructions = data.instructions || [];

  return (
    <div
      onClick={() => data.onNodeClick?.(data.startLine, data.endLine)}
      className={`min-w-[240px] max-w-[280px] rounded-xl border shadow-lg cursor-pointer transition-all duration-200 select-none overflow-hidden ${
        isActive
          ? 'bg-[var(--bg-surface)] border-[var(--accent-primary)] ring-2 ring-[var(--accent-border)] scale-105 shadow-xl'
          : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-slate-500'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[var(--accent-primary)] !border-2 !border-[var(--bg-panel)]"
      />

      {/* Header com badge de linhas */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] text-[10px]">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
          <Layers className="w-3 h-3 text-[var(--accent-primary)]" />
          <span>{data.label || 'Bloco Linear'}</span>
        </div>
        <span className="font-mono px-1.5 py-0.2 rounded bg-black/30 text-[var(--accent-primary)] font-bold">
          L{data.startLine}–L{data.endLine}
        </span>
      </div>

      {/* Instruções */}
      <div className="p-2.5 space-y-1 font-mono text-[11px] leading-relaxed bg-[var(--bg-panel-soft)]">
        {instructions.length > 0 ? (
          instructions.map((line, idx) => (
            <div key={idx} className="text-[var(--text-main)] truncate opacity-90">
              {line}
            </div>
          ))
        ) : (
          <div className="text-[var(--text-muted)] italic text-[10px]">
            {data.details || 'Sem instruções'}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[var(--accent-primary)] !border-2 !border-[var(--bg-panel)]"
      />
    </div>
  );
});
