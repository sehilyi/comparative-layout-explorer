import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, DEFAULT_CONSISTENCY, ConsistencyType, _ConsistencySolid} from "src/models/comp-spec";
import {isDeepTrue, ifUndefinedGetDefault} from "src/useful-factory/utils";

export function correctConsistency(A: Spec, B: Spec, C: _CompSpecSolid): _ConsistencySolid {
  // fill empty specs
  C = {...C, consistency: {...C.consistency, color: ifUndefinedGetDefault(C.consistency.color, DEFAULT_CONSISTENCY.color) as ConsistencyType}}

  // change to _ConsistencySolid
  if (typeof C.consistency.color === "string") C.consistency.color = {...DEFAULT_CONSISTENCY.color, type: C.consistency.color}
  // fill empty color specs TODO: cover this in a separate function
  if (!C.consistency.color.target) C.consistency.color.target = DEFAULT_CONSISTENCY.color.target
  if (!C.consistency.color.target.primary) C.consistency.color.target.primary = DEFAULT_CONSISTENCY.color.target.primary
  if (!C.consistency.color.target.secondary) C.consistency.color.target.secondary = DEFAULT_CONSISTENCY.color.target.secondary

  // correction
  if ((C.consistency.color.type === "shared" || C.consistency.color.type === "distinct") &&
    (A.encoding.color && B.encoding.color && A.encoding.color.type !== B.encoding.color.type) //&&
    // TODO:
    // (C.consistency.color.target.primary.element == C.consistency.color.target.secondary.element) &&
    // (C.consistency.color.target.primary.property == C.consistency.color.target.secondary.property)) {
  ) {
    C.consistency.color.type = "independant"
  }

  const cons = {
    color: C.consistency.color,
    x_axis: (isDeepTrue(C.consistency.x_axis) &&
      A.encoding.x.type === B.encoding.x.type) ||
      (C.layout.type === "juxtaposition" && C.layout.unit === "element" && C.layout.arrangement !== "animated"), // always true for element-wise jux
    y_axis: (isDeepTrue(C.consistency.y_axis) &&
      A.encoding.y.type === B.encoding.y.type) ||
      (C.layout.type === "juxtaposition" && C.layout.unit === "element" && C.layout.arrangement !== "animated"), // always true for element-wise jux
    stroke: ifUndefinedGetDefault(C.consistency.stroke, DEFAULT_CONSISTENCY.stroke)
  };
  // warnings
  if (cons.y_axis != isDeepTrue(C.consistency.y_axis)) console.log('consistency.y has been changed to ' + cons.y_axis)
  if (cons.x_axis != isDeepTrue(C.consistency.x_axis)) console.log('consistency.x has been changed to ' + cons.x_axis)
  if (cons.color != C.consistency.color) console.log('consistency.color has been changed to ' + cons.color) // TODO:

  return cons
}