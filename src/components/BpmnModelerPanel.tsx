import { useEffect, useRef, useState } from 'react'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import { Alert, Button, Space, Typography } from 'antd'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

type BpmnModelerPanelProps = {
  initialXml: string
  onExport: (xml: string) => void
  exporting?: boolean
}

export default function BpmnModelerPanel({ initialXml, onExport, exporting }: BpmnModelerPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelerRef = useRef<BpmnModeler | null>(null)
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    container.innerHTML = ''

    const modeler = new BpmnModeler({ container })
    modelerRef.current = modeler

    const load = async () => {
      try {
        await modeler.importXML(initialXml)
        if (cancelled) return

        const canvas = modeler.get('canvas') as { zoom: (mode: string) => void }
        canvas.zoom('fit-viewport')
        setReady(true)
        setInitError(null)
      } catch (err: unknown) {
        if (cancelled) return

        const message = err instanceof Error ? err.message : String(err)
        // 仅有语义、没有 BPMNDI 时回退空白图
        if (message.includes('no diagram to display')) {
          try {
            await modeler.createDiagram()
            if (cancelled) return
            setReady(true)
            setInitError(null)
            return
          } catch (fallbackErr: unknown) {
            if (!cancelled) {
              setInitError(
                fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
              )
            }
            return
          }
        }

        setInitError(message)
      }
    }

    void load()

    return () => {
      cancelled = true
      try {
        modeler.destroy()
      } catch {
        // destroy 过程中忽略二次报错（StrictMode 双调用）
      }
      if (modelerRef.current === modeler) {
        modelerRef.current = null
      }
    }
  }, [initialXml])

  const handleExport = async () => {
    const modeler = modelerRef.current
    if (!modeler) return

    const { xml } = await modeler.saveXML({ format: true })
    onExport(xml)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '8px 0 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          左侧工具栏可拖入任务、并行网关（Parallel Gateway）等元素，画好后导出 XML。
        </Typography.Text>
        <Space>
          <Button type="primary" loading={exporting} disabled={!ready} onClick={handleExport}>
            导出 XML 并解析
          </Button>
        </Space>
      </div>

      {initError && (
        <Alert
          type="error"
          message="BPMN 设计器加载失败"
          description={initError}
          showIcon
          style={{ marginBottom: 12 }}
        />
      )}

      {/* 容器必须始终挂载，避免出错时卸载导致 bpmn-js 访问已销毁的 canvas */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 480,
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          background: '#fafafa',
          visibility: initError ? 'hidden' : 'visible',
        }}
      />
    </div>
  )
}
