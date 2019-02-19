import {Spec} from "src/models/simple-vega-spec";
import {Consistency, _CompSpecSolid, DEFAULT_CONSISTENCY, ConsistencyType} from "src/models/comp-spec";
import {isDeepTrue, ifUndefinedGetDefault} from "src/useful-factory/utils";
import {deepObjectValue} from "src/models/comp-spec-manager";

export function correctConsistency(A: Spec, B: Spec, C: _CompSpecSolid): Consistency {
  // fill empty specs
  C = {...C, consistency: {...C.consistency, color: ifUndefinedGetDefault(C.consistency.color, DEFAULT_CONSISTENCY.color) as ConsistencyType}}

  let color = C.consistency.color
  if ((C.consistency.color === "same" || C.consistency.color === "different")
    && (A.encoding.color && B.encoding.color && A.encoding.color.type !== B.encoding.color.type)) {
    color = "unconnected"
  }

  const cons = {
    x_axis: (isDeepTrue(C.consistency.x_axis) &&
      A.encoding.x.type === B.encoding.x.type) ||
      (deepObjectValue(C.layout) === "juxtaposition" && C.layout.unit === "element"), // always true for element-wise jux
    y_axis: (isDeepTrue(C.consistency.y_axis) &&
      A.encoding.y.type === B.encoding.y.type) ||
      (deepObjectValue(C.layout) === "juxtaposition" && C.layout.unit === "element"), // always true for element-wise jux
    color,
    stroke: ifUndefinedGetDefault(C.consistency.stroke, DEFAULT_CONSISTENCY.stroke)
  };
  // warnings
  if (cons.y_axis != isDeepTrue(C.consistency.y_axis)) console.log('consistency.y has been changed to ' + cons.y_axis)
  if (cons.x_axis != isDeepTrue(C.consistency.x_axis)) console.log('consistency.x has been changed to ' + cons.x_axis)
  if (cons.color != C.consistency.color) console.log('consistency.color has been changed to ' + cons.color)

  return cons
}