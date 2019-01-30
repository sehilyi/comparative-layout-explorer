// Specs are defined here
// https://paper.dropbox.com/doc/Operations--AWlp37~UtWSS83hWWg25wGgxAg-dr2UHiPbc3qvqqS1rQHn1

export type CompSpec = {
  layout: CompType
  unit?: CompUnit
  consistency: Consistency

  mirrored?: boolean
  direction?: CompDirection
}
export type CompType = "juxtaposition" | "superimposition" | "blending" | "explicit-encoding"

export type CompDirection = "horizontal" | "vertical"

export type CompUnit = JuxCompUnit | SupCompUnit
export type commonCompUnit = "chart" | "element"
export type JuxCompUnit = commonCompUnit | "time"
export type SupCompUnit = commonCompUnit | "area" // TODO: think about this more

export type Consistency = {
  x_axis?: boolean
  y_axis?: boolean
  x_arrangement?: boolean
  y_arrangement?: boolean
  color?: boolean
}

// TODO: separate default by layout
export const DEFAULT_COMP_SPEC: CompSpec = {
  layout: "juxtaposition",
  unit: "chart",
  consistency: {x_axis: false, y_axis: false, color: false, x_arrangement: false, y_arrangement: false},
  mirrored: false,
  direction: "horizontal"
}

/**
 * deprecated
 */
export type AxisConsistency = {
  value: boolean
  mirrored: boolean
}