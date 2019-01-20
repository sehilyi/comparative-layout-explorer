// TODO: add spec defaults
export type CompSpec = {
  layout: CompType
  mirrored?: boolean  // TODO: I think this should be remained and remove in AxisConsistency
  direction?: CompDirection
  unit?: CompLevel
  consistency: Consistency
}
export type CompType = "stack"
export type CompDirection = "horizontal" | "vertical"
export type CompLevel = "chart" | "element"
export type Consistency = {
  y: boolean | AxisConsistency
  x: boolean | AxisConsistency
  color?: boolean
}
export type AxisConsistency = {
  value: boolean
  mirrored: boolean
}