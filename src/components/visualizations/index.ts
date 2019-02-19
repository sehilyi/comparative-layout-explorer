import {Spec} from "src/models/simple-vega-spec";
import {renderSimpleBarChart, renderBarChart} from "./barcharts";
import {renderSimpleScatterplot, renderScatterplot} from "./scatterplots";
import {ChartStyle} from "./chart-styles";
import {_CompSpecSolid} from "src/models/comp-spec";
import {renderHeatmap, renderSimpleHeatmap} from "./heatmap";
import {canRenderChart, getChartType} from "./constraints";

export function renderSimpleChart(ref: SVGSVGElement, spec: Spec) {
  if (!canRenderChart(spec)) return
  switch (getChartType(spec)) {
    case "scatterplot":
      renderSimpleScatterplot(ref, spec)
      break
    case "barchart":
      renderSimpleBarChart(ref, spec)
      break
    case "linechart":
      //
      break
    case "heatmap":
      renderSimpleHeatmap(ref, spec)
      break
    case "NULL":
      console.log("Chart type is not defined well (NULL type).")
      break
    default:
      break
  }
}

// TODO: this should be combined with renderSimpleChart
export function renderChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[] | number[], y: string[] | number[]},
  styles: ChartStyle) {
  switch (getChartType(spec)) {
    case "scatterplot":
      renderScatterplot(g, spec, domain, styles)
      break
    case "barchart":
      renderBarChart(g, spec, domain, styles)
      break
    case "linechart":
      //
      break
    case "heatmap":
      renderHeatmap(g, spec, domain, styles)
      break
    case "NULL":
      console.log("Chart type is not defined well (NULL type).")
      break
    default:
      break
  }
}