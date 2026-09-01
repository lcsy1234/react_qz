declare module 'bpmn-js/lib/Modeler' {
  export default class BpmnModeler {
    constructor(options: { container: HTMLElement })
    importXML(xml: string): Promise<{ warnings: unknown[] }>
    createDiagram(): Promise<{ warnings: unknown[] }>
    saveXML(options?: { format?: boolean }): Promise<{ xml: string }>
    get(name: string): unknown
    destroy(): void
  }
}
