import {_CompSpecSolid} from "./comp-spec";
import {Spec} from "./simple-vega-spec";

export type ChartTypes = "scatterplot" | "barchart" | "linechart" | "heatmap" | "NULL";

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

export function isOverlapLayout(spec: _CompSpecSolid) {
  const {type: layout, unit, arrangement} = spec.layout
  return (layout === "superimposition") || (layout === "juxtaposition" && unit === "element") || (arrangement === "animated")
}

export function isNoOverlapLayout(spec: _CompSpecSolid) {
  const {type: layout, unit, arrangement} = spec.layout
  return (layout === "juxtaposition" && unit === "chart" && arrangement !== "animated") ||
    (layout === "superimposition" && unit === "chart");
}

export function isNestingLayout(spec: _CompSpecSolid) {
  const {type: layout, unit} = spec.layout;
  return (layout === "superimposition" && unit === "element");
}

// TODO: clearer name?
export function isNestingLayoutVariation(A: Spec, B: Spec, C: _CompSpecSolid) {
  const {type: layout, unit, arrangement} = C.layout;
  return (layout === "juxtaposition" && unit === "element" && arrangement !== "animated" && getChartType(A) !== getChartType(B));
}

export function isChartAnimated(spec: _CompSpecSolid) {
  const {unit, arrangement} = spec.layout;
  return arrangement === "animated" && unit === "chart";
}
export function isElementAnimated(spec: _CompSpecSolid) {
  const {type: layout, unit, arrangement} = spec.layout;
  return layout === "juxtaposition" && unit === "element" && arrangement === "animated";
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
export function isBothBarChart(A: Spec, B: Spec) {
  return isBarChart(A) && isBarChart(B);
}
export function isBothScatterplot(A: Spec, B: Spec) {
  return isScatterplot(A) && isScatterplot(B);
}
export function isBothHeatmap(A: Spec, B: Spec) {
  return isHeatmap(A) && isHeatmap(B);
}

export function isStackedBarChart(A: Spec, B: Spec, C: _CompSpecSolid) {
  const {type: layout, unit, arrangement} = C.layout;
  return layout === "juxtaposition" && unit === "element" && arrangement === "stacked" && isBothBarChart(A, B);
}
export function isGroupedBarChart(A: Spec, B: Spec, C: _CompSpecSolid) {
  const {type: layout, unit, arrangement} = C.layout;
  return layout === "juxtaposition" && unit === "element" && arrangement === "adjacent" && isBothBarChart(A, B);
}
// Alper et al. Weighted Graph Comparison Techniques for Brain Connectivity Analysis
export function isDivisionHeatmap(A: Spec, B: Spec, C: _CompSpecSolid) {
  const {type: layout, unit, arrangement} = C.layout;
  return layout === "juxtaposition" && unit === "element" && arrangement !== "animated" && isBothHeatmap(A, B);
}
export function isChartUnitScatterplots(A: Spec, B: Spec, C: _CompSpecSolid) {
  const {type: layout, unit} = C.layout;
  return ((layout === "juxtaposition" && unit === "chart") || (layout === "superimposition" && unit === "chart")) &&
    isBothScatterplot(A, B);
}