import {Spec} from "src/models/simple-vega-spec";
import {renderSimpleBarChart, renderBarChart} from "./barcharts";
import {ChartTypes} from "src/models/chart-types";
import {renderSimpleScatterplot, renderScatterplot} from "./scatterplots";
import {ChartStyle} from "./chart-styles";

export function renderSimpleChart(ref: SVGSVGElement, spec: Spec) {
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
  c: {color: d3.ScaleOrdinal<string, {}>, cKey: string},
  s: ChartStyle) {

  switch (getChartType(spec)) {
    case "scatterplot":
      renderScatterplot(g, spec, domain, c, s)
      break;
    case "barchart":
      renderBarChart(g, spec, domain, c, s)
      break;
    case "linechart":
      //
      break;
    default:
      break;
  }
}

export function getChartType(spec: Spec): ChartTypes {
  if (isScatterplot(spec)) return "scatterplot"
  else if (isBarChart(spec)) return "barchart"
  else if (isLineChart(spec)) return "linechart"
  else return "scatterplot"
}
export function isBarChart(spec: Spec) {
  return spec.mark === "bar" &&
    spec.encoding.x.type === 'nominal' && spec.encoding.y.type === 'quantitative';
}
export function isScatterplot(spec: Spec) {
  return spec.mark === "point" &&
    spec.encoding.x.type === 'quantitative' && spec.encoding.y.type === 'quantitative';
}
export function isLineChart(spec: Spec) {
  return spec.mark === "line" &&
    spec.encoding.x.type === 'nominal' && spec.encoding.y.type === 'quantitative';  // TODO: should add ordinal?
}