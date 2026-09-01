import type { Edge, Node } from '@xyflow/react'
import type { BpmnElementSummary, BpmnParseResult } from './parseBpmn'

export type FlowNodeData = {
  title: string
  content: string
  layoutWidth?: number
  layoutHeight?: number
}

function resolveNodeType(bpmnType: string): 'card' | 'gateway' | 'event' {
  if (bpmnType.endsWith('Gateway')) return 'gateway'
  if (bpmnType.endsWith('Event')) return 'event'
  return 'card'
}

function buildNodeData(el: BpmnElementSummary): FlowNodeData {
  if (el.type.endsWith('Gateway')) {
    return {
      title: el.name || el.type,
      content: el.type,
      layoutWidth: 80,
      layoutHeight: 80,
    }
  }

  if (el.type.endsWith('Event')) {
    return {
      title: el.name || el.type,
      content: el.type,
      layoutWidth: 64,
      layoutHeight: 64,
    }
  }

  return {
    title: el.name || el.id,
    content: el.type,
    layoutWidth: 220,
    layoutHeight: 96,
  }
}

export function bpmnToReactFlow(result: BpmnParseResult): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const nodes: Node<FlowNodeData>[] = result.elements.map((el) => ({
    id: el.id,
    type: resolveNodeType(el.type),
    position: { x: 0, y: 0 },
    data: buildNodeData(el),
  }))

  const edges: Edge[] = result.sequenceFlows.map((flow) => ({
    id: flow.id,
    source: flow.sourceRef,
    target: flow.targetRef,
    type: 'smoothstep',
  }))

  return { nodes, edges }
}
