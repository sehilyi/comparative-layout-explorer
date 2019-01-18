// TODO: add spec defaults
export type CompSpec = {
  layout: CompType
  mirrored?: boolean  // TODO: remove and remain this in Consistency_Y?
  direction?: CompDirection
  consistency: Consistency
}
export type CompType = "stack";
export type CompDirection = "horizontal" | "vertical";
export type Consistency = {
  y: boolean | AxisConsistency
  x: boolean | AxisConsistency
}
export type AxisConsistency = {
  value: boolean
  mirrored: boolean
}