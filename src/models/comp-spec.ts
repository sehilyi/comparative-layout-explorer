/**
 * CompSpec with less flexability.
 * This is used in the system and not for users.
 */
export interface _CompSpecSolid extends CompSpec {
  layout: LayoutTypeAndStyle
}
export interface CompSpec {
  name: string
  layout: Layout
  consistency: Consistency
  clutter: ClutterReduction
  reference: CompReference
}
export type Layout = LayoutType | LayoutTypeAndStyle
export type LayoutType = "juxtaposition" | "superimposition" | "blending" | "explicit-encoding"
export type LayoutTypeAndStyle = {
  type: LayoutType
  unit?: CompUnit
  mirrored?: boolean
  arrangement?: CompArrangement
}

export type CompArrangement = "stacked" | "adjacent" | "animated" | "null"

export type CompUnit = JuxCompUnit | SupCompUnit
export type commonCompUnit = "chart" | "element"
export type JuxCompUnit = commonCompUnit | "time"
export type SupCompUnit = commonCompUnit | "area" // TODO: think about how to constraint this?

export type ConsistencyType = "same" | "different" | "unconnected"  // TODO: terms proper?
export type Consistency = { // TODO: this should also consider differnce for superimposition
  x_axis?: boolean
  y_axis?: boolean
  x_arrangement?: boolean // divide this to x_positions?
  y_arrangement?: boolean
  color?: boolean
  stroke?: ConsistencyType
}

export type ClutterReduction = {
  opacity?: boolean
}

export type CompReference = "A" | "B"
export const DEFAULT_COMP_REFERENCE = "A"

export const DEFAULT_LAYOUT_JUX: LayoutTypeAndStyle = {
  type: "juxtaposition",
  unit: "chart",
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
  stroke: "unconnected"
}
export const DEFAULT_CLUTTER_REDUCTION: ClutterReduction = {
  opacity: false
  // TODO: add here
}
export const DEFAULT_COMP_SPEC: CompSpec = {
  name: "",
  layout: DEFAULT_LAYOUT_JUX,
  consistency: DEFAULT_CONSISTENCY,
  clutter: DEFAULT_CLUTTER_REDUCTION,
  reference: DEFAULT_COMP_REFERENCE
}
export const DEFAULT_COMP_SPECS = {
  "juxtaposition": {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_JUX},
  "superimposition": {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_SUP},
  "blending": {...DEFAULT_COMP_SPEC},  // TODO:
  "explicit-encoding": {...DEFAULT_COMP_SPEC} // TODO:
}