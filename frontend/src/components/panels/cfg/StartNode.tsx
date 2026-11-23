import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { CfgNodeData } from './types';

export const StartNode = React.memo(function StartNode({
  data,
}: {
  data: CfgNodeData;
}) {
  const isActive = data.isActive;

  return (
    <div
      onClick={() => data.onNodeClick?.(data.startLine, data.endLine)}
      className={`px-4 py-2.5 rounded-full border shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200 select-none ${
        isActive
          ? 'bg-emerald-950 border-emerald-400 ring-2 ring-emerald-400/50 scale-105 shadow-emerald-500/20'
          : 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-600/70 text-emerald-300'
      }`}
    >
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
        <Play className="w-3 h-3 fill-emerald-400 text-emerald-400 ml-0.5" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-xs tracking-wide text-emerald-200">
          {data.label || 'Início'}
        </span>
        <span className="text-[9px] text-emerald-400/80 font-mono">
          L{data.startLine}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-950"
      />
    </div>
  );
});
