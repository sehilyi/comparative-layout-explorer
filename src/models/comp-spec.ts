// Specs are defined here
// https://paper.dropbox.com/doc/Operations--AWlp37~UtWSS83hWWg25wGgxAg-dr2UHiPbc3qvqqS1rQHn1

/**
 * CompSpec with less flexability
 * This is used in the system and not for users
 */
export type _CompSpecSolid = {  // TODO: change this to interface
  name: string
  layout: LayoutTypeAndStyle  // TODO: how to set default values when only parts are not assigned?
  unit?: CompUnit
  consistency: Consistency
  reference: CompReference
}
export type CompSpec = {
  name: string
  layout: Layout
  unit?: CompUnit
  consistency: Consistency
  reference: CompReference
}
export type Layout = LayoutType | LayoutTypeAndStyle
export type LayoutType = "juxtaposition" | "superimposition" | "blending" | "explicit-encoding"
export type LayoutTypeAndStyle = {
  type: LayoutType
  mirrored?: boolean
  arrangement?: CompArrangement
}

export type CompArrangement = "stacked" | "adjacent" | "animated" | "null"

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
  stroke?: boolean
}

export type CompReference = "A" | "B" // TODO: change to priority
export const DEFAULT_COMP_REFERENCE = "A"

export const DEFAULT_LAYOUT_JUX: LayoutTypeAndStyle = {
  type: "juxtaposition",
  mirrored: false,
  arrangement: "adjacent"
}
export const DEFAULT_LAYOUT_SUP: LayoutTypeAndStyle = {
  type: "superimposition",
  mirrored: false,
  arrangement: "null"
}
export const DEFAULT_CONSISTENCY: Consistency = {
  x_axis: false,
  y_axis: false,
  color: false,
  x_arrangement: false,
  y_arrangement: false,
  stroke: false
}
export const DEFAULT_COMP_SPEC: CompSpec = {
  name: "",
  layout: DEFAULT_LAYOUT_JUX,
  unit: "chart",
  consistency: DEFAULT_CONSISTENCY,
  reference: DEFAULT_COMP_REFERENCE
}
export const DEFAULT_COMP_SPECS = {
  "juxtaposition": {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_JUX},
  "superimposition": {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_SUP},
  "blending": {...DEFAULT_COMP_SPEC},  // TODO:
  "explicit-encoding": {...DEFAULT_COMP_SPEC} // TODO:
}

/**
 * deprecated
 */
export type AxisConsistency = {
  value: boolean
  mirrored: boolean
}