import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import {
  ReactFlow,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeProps,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type CardNodeData = {
  title: string
  content: string
}

type CardFlowNode = Node<CardNodeData, 'card'>

const cardShell: CSSProperties = {
  width: 220,
  borderRadius: 8,
  border: '1px solid #91caff',
  boxShadow: '0 0 0 2px rgba(22, 119, 255, 0.12)',
  overflow: 'hidden',
  background: '#fff',
  fontSize: 13,
}

const cardHeader: CSSProperties = {
  background: '#1677ff',
  color: '#fff',
  padding: '8px 12px',
  fontWeight: 600,
}

const cardBody: CSSProperties = {
  padding: '10px 12px',
  color: '#262626',
  lineHeight: 1.5,
}

function CardNode({ data }: NodeProps<CardFlowNode>) {
  return (
    <div style={cardShell}>
      <Handle type="target" position={Position.Top} />
      <div style={cardHeader}>{data.title}</div>
      <div style={cardBody}>{data.content}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const initialNodes: CardFlowNode[] = [
  {
    id: 'n1',
    type: 'card',
    position: { x: 80, y: 40 },
    data: { title: '设备选择', content: '1. 设备选择' },
  },
  {
    id: 'n2',
    type: 'card',
    position: { x: 80, y: 220 },
    data: { title: '参数配置', content: '填写基础参数' },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'n1-n2',
    source: 'n1',
    target: 'n2',
    type: 'smoothstep',
  },
]

export default function FlowDemoPage() {
  const [nodes, setNodes] = useState<CardFlowNode[]>(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const nodeTypes = useMemo(() => ({ card: CardNode }), [])

  const onNodesChange: OnNodesChange<CardFlowNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  )

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  )
}
