// TODO: add spec defaults
export type CompSpec = {
  layout: CompType
  mirrored?: boolean  // TODO: should this be remained here and remove in AxisConsistency?
  direction?: CompDirection // related: stack operations
  unit?: CompLevel  // related: stack operations
  consistency: Consistency  // related: chart-wise stack operations
}
export type CompType = "stack" | "blend" | "overlay"
export type CompDirection = "horizontal" | "vertical"
export type CompLevel = "chart" | "element"
export type Consistency = {
  y: boolean | AxisConsistency
  x: boolean | AxisConsistency
  color?: boolean
}
export type AxisConsistency = {
  value: boolean
  mirrored: boolean // related: chart-wise stack operations
}