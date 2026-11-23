import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import { Position } from '@xyflow/react';
import type { CfgNodeData } from './types';

export function getLayoutedElements(
  nodes: Node<CfgNodeData>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 45,
    ranksep: 55,
  });

  nodes.forEach((node) => {
    let width = 240;
    let height = 80;

    if (node.type === 'start' || node.type === 'end') {
      width = 190;
      height = 50;
    } else if (node.type === 'condition' || node.type === 'loop') {
      width = 250;
      height = 95;
    } else if (node.type === 'block') {
      width = 270;
      const lines = node.data?.instructions || [];
      height = Math.max(75, 45 + lines.length * 20);
    }

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const isHorizontal = direction === 'LR';

  const layoutedNodes: Node<CfgNodeData>[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    let width = 240;
    let height = 80;

    if (node.type === 'start' || node.type === 'end') {
      width = 190;
      height = 50;
    } else if (node.type === 'condition' || node.type === 'loop') {
      width = 250;
      height = 95;
    } else if (node.type === 'block') {
      width = 270;
      const lines = node.data?.instructions || [];
      height = Math.max(75, 45 + lines.length * 20);
    }

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
