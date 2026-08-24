import dagre from '@dagrejs/dagre'
import { Position, type Edge, type Node } from '@xyflow/react'

const NODE_WIDTH = 220
const NODE_HEIGHT = 96

export type LayoutDirection = 'TB' | 'LR'

export function getLayoutedElements<T extends Node>(
  nodes: T[],
  edges: Edge[],
  direction: LayoutDirection = 'TB',
): { nodes: T[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: direction,
    nodesep: 48,
    ranksep: 72,
    marginx: 24,
    marginy: 24,
  })

  const isHorizontal = direction === 'LR'

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = graph.node(node.id)

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - NODE_HEIGHT / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
