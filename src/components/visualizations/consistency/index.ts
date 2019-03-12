import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, DEFAULT_CONSISTENCY, ConsistencyType, _ConsistencySolid, CompSpec} from "src/models/comp-spec";
import {isDeepTrue, ifUndefinedGetDefault} from "src/useful-factory/utils";

export function correctConsistency(A: Spec, B: Spec, C: CompSpec): _ConsistencySolid {
  // fill empty specs
  C = {...C, consistency: {...C.consistency, color: ifUndefinedGetDefault(C.consistency.color, {...DEFAULT_CONSISTENCY.color}) as ConsistencyType}}

  // change to _ConsistencySolid
  if (typeof C.consistency.color === "string") C.consistency.color = {...DEFAULT_CONSISTENCY.color, type: C.consistency.color}
  // fill empty color specs TODO: cover this in a separate function
  if (!C.consistency.color.primary_target) C.consistency.color.primary_target = {...DEFAULT_CONSISTENCY.color.primary_target}
  if (!C.consistency.color.secondary_target) C.consistency.color.secondary_target = {...DEFAULT_CONSISTENCY.color.secondary_target}

  // correction
  if ((C.consistency.color.type === "shared" || C.consistency.color.type === "distinct") &&
    (A.encoding.color && B.encoding.color && A.encoding.color.type !== B.encoding.color.type) //&&
    // TODO:
    // (C.consistency.color.target.primary.element == C.consistency.color.target.secondary.element) &&
    // (C.consistency.color.target.primary.property == C.consistency.color.target.secondary.property)) {
  ) {
    C.consistency.color.type = "independent"
  }

  const cons = {
    color: C.consistency.color,
    x_axis: (isDeepTrue(C.consistency.x_axis) &&
      A.encoding.x.type === B.encoding.x.type),
    // TODO: we should consider what to do when consistency is false for grouped bar chart
    // ||
    // (C.layout.type === "juxtaposition" && C.layout.unit === "element" && C.layout.arrangement !== "animated"), // always true for element-wise jux
    y_axis: (isDeepTrue(C.consistency.y_axis) &&
      A.encoding.y.type === B.encoding.y.type),
    //  ||
    // (C.layout.type === "juxtaposition" && C.layout.unit === "element" && C.layout.arrangement !== "animated"), // always true for element-wise jux
    stroke: ifUndefinedGetDefault(C.consistency.stroke, DEFAULT_CONSISTENCY.stroke),
    texture: ifUndefinedGetDefault(C.consistency.texture, DEFAULT_CONSISTENCY.texture),
  };
  // warnings
  if (cons.y_axis != isDeepTrue(C.consistency.y_axis)) console.log('consistency.y has been changed to ' + cons.y_axis)
  if (cons.x_axis != isDeepTrue(C.consistency.x_axis)) console.log('consistency.x has been changed to ' + cons.x_axis)
  if (cons.color != C.consistency.color) console.log('consistency.color has been changed to ' + cons.color) // TODO:

  return cons
}