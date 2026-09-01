import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import {
  ReactFlow,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeProps,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Alert, Button, Spin, Table, Tabs, Typography, message } from 'antd'
import BpmnModelerPanel from '../components/BpmnModelerPanel'
import sampleBpmnXml from '../data/parallelProcess.bpmn.xml?raw'
import { bpmnToReactFlow, type FlowNodeData } from '../utils/bpmnToReactFlow'
import { getLayoutedElements, type LayoutDirection } from '../utils/dagreLayout'
import { parseBpmnXml, type BpmnParseResult } from '../utils/parseBpmn'

type CardFlowNode = Node<FlowNodeData, 'card'>
type GatewayFlowNode = Node<FlowNodeData, 'gateway'>
type EventFlowNode = Node<FlowNodeData, 'event'>
type BpmnFlowNode = CardFlowNode | GatewayFlowNode | EventFlowNode

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

function GatewayNode({ data, sourcePosition, targetPosition }: NodeProps<GatewayFlowNode>) {
  return (
    <div style={{ width: 80, height: 80, position: 'relative' }}>
      <Handle type="target" position={targetPosition ?? Position.Top} />
      <div
        style={{
          width: 56,
          height: 56,
          border: '2px solid #fa8c16',
          background: '#fff7e6',
          transform: 'rotate(45deg)',
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            transform: 'rotate(-45deg)',
            fontSize: 11,
            color: '#d46b08',
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: 40,
          }}
        >
          {data.title.includes('网关') || data.title.includes('Gateway') ? '+' : data.title.slice(0, 4)}
        </span>
      </div>
      <Handle type="source" position={sourcePosition ?? Position.Bottom} />
    </div>
  )
}

function EventNode({ data, sourcePosition, targetPosition }: NodeProps<EventFlowNode>) {
  const isEnd = data.content.includes('End')
  return (
    <div style={{ width: 64, height: 64, position: 'relative' }}>
      <Handle type="target" position={targetPosition ?? Position.Top} />
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: `2px solid ${isEnd ? '#ff4d4f' : '#52c41a'}`,
          background: isEnd ? '#fff1f0' : '#f6ffed',
          position: 'absolute',
          top: 10,
          left: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#595959',
        }}
      >
        {data.title.slice(0, 2)}
      </div>
      <Handle type="source" position={sourcePosition ?? Position.Bottom} />
    </div>
  )
}

