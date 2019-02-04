// Specs are defined here
// https://paper.dropbox.com/doc/Operations--AWlp37~UtWSS83hWWg25wGgxAg-dr2UHiPbc3qvqqS1rQHn1

export type CompSpec = {
  name: string
  layout: CompType
  unit?: CompUnit
  mirrored?: boolean  // TODO: move to layout??
  direction?: CompDirection
  consistency: Consistency
}
export type CompType = "juxtaposition" | "superimposition" | "blending" | "explicit-encoding"

export type CompDirection = "horizontal" | "vertical"

export type CompUnit = JuxCompUnit | SupCompUnit
export type commonCompUnit = "chart" | "element"
export type JuxCompUnit = commonCompUnit | "time"
export type SupCompUnit = commonCompUnit | "area" // TODO: think about how to constraint this?

export type Consistency = { // TODO: this should also consider differnce for superimposition
  x_axis?: boolean
  y_axis?: boolean
  x_arrangement?: boolean
  y_arrangement?: boolean
  color?: boolean
}

// TODO: separate default by layout
export const DEFAULT_COMP_SPEC: CompSpec = {
  name: "",
  layout: "juxtaposition",
  unit: "chart",
  mirrored: false,
  direction: "horizontal",
  consistency: {x_axis: false, y_axis: false, color: false, x_arrangement: false, y_arrangement: false},
}

/**
 * deprecated
 */
export type AxisConsistency = {
  value: boolean
  mirrored: boolean
}