/* top level CompSpec */
/**
 * CompSpec with less flexability.
 * This is used in the system and not for users.
 */
export interface _CompSpecSolid extends CompSpec {
  layout: LayoutTypeAndStyle
}
export type CompSpec = {
  name?: string
  layout: Layout
  consistency?: Consistency
  clutter_reduction?: ClutterReduction
  reference?: CompReference
}
export type Layout = LayoutType | LayoutTypeAndStyle
export type LayoutType = "juxtaposition" | "superimposition" | "explicit-encoding" | "blending"
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

/* consistency */
/**
 * Consistency with less flexability.
 * This is used in the system and not for users.
 */
export interface _ConsistencySolid extends Consistency {
  color?: ConsistencyTypeAndTarget
}
export type Consistency = {
  color?: ConsistencyType | ConsistencyTypeAndTarget
  x_axis?: boolean
  y_axis?: boolean
  // x_arrangement?: boolean
  // y_arrangement?: boolean
  stroke?: ConsistencyType  // TODO: this will be removed eventually
}

/* consistency settings */
export const CONSISTENCY_SAME = "SAME", CONSISTENCY_DIFFERENT = "different", CONSISTENCY_UNCONNECTED = "unconnected"  // TODO: use this?
export type ConsistencyType = "same" | "different" | "unconnected"
export type ConsistencyTypeAndTarget = {
  type: ConsistencyType
  target?: ConsistencyTarget
}
export type ElementType = "mark" | "axis-label"
export type PropertyType = "foreground" | "background" | "stroke"
export type ConsistencyTarget = {
  primary?: {element: ElementType, property: PropertyType}
  secondary?: {element: ElementType, property: PropertyType}
}

/* clutter reduction strategies */
export type ClutterReduction = {
  opacity?: boolean
  jitter_x?: boolean
  jitter_y?: boolean
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
export const DEFAULT_CONSISTENCY_TARGET: ConsistencyTarget = {
  primary: {element: "mark", property: "foreground"},
  secondary: {element: "mark", property: "foreground"}
}
export const DEFAULT_CONSISTENCY: _ConsistencySolid = {
  color: {type: "unconnected", target: DEFAULT_CONSISTENCY_TARGET},
  x_axis: false,
  y_axis: false,
  stroke: "unconnected"
}
export const DEFAULT_CLUTTER_REDUCTION: ClutterReduction = {
  opacity: false,
  jitter_x: false,
  jitter_y: false
  // TODO: add here more
}
export const DEFAULT_COMP_SPEC: CompSpec = {
  name: "",
  layout: DEFAULT_LAYOUT_JUX,
  consistency: DEFAULT_CONSISTENCY,
  clutter_reduction: DEFAULT_CLUTTER_REDUCTION,
  reference: DEFAULT_COMP_REFERENCE
}
export const DEFAULT_COMP_SPECS = {
  "juxtaposition": {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_JUX},
  "superimposition": {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_SUP},
  "blending": {...DEFAULT_COMP_SPEC},  // TODO:
  "explicit-encoding": {...DEFAULT_COMP_SPEC} // TODO:
}