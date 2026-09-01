import { BpmnModdle } from 'bpmn-moddle'

type ModdleElement = {
  $type: string
  id: string
  name?: string
  sourceRef?: ModdleElement | string
  targetRef?: ModdleElement | string
  flowElements?: ModdleElement[]
  rootElements?: ModdleElement[]
}

export type BpmnElementSummary = {
  id: string
  type: string
  name: string
}

export type BpmnFlowSummary = {
  id: string
  sourceRef: string
  targetRef: string
  name: string
}

export type BpmnParseResult = {
  processId: string
  processName: string
  elements: BpmnElementSummary[]
  sequenceFlows: BpmnFlowSummary[]
  warnings: string[]
}

function refId(ref: ModdleElement | string | undefined): string {
  if (!ref) return ''
  return typeof ref === 'string' ? ref : ref.id
}

function shortType($type: string): string {
  return $type.replace(/^bpmn:/, '')
}

export async function parseBpmnXml(xml: string): Promise<BpmnParseResult> {
  const moddle = new BpmnModdle()
  const { rootElement, warnings } = await moddle.fromXML(xml)

  const definitions = rootElement as ModdleElement
  const process = definitions.rootElements?.find((el) => el.$type === 'bpmn:Process')

  if (!process) {
    throw new Error('BPMN XML 中未找到 bpmn:Process')
  }

  const elements: BpmnElementSummary[] = []
  const sequenceFlows: BpmnFlowSummary[] = []

  for (const el of process.flowElements ?? []) {
    if (el.$type === 'bpmn:SequenceFlow') {
      sequenceFlows.push({
        id: el.id,
        sourceRef: refId(el.sourceRef),
        targetRef: refId(el.targetRef),
        name: el.name ?? '',
      })
    } else {
      elements.push({
        id: el.id,
        type: shortType(el.$type),
        name: el.name ?? '',
      })
    }
  }

  return {
    processId: process.id,
    processName: process.name ?? '',
    elements,
    sequenceFlows,
    warnings: (warnings ?? []).map((w: unknown) => String(w)),
  }
}
