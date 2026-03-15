export type NodeType = "start" | "end" | "process" | "decision" | "document" | "parallel"

export interface FlowNode {
  id: string
  type: NodeType
  label: string
  sublabel?: string
  color?: string
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
}

export interface Flow {
  id: string
  title: string
  description: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  accentColor: string
}

export interface EntityField {
  name: string
  type: string
  pk?: boolean
  fk?: string
  optional?: boolean
}

export interface DataEntity {
  id: string
  name: string
  module: string
  color: string
  fields: EntityField[]
}

export interface DataRelationship {
  from: string
  to: string
  cardinality: string
  label: string
}
