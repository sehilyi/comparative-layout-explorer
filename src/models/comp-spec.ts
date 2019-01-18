// TODO: add spec defaults
export type CompSpec = {
  type: CompType
  direction?: CompDirection
  consistency: Consistency
}
export type CompType = "stack";
export type CompDirection = "horizontal" | "vertical";
export type Consistency = "y-axis";