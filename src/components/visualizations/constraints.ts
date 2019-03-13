import {Spec} from "src/models/simple-vega-spec";
import {isUndefined} from "util";
import {_CompSpecSolid} from "src/models/comp-spec";
import {isScatterplot, isBarChart, getChartType} from "src/models/chart-types";

export function canRenderChart(spec: Spec) {
  let can = true;

  /* exceptions */
  // quantitative type field can not be aggregated
  if (spec.encoding.x.type === "nominal" && spec.encoding.x.aggregate) can = false
  if (spec.encoding.y.type === "nominal" && spec.encoding.y.aggregate) can = false
  if (spec.encoding.color && spec.encoding.color.type === "nominal" && spec.encoding.color.aggregate) can = false
  // in scatterplot, x- and y-aggregation functions should be always used together, and when both of them are used, color should be used
  if (isScatterplot(spec) &&
    (isUndefined(spec.encoding.x.aggregate) && !isUndefined(spec.encoding.y.aggregate) ||
      !isUndefined(spec.encoding.x.aggregate) && isUndefined(spec.encoding.y.aggregate) ||
      (!isUndefined(spec.encoding.x.aggregate) && !isUndefined(spec.encoding.y.aggregate) && isUndefined(spec.encoding.color)))) can = false
  // in bar chart, only one nominal type field should be included
  if (isBarChart(spec) && spec.encoding.y.type === spec.encoding.x.type) can = false

  if (!can) console.log("cannot render this chart.")
  return can
}

export function canRenderCompChart(A: Spec, B: Spec, C: _CompSpecSolid) {
  let can = true;

  // exceptions
  if ((isScatterplot(A) || isScatterplot(B)) &&
    C.layout.type === "juxtaposition" && C.layout.unit === "element" && C.layout.arrangement !== "animated") can = false
  // if (C.layout.type === "juxtaposition" && C.layout.unit === "element" &&
  //   (A.encoding.x.type !== B.encoding.x.type || A.encoding.y.type !== B.encoding.y.type)) can = false
  // nesting
  // visual elements (e.g., bars or points) of A should be aggregated
  if (C.layout.type === "superimposition" && C.layout.unit === "element" && isScatterplot(A) && isUndefined(A.encoding.color)) can = false
  if (C.layout.arrangement === "animated" && C.layout.type === "superimposition") can = false
  if (C.layout.arrangement === "animated" && getChartType(A) !== getChartType(B)) can = false // do not support animated transition between different charts

  if (!can) console.log("error: such comparison is not supported.")
  return can
}

/**
 * Generate simple chart title.
 * @param spec
 */
export function getChartTitle(spec: Spec) {
  // TODO: make this more useful
  return spec.encoding.x.field + " by " + spec.encoding.y.field
}