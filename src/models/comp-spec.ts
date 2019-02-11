// Specs are defined here
// https://paper.dropbox.com/doc/Operations--AWlp37~UtWSS83hWWg25wGgxAg-dr2UHiPbc3qvqqS1rQHn1

/**
 * CompSpec with less flexability
 * This is used in the system and not for users
 */
export type _CompSpecSolid = {
  name: string
  layout: LayoutTypeAndStyle  // TODO: how to set default values when only parts are not assigned?
  unit?: CompUnit
  consistency: Consistency
}
export type CompSpec = {
  name: string
  layout: Layout
  unit?: CompUnit
  consistency: Consistency
}
export type Layout = LayoutType | LayoutTypeAndStyle
export type LayoutType = "juxtaposition" | "superimposition" | "blending" | "explicit-encoding"
export type LayoutTypeAndStyle = {
  type: Layout
  mirrored?: boolean
  direction?: CompDirection
}

export type CompDirection = "horizontal" | "vertical" // TODO: when horizontal bar, improper words

export type CompUnit = JuxCompUnit | SupCompUnit
export type commonCompUnit = "chart" | "element"
export type JuxCompUnit = commonCompUnit | "time"
export type SupCompUnit = commonCompUnit | "area" // TODO: think about how to constraint this?

export type ConsistencyConstraint = true | false | null // TODO: change to "same" | "different" | "null" ?
export type Consistency = { // TODO: this should also consider differnce for superimposition
  x_axis?: boolean
  y_axis?: boolean
  x_arrangement?: boolean // divide this to x_positions?
  y_arrangement?: boolean
  color?: ConsistencyConstraint
}

export const DEFAULT_LAYOUT: LayoutTypeAndStyle = {
  type: "juxtaposition",
  // juxtaposition
  mirrored: false,
  direction: "horizontal"
  //
}
export const DEFAULT_COMP_SPEC: CompSpec = {
  name: "",
  layout: DEFAULT_LAYOUT,
  unit: "chart",
  consistency: {x_axis: false, y_axis: false, color: false, x_arrangement: false, y_arrangement: false},
}

/**
 * deprecated
 */
export type AxisConsistency = {
  value: boolean
  mirrored: boolean
}