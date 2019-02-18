import {Spec} from "src/models/simple-vega-spec";
import {isUndefined} from "util";
import {_CompSpecSolid} from "src/models/comp-spec";
import {deepValue} from "src/models/comp-spec-manager";
import {ChartTypes} from "src/models/chart-types";

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
  if ((isScatterplot(A) || isScatterplot(B)) && deepValue(C.layout) === "juxtaposition" && C.layout.unit === "element") can = false
  if (deepValue(C.layout) === "juxtaposition" && C.layout.unit === "element" &&
    (A.encoding.x.type !== B.encoding.x.type || A.encoding.y.type !== B.encoding.y.type)) can = false
  // nesting
  // visual elements (e.g., bars or points) of A should be aggregated
  if (deepValue(C.layout) === "superimposition" && C.layout.unit === "element" && isScatterplot(A) && isUndefined(A.encoding.color)) can = false

  if (!can) console.log("error: such comparison is not supported.")
  return can
}

/**
 * Get chart type.
 * @param spec
 */
export function getChartType(spec: Spec): ChartTypes {
  if (isScatterplot(spec)) return "scatterplot"
  else if (isBarChart(spec)) return "barchart"
  else if (isLineChart(spec)) return "linechart"
  else if (isHeatmap(spec)) return "heatmap"
  else return "NULL"
}

/**
 * This function checks if this chart contains aggregated visual elements
 * such as bar charts or scatterplots with aggregated points
 * @param spec
 */
export function isChartDataAggregated(spec: Spec) {
  return isBarChart(spec) || isAggregatedScatterplot(spec) || isHeatmap(spec)
}

export function isAggregatedScatterplot(spec: Spec) {
  // when x-aggregate is not undefined, y-aggregate and color are also not undefined
  // refer to canRenderChart
  return isScatterplot(spec) && spec.encoding.x.aggregate !== undefined
}

export function isBarChart(spec: Spec) {
  return spec.mark === "bar" && (
    (spec.encoding.x.type === 'nominal' && spec.encoding.y.type === 'quantitative') ||
    (spec.encoding.x.type === 'quantitative' && spec.encoding.y.type === 'nominal'))
}
export function isScatterplot(spec: Spec) {
  return spec.mark === "point" &&
    spec.encoding.x.type === 'quantitative' && spec.encoding.y.type === 'quantitative'
}
export function isLineChart(spec: Spec) {
  return spec.mark === "line" &&
    spec.encoding.x.type === 'nominal' && spec.encoding.y.type === 'quantitative'  // TODO: should add ordinal?
}
export function isHeatmap(spec: Spec) {
  return spec.mark === "rect"
}