function BpmnParsePanel({
  loading,
  error,
  result,
  xmlPreview,
}: {
  loading: boolean
  error: string | null
  result: BpmnParseResult | null
  xmlPreview: string | null
}) {
  if (!result && !loading && !error) {
    return (
      <Alert
        style={{ margin: 16 }}
        type="info"
        showIcon
        message="尚未解析"
        description='请先在「BPMN 设计器」中编辑流程，点击「导出 XML 并解析」。'
      />
    )
  }

  if (loading) {
    return <Spin tip="正在解析 BPMN XML..." style={{ margin: 24 }} />
  }

  if (error) {
    return <Alert type="error" message="解析失败" description={error} showIcon style={{ margin: 16 }} />
  }

  if (!result) return null

  return (
    <div style={{ padding: '0 16px 16px', overflow: 'auto', height: '100%' }}>
      <Typography.Paragraph style={{ marginTop: 12 }}>
        流程 ID：<Typography.Text code>{result.processId}</Typography.Text>
        {' · '}
        流程名称：{result.processName || '（未命名）'}
      </Typography.Paragraph>

      {result.warnings.length > 0 && (
        <Alert
          type="warning"
          message="解析警告"
          description={result.warnings.join('\n')}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {xmlPreview && (
        <>
          <Typography.Title level={5}>导出的 XML</Typography.Title>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 8,
              fontSize: 11,
              overflow: 'auto',
              maxHeight: 200,
              marginBottom: 24,
            }}
          >
            {xmlPreview}
          </pre>
        </>
      )}

      <Typography.Title level={5}>节点 / 网关 / 事件（{result.elements.length}）</Typography.Title>
      <Table
        size="small"
        pagination={false}
        rowKey="id"
        style={{ marginBottom: 24 }}
        dataSource={result.elements}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 180 },
          { title: '类型', dataIndex: 'type', width: 140 },
          { title: '名称', dataIndex: 'name' },
        ]}
      />

      <Typography.Title level={5}>连线 sequenceFlow（{result.sequenceFlows.length}）</Typography.Title>
      <Table
        size="small"
        pagination={false}
        rowKey="id"
        style={{ marginBottom: 24 }}
        dataSource={result.sequenceFlows}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 180 },
          { title: 'sourceRef', dataIndex: 'sourceRef', width: 180 },
          { title: 'targetRef', dataIndex: 'targetRef', width: 180 },
          { title: '名称', dataIndex: 'name' },
        ]}
      />

      <Typography.Title level={5}>完整 JSON</Typography.Title>
      <pre
        style={{
          background: '#f5f5f5',
          padding: 12,
          borderRadius: 8,
          fontSize: 12,
          overflow: 'auto',
          maxHeight: 320,
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}

export default function FlowDemoPage() {
  const [activeTab, setActiveTab] = useState('modeler')
  const [nodes, setNodes] = useState<BpmnFlowNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [direction, setDirection] = useState<LayoutDirection>('TB')
  const [bpmnLoading, setBpmnLoading] = useState(false)
  const [bpmnError, setBpmnError] = useState<string | null>(null)
  const [bpmnResult, setBpmnResult] = useState<BpmnParseResult | null>(null)
  const [exportedXml, setExportedXml] = useState<string | null>(null)
  const [hasFlowPreview, setHasFlowPreview] = useState(false)

  const nodeTypes = useMemo(
    () => ({
      card: CardNode,
      gateway: GatewayNode,
      event: EventNode,
    }),
    [],
  )

  const applyBpmnToFlow = useCallback((result: BpmnParseResult, layoutDirection: LayoutDirection) => {
    const { nodes: rawNodes, edges: rawEdges } = bpmnToReactFlow(result)
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      layoutDirection,
    )
    setNodes(layoutedNodes as BpmnFlowNode[])
    setEdges(layoutedEdges)
    setHasFlowPreview(true)
  }, [])

  const handleExportFromModeler = useCallback(
    async (xml: string) => {
      setBpmnLoading(true)
      setBpmnError(null)
      setExportedXml(xml)

      try {
        const result = await parseBpmnXml(xml)
        setBpmnResult(result)
        applyBpmnToFlow(result, direction)
        message.success('XML 导出并解析成功，已同步到 React Flow 预览')
        setActiveTab('parse')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setBpmnError(msg)
        message.error(`解析失败：${msg}`)
      } finally {
        setBpmnLoading(false)
      }
    },
    [applyBpmnToFlow, direction],
  )

  const applyLayout = useCallback(
    (nextDirection: LayoutDirection) => {
      if (!bpmnResult) return
      setDirection(nextDirection)
      applyBpmnToFlow(bpmnResult, nextDirection)
    },
    [applyBpmnToFlow, bpmnResult],
  )

  const onNodesChange: OnNodesChange<BpmnFlowNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )

  const flowView = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!hasFlowPreview ? (
        <Alert
          style={{ marginBottom: 12 }}
          type="info"
          showIcon
          message="暂无预览"
          description='请先在设计器中点击「导出 XML 并解析」，此处会展示 BPMN → React Flow 转换结果。'
        />
      ) : (
        <div style={{ padding: '8px 0 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#595959', fontSize: 13 }}>Dagre 布局（来自 BPMN）：</span>
          <Button size="small" type={direction === 'TB' ? 'primary' : 'default'} onClick={() => applyLayout('TB')}>
            自上而下
          </Button>
          <Button size="small" type={direction === 'LR' ? 'primary' : 'default'} onClick={() => applyLayout('LR')}>
            自左而右
          </Button>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        {hasFlowPreview ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodesDraggable
            nodesConnectable={false}
            fitView
          />
        ) : (
          <div
            style={{
              height: '100%',
              border: '1px dashed #d9d9d9',
              borderRadius: 8,
              background: '#fafafa',
            }}
          />
        )}
      </div>
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480, padding: '0 16px 16px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'modeler',
            label: 'BPMN 设计器',
            children: (
              <div style={{ height: 'calc(100vh - 120px)' }}>
                <BpmnModelerPanel
                  initialXml={sampleBpmnXml}
                  onExport={handleExportFromModeler}
                  exporting={bpmnLoading}
                />
              </div>
            ),
          },
          {
            key: 'parse',
            label: '解析结果',
            children: (
              <div style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
                <BpmnParsePanel
                  loading={bpmnLoading}
                  error={bpmnError}
                  result={bpmnResult}
                  xmlPreview={exportedXml}
                />
              </div>
            ),
          },
          {
            key: 'flow',
            label: 'React Flow 预览',
            children: <div style={{ height: 'calc(100vh - 120px)' }}>{flowView}</div>,
          },
        ]}
      />
    </div>
  )
}
