import {CHART_SIZE, getConstantColor, NESTING_PADDING} from "../default-design-manager";
import {_lightgray, ScaleOrdinal, ScaleLinearColor, _white, _black} from "src/useful-factory/d3-str";
import {BarChartStyle, DEFAULT_BARCHART_STYLE} from "./barcharts";
import {ScatterplotStyle, DEFAULT_SCATTERPLOT_STYLE} from "./scatterplots";
import {DEFAULT_HEATMAP_STYLE, HeatmapStyle} from "./heatmap";
import {LegendStyle, DEFAULT_LEGEND_STYLE} from "./legends";
import {AxisStyle, DEFAULT_AXIS_STYLE} from "./axis";

export type ChartStyle = CommonChartStyle

export interface CommonChartStyle
  extends BarChartStyle, ScatterplotStyle, HeatmapStyle, LegendStyle, AxisStyle {

  // chart
  width: number;
  height: number;
  chartId: "A" | "B";
  onTop: boolean;
  opacity: number;
  isChartStroke: boolean;
  nestDim: 0 | 1 | 2;
  nestingPadding: number;

  // element
  elementAnimated: boolean;
  color: ScaleOrdinal | ScaleLinearColor;
  stroke: ScaleOrdinal | ScaleLinearColor;
  strokeKey: string;
  stroke_width: number;
  jitter_x: number;
  jitter_y: number;
  texture: boolean;
  translateX: number;
  translateY: number;
  xSlant: boolean;
  altVals: object[];
  xPreStr: string;
}

export const DEFAULT_CHART_STYLE: CommonChartStyle = {
  // others
  ...DEFAULT_SCATTERPLOT_STYLE,
  ...DEFAULT_BARCHART_STYLE,
  ...DEFAULT_HEATMAP_STYLE,
  ...DEFAULT_LEGEND_STYLE,
  ...DEFAULT_AXIS_STYLE,

  // chart
  width: CHART_SIZE.width,
  height: CHART_SIZE.height,
  chartId: "A",
  onTop: false,
  opacity: 1,
  isChartStroke: false,
  nestDim: 0,
  nestingPadding: NESTING_PADDING,

  // element
  elementAnimated: false,
  color: getConstantColor(),
  stroke: getConstantColor(_white),
  strokeKey: undefined,
  stroke_width: 0,
  jitter_x: 0,
  jitter_y: 0,
  texture: false,
  translateX: 0,
  translateY: 0,
  xSlant: true,
  altVals: undefined,
  xPreStr: "",
}