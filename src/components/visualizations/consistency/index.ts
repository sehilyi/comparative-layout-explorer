import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, Consistency} from "src/models/comp-spec";
import {isDeepTrue, isUndefinedOrFalse} from "src/useful-factory/utils";

export function correctConsistency(A: Spec, B: Spec, C: CompSpec): Consistency {
  const cons = {
    x_axis: (isDeepTrue(C.consistency.x_axis) &&
      A.encoding.x.type === B.encoding.x.type) ||
      (C.layout === "juxtaposition" && C.unit === "element"), // always true for element-wise jux
    y_axis: (isDeepTrue(C.consistency.y_axis) &&
      A.encoding.y.type === B.encoding.y.type) ||
      (C.layout === "juxtaposition" && C.unit === "element"), // always true for element-wise jux
    color: !isUndefinedOrFalse(C.consistency.color),

    // deprecated
    x_mirrored: typeof C.consistency.x_axis != 'undefined' && C.consistency.x_axis['mirrored'],
    y_mirrored: typeof C.consistency.y_axis != 'undefined' && C.consistency.y_axis['mirrored'],
  };
  // warnings
  if (cons.y_axis != isDeepTrue(C.consistency.y_axis)) console.log('consistency.y has been changed to ' + cons.y_axis)
  if (cons.x_axis != isDeepTrue(C.consistency.x_axis)) console.log('consistency.x has been changed to ' + cons.x_axis)

  return cons
}