/* top level CompSpec */
/**
 * CompSpec with less flexability.
 * This is used in the system and not for users.
 */
export interface _CompSpecSolid extends CompSpec {
  layout: LayoutTypeAndStyle;
  consistency: _ConsistencySolid;
}
export type CompSpec = {
  name?: string;
  reference?: CompReference;
  layout: Layout;
  consistency?: Consistency;
  overlap_reduction?: OverlapReduction;
  explicit_encoding?: ExplicitEncoding;

  style?: CompStyle;
}
export type LayoutType = "juxtaposition" | "superimposition" | "explicit-encoding";
export type Layout = LayoutType | LayoutTypeAndStyle;
export type LayoutTypeAndStyle = {
  type: LayoutType;
  unit?: CompUnit;
  mirrored?: boolean;
  arrangement?: CompArrangement;
}
export type CompArrangement = "stacked" | "adjacent" | "animated" | "diagonal" | "null";
export type CompUnit = JuxCompUnit | SupCompUnit;
export type commonCompUnit = "chart" | "element";
export type JuxCompUnit = commonCompUnit | "time";  // deprecated
export type SupCompUnit = commonCompUnit | "area";  // deprecated

/* explicit encoding */
export type ExplicitEncoding = {
  line_connection?: LineConnection;
  // add more...
}
export type LineConnection = {
  type: boolean;
  anchor?: Anchor;
  style?: {};  // e.g., dotted, ...
  // add more... target, source, curvature
}
export type Anchor = "auto" | "top" | "bottom" | "left" | "right" | "center-middle";  // ...

/* consistency */
/**
 * Consistency with less flexibility.
 * This is used in the system and not for users.
 */
export interface _ConsistencySolid extends Consistency {
  color?: ConsistencyTypeAndTarget;
}
export type Consistency = {
  // color refers to hue. we use the term "color" for the consistency with Vega. color does not includes saturation (#51)
  color?: ConsistencyType | ConsistencyTypeAndTarget;
  x_axis?: boolean;
  y_axis?: boolean;
  stroke?: ConsistencyType;  // TODO: this will be removed eventually
  texture?: ConsistencyType;
  // x_arrangement?: boolean
  // y_arrangement?: boolean
}

/* consistency settings */
export type ConsistencyType = "shared" | "independent" | "distinct"
export type ConsistencyTypeAndTarget = {
  type: ConsistencyType;
  primary_target?: {element: ElementType, property: PropertyType};
  secondary_target?: {element: ElementType, property: PropertyType};
}
export type ElementType = "mark" | "axis";
export type PropertyType = "foreground" | "background" | "stroke";

/* clutter reduction strategies */
export type OverlapReduction = {
  opacity?: boolean;
  jitter_x?: boolean;
  jitter_y?: boolean;
  resize?: boolean;
}

export type CompStyle = {
  width?: number;
  height?: number;
}

export type CompReference = "first" | "second";
export const DEFAULT_COMP_REFERENCE = "first";

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

export const DEFAULT_CONSISTENCY_TARGET: ConsistencyTypeAndTarget = {
  type: "independent",
  primary_target: {element: "mark", property: "foreground"},
  secondary_target: {element: "mark", property: "foreground"}
}
export const DEFAULT_CONSISTENCY: _ConsistencySolid = {
  color: DEFAULT_CONSISTENCY_TARGET,
  x_axis: false,
  y_axis: false,
  stroke: "independent",
  texture: "independent"
}
export const DEFAULT_OVERLAP_REDUCTION: OverlapReduction = {
  opacity: false,
  jitter_x: false,
  jitter_y: false,
  resize: false
}
export const DEFAULT_COMP_SPEC: CompSpec = {
  name: "",
  layout: DEFAULT_LAYOUT_JUX,
  consistency: DEFAULT_CONSISTENCY,
  overlap_reduction: DEFAULT_OVERLAP_REDUCTION,
  reference: DEFAULT_COMP_REFERENCE
}
export const DEFAULT_COMP_SPECS = {
  juxtaposition: {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_JUX},
  superimposition: {...DEFAULT_COMP_SPEC, layout: DEFAULT_LAYOUT_SUP},
  "explicit-encoding": {...DEFAULT_COMP_SPEC}
}