declare module 'bpmn-moddle' {
  export class BpmnModdle {
    fromXML(xml: string): Promise<{
      rootElement: unknown
      references?: unknown[]
      warnings?: unknown[]
      elementsById?: Record<string, unknown>
    }>
    toXML(element: unknown): Promise<{ xml: string }>
  }
}
