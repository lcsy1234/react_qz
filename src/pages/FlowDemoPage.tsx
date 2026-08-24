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
import { getLayoutedElements, type LayoutDirection } from '../utils/dagreLayout'

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

function CardNode({ data, sourcePosition, targetPosition }: NodeProps<CardFlowNode>) {
  return (
    <div style={cardShell}>
      <Handle type="target" position={targetPosition ?? Position.Top} />
      <div style={cardHeader}>{data.title}</div>
      <div style={cardBody}>{data.content}</div>
      <Handle type="source" position={sourcePosition ?? Position.Bottom} />
    </div>
  )
}

/** 并行分支：一个起点 → 多路并行任务 → 一个汇聚点 */
const parallelNodes: CardFlowNode[] = [
  {
    id: 'start',
    type: 'card',
    position: { x: 0, y: 0 },
    data: { title: '设备选择', content: '选择目标设备，发起并行配置' },
  },
  {
    id: 'network',
    type: 'card',
    position: { x: 0, y: 0 },
    data: { title: '网络配置', content: '并行分支 1：IP / 网关 / DNS' },
  },
  {
    id: 'params',
    type: 'card',
    position: { x: 0, y: 0 },
    data: { title: '参数配置', content: '并行分支 2：业务参数与阈值' },
  },
  {
    id: 'auth',
    type: 'card',
    position: { x: 0, y: 0 },
    data: { title: '权限配置', content: '并行分支 3：角色与访问策略' },
  },
  {
    id: 'finish',
    type: 'card',
    position: { x: 0, y: 0 },
    data: { title: '执行完成', content: '等待全部分支完成后汇总' },
  },
]

const parallelEdges: Edge[] = [
  { id: 'start-network', source: 'start', target: 'network', type: 'smoothstep' },
  { id: 'start-params', source: 'start', target: 'params', type: 'smoothstep' },
  { id: 'start-auth', source: 'start', target: 'auth', type: 'smoothstep' },
  { id: 'network-finish', source: 'network', target: 'finish', type: 'smoothstep' },
  { id: 'params-finish', source: 'params', target: 'finish', type: 'smoothstep' },
  { id: 'auth-finish', source: 'auth', target: 'finish', type: 'smoothstep' },
]

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  parallelNodes,
  parallelEdges,
  'TB',
)

export default function FlowDemoPage() {
  const [nodes, setNodes] = useState<CardFlowNode[]>(layoutedNodes)
  const [edges, setEdges] = useState(layoutedEdges)
  const [direction, setDirection] = useState<LayoutDirection>('TB')
  const nodeTypes = useMemo(() => ({ card: CardNode }), [])

  const applyLayout = useCallback((nextDirection: LayoutDirection) => {
    const { nodes: nextNodes, edges: nextEdges } = getLayoutedElements(
      parallelNodes,
      parallelEdges,
      nextDirection,
    )
    setDirection(nextDirection)
    setNodes(nextNodes)
    setEdges(nextEdges)
  }, [])

  const onNodesChange: OnNodesChange<CardFlowNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [],
  )

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 0 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: '#595959', fontSize: 13 }}>Dagre 并行布局：</span>
        <button
          type="button"
          onClick={() => applyLayout('TB')}
          style={{
            padding: '4px 12px',
            borderRadius: 6,
            border: '1px solid',
            borderColor: direction === 'TB' ? '#1677ff' : '#d9d9d9',
            background: direction === 'TB' ? '#e6f4ff' : '#fff',
            cursor: 'pointer',
          }}
        >
          自上而下
        </button>
        <button
          type="button"
          onClick={() => applyLayout('LR')}
          style={{
            padding: '4px 12px',
            borderRadius: 6,
            border: '1px solid',
            borderColor: direction === 'LR' ? '#1677ff' : '#d9d9d9',
            background: direction === 'LR' ? '#e6f4ff' : '#fff',
            cursor: 'pointer',
          }}
        >
          自左而右
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
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
    </div>
  )
}
