import {Spec} from "src/models/simple-vega-spec";
import {renderSimpleBarChart, renderBarChart} from "./barcharts";
import {renderSimpleScatterplot, renderScatterplot} from "./scatterplots";
import {ChartStyle} from "./chart-styles";
import {_CompSpecSolid} from "src/models/comp-spec";
import {renderHeatmap, renderSimpleHeatmap} from "./heatmap";
import {canRenderChart} from "./constraints";
import {ScaleOrdinal, ScaleLinearColor, GSelection} from "src/useful-factory/d3-str";
import {getChartType} from "src/models/chart-types";

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
  g: GSelection,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[] | number[], y: string[] | number[]},
  color: ScaleOrdinal | ScaleLinearColor, // this is more proper to provide color scale rather than color domain (to controll consistency)
  styles: ChartStyle) {
  switch (getChartType(spec)) {
    case "scatterplot":
      return renderScatterplot(g, spec, domain, color, styles);
    case "barchart":
      return renderBarChart(g, spec, domain, color, styles);
    case "heatmap":
      return renderHeatmap(g, spec, domain, color, styles);
    case "linechart":
    case "NULL":
    default:
      console.log("Chart type is not defined well (NULL type).");
      return null;
  }
}