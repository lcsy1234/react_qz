/// <reference types="vite/client" />

declare module '*.bpmn.xml?raw' {
  const content: string
  export default content
}
