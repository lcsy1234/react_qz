import dagre from '@dagrejs/dagre'
import { Position, type Edge, type Node } from '@xyflow/react'

const NODE_WIDTH = 220
const NODE_HEIGHT = 96

type LayoutSizeData = {
  layoutWidth?: number
  layoutHeight?: number
}

function getNodeSize(node: Node): { width: number; height: number } {
  const data = node.data as LayoutSizeData | undefined
  return {
    width: data?.layoutWidth ?? NODE_WIDTH,
    height: data?.layoutHeight ?? NODE_HEIGHT,
  }
}

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
    nodesep: 48,//节点间距
    ranksep: 72,//层间距
    marginx: 24,//左右边距
    marginy: 24,//上下边距
  })

  const isHorizontal = direction === 'LR'//是否水平布局

  nodes.forEach((node) => {
    const { width, height } = getNodeSize(node)
    graph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target)//设置边
  })

  dagre.layout(graph)//布局

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = graph.node(node.id)
    const { width, height } = getNodeSize(node)

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: x - width / 2,
        y: y - height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
