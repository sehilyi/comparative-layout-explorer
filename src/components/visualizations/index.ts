import {Spec} from "src/models/simple-vega-spec";
import {renderSimpleBarChart, renderBarChart} from "./barcharts";
import {ChartTypes} from "src/models/chart-types";
import {renderSimpleScatterplot, renderScatterplot} from "./scatterplots";
import {ChartStyle} from "./chart-styles";
import {CompSpec} from "src/models/comp-spec";
import {_opacity} from "./design-settings";
import {isUndefined} from "util";

export function renderSimpleChart(ref: SVGSVGElement, spec: Spec) {
  if (!canRenderChart(spec)) return
  switch (getChartType(spec)) {
    case "scatterplot":
      renderSimpleScatterplot(ref, spec)
      break;
    case "barchart":
      renderSimpleBarChart(ref, spec)
      break;
    case "linechart":
      //
      break;
    default:
      break;
  }
}

// TODO: this should be combined with renderSimpleChart
export function renderChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[] | number[], y: string[] | number[]}, // determine the axis range
  s: ChartStyle) {
  switch (getChartType(spec)) {
    case "scatterplot":
      renderScatterplot(g, spec, domain, s)
      break;
    case "barchart":
      renderBarChart(g, spec, domain, s)
      break;
    case "linechart":
      //
      break;
    default:
      break;
  }
}
export function manageZIndex(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec) {
  if (isBarChart(spec))
    g.selectAll('.axis').raise()
}
export function canRenderChart(spec: Spec) {
  let can = true;

  /* exceptions */
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

export function canRenderCompChart(A: Spec, B: Spec, C: CompSpec) {
  let can = true;

  // exceptions
  if ((isScatterplot(A) || isScatterplot(B)) && C.layout === "juxtaposition" && C.unit === "element") can = false
  if (isScatterplot(A) && C.layout === "superimposition" && C.unit === "element") can = false
  if (C.layout === "juxtaposition" && C.unit === "element" &&
    (A.encoding.x.type !== B.encoding.x.type || A.encoding.y.type !== B.encoding.y.type)) can = false
  // horizontal bar chart + vertical bar chart
  if (isBarChart(A) && isBarChart(B) && A.encoding.x.type !== B.encoding.x.type) can = false

  if (!can) console.log("error: such comparison is not supported.")
  return can
}

export function getChartType(spec: Spec): ChartTypes {
  if (isScatterplot(spec)) return "scatterplot"
  else if (isBarChart(spec)) return "barchart"
  else if (isLineChart(spec)) return "linechart"
  else return "scatterplot"
